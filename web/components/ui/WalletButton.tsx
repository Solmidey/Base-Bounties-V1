'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, LogOut, Wallet } from 'lucide-react';
import type { Connector } from 'wagmi';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { cn } from '@/lib/utils';
import { walletConnectAvailable, walletConnectUsingFallback } from '@/components/providers';

export default function WalletButton({
  className,
  label = 'Connect wallet',
  variant = 'solid',
}: {
  className?: string;
  label?: string;
  variant?: 'solid' | 'ghost';
}) {
  const { address, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectAsync, connectors, error, status, reset } = useConnect();
  const [open, setOpen] = useState(false);
  const [activeConnectorId, setActiveConnectorId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  const isBusy = isConnecting || status === 'pending';

  useEffect(() => {
    if (open && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [open]);

  async function handleConnect(connectorId: string) {
    const connector = connectors.find((item) => item.uid === connectorId || item.id === connectorId);
    if (!connector) return;
    if (connector.type === 'walletConnect' && !walletConnectAvailable) {
      setLocalError('WalletConnect is temporarily unavailable.');
      return;
    }
    try {
      setActiveConnectorId(connectorId);
      setLocalError(null);
      await connectAsync({ connector });
      setOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('Unable to connect. Please try another wallet.');
      }
    } finally {
      setActiveConnectorId(null);
    }
  }

  function handleDisconnect() {
    disconnect();
    reset();
    setLocalError(null);
  }

  const groupedConnectors = useMemo(() => {
    const typedConnectors = connectors.map((connector, index) => {
      const extended = connector as Connector & {
        rkDetails?: {
          id?: string;
          name?: string;
          iconUrl?: string;
          iconBackground?: string;
          groupIndex?: number;
          groupName?: string;
          isWalletConnectModalConnector?: boolean;
        };
      };

      const rkDetails = extended.rkDetails ?? {};

      return {
        connector,
        index,
        rkDetails,
        displayName: rkDetails.name ?? connector.name,
        displayId: rkDetails.id ?? connector.id ?? connector.uid ?? `connector-${index}`,
        groupIndex: rkDetails.groupIndex ?? 999,
        groupName: rkDetails.groupName ?? 'Other wallets',
        isWalletConnectModalConnector: Boolean(rkDetails.isWalletConnectModalConnector),
      };
    });

    const groups = new Map<
      number,
      {
        label: string;
        items: (typeof typedConnectors)[number][];
      }
    >();

    for (const item of typedConnectors) {
      const key = item.groupIndex;
      const existing = groups.get(key);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(key, {
          label: item.groupName,
          items: [item],
        });
      }
    }

    return Array.from(groups.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => ({
        label: value.label,
        items: value.items.sort((a, b) => a.index - b.index),
      }));
  }, [connectors]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd1]/60',
          variant === 'solid' && 'border border-white/15 bg-white/10 text-white hover:bg-white/15',
          variant === 'ghost' && 'border border-white/10 bg-transparent text-white/80 hover:text-white',
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Wallet className="h-4 w-4" />
        {address ? shortAddress : label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-10">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl text-sm text-white">
            <div className="relative max-h-[min(88vh,680px)] overflow-hidden rounded-3xl border border-white/12 bg-[#040916]/95 shadow-[0_30px_90px_rgba(2,12,30,0.65)]">
              <div className="pointer-events-none absolute -inset-px rounded-[26px] border border-white/10 opacity-40 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.8),transparent)]" />
              <div ref={scrollAreaRef} className="relative max-h-[min(88vh,680px)] overflow-y-auto px-5 py-6 sm:px-6 sm:py-7">
                <div className="space-y-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-[0.35em] text-white/50">Wallets</span>
                      <h2 className="mt-2 text-xl font-semibold">Choose how you connect</h2>
                      <p className="mt-1 text-xs text-white/55">
                        Select any wallet below. We surface every connector so teams can onboard without scrolling.
                      </p>
                    </div>
                    {address && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Disconnect
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {groupedConnectors.map((group, groupIndex) => (
                      <div key={`${group.label}-${groupIndex}`} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                            {group.label}
                          </span>
                        </div>
                        <div className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                          {group.items.map(({ connector, displayName, displayId }) => {
                            const envDisabled = connector.type === 'walletConnect' && !walletConnectAvailable;
                            const requiresInjectedProvider = connector.type === 'injected';
                            const disabled =
                              envDisabled ||
                              (requiresInjectedProvider && !connector.ready) ||
                              isBusy ||
                              (activeConnectorId !== null &&
                                activeConnectorId !== connector.uid &&
                                activeConnectorId !== connector.id);
                            const isLoading = activeConnectorId === connector.uid || activeConnectorId === connector.id;
                            const helperText = envDisabled
                              ? 'WalletConnect unavailable'
                              : requiresInjectedProvider && !connector.ready
                                ? 'Install to enable'
                                : connector.ready
                                  ? address
                                    ? 'Switch wallet'
                                    : 'Connect instantly'
                                  : 'Connect instantly';
                            const chipLabel =
                              connector.type === 'walletConnect'
                                ? 'WalletConnect'
                                : connector.type === 'injected'
                                  ? 'Browser'
                                  : 'External';

                            return (
                              <button
                                key={connector.uid || displayId}
                                type="button"
                                onClick={() => handleConnect(connector.uid || connector.id)}
                                disabled={(disabled && !isLoading) || envDisabled}
                                className={cn(
                                  'group relative w-full overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-left transition',
                                  envDisabled
                                    ? 'cursor-not-allowed opacity-60'
                                    : disabled && !isLoading
                                      ? 'cursor-not-allowed opacity-50'
                                      : 'hover:border-[#00ffd1]/50 hover:bg-white/[0.08]',
                                )}
                              >
                                <div className="relative flex items-center justify-between gap-3">
                                  <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-sm font-medium text-white">{displayName}</span>
                                    <span
                                      className={cn(
                                        'text-xs',
                                        envDisabled
                                          ? 'text-amber-300/80'
                                          : connector.ready
                                            ? 'text-white/60'
                                            : 'text-amber-300/80',
                                      )}
                                    >
                                      {helperText}
                                    </span>
                                  </div>
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-[#00ffd1]" />
                                  ) : (
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70 transition group-hover:bg-[#00ffd1]/20 group-hover:text-white">
                                      {chipLabel}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {walletConnectUsingFallback && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                      WalletConnect is using a shared project ID. Set NEXT_PUBLIC_WALLETCONNECT_ID to use your own credentials and remove
                      this notice.
                    </div>
                  )}

                  {(error || localError) && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                      {localError || error?.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
