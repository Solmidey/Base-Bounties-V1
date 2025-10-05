'use client';

import React, { useEffect } from 'react';
import { WagmiProvider, createConnector } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { http, type EIP1193Provider } from 'viem';
import { getDefaultConfig, RainbowKitProvider, darkTheme, type WalletList } from '@rainbow-me/rainbowkit';
import { injected } from 'wagmi/connectors';
import {
  argentWallet,
  backpackWallet,
  bitgetWallet,
  braveWallet,
  coinbaseWallet,
  dawnWallet,
  enkryptWallet,
  foxWallet,
  imTokenWallet,
  injectedWallet,
  kaikasWallet,
  ledgerWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  talismanWallet,
  trustWallet,
  walletConnectWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { patchWalletConnectModal } from '@/lib/patchWalletConnectModal';

// --- ENV ---
const rawWalletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID?.trim();
export const walletConnectConfigured = Boolean(rawWalletConnectId && rawWalletConnectId.length > 0);
export const walletConnectId = rawWalletConnectId;
export const walletConnectAvailable = walletConnectConfigured;
export const walletConnectUsingFallback = false;
const RPC_MAINNET = process.env.NEXT_PUBLIC_RPC_URL?.trim(); // optional but recommended
const RPC_SEPOLIA = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL?.trim(); // optional if you support testnet

const transports: Record<number, ReturnType<typeof http>> = {};
if (RPC_MAINNET) {
  transports[base.id] = http(RPC_MAINNET);
}
if (RPC_SEPOLIA) {
  transports[baseSepolia.id] = http(RPC_SEPOLIA);
}

// --- Wagmi/RainbowKit config (v2 style) ---
const chains = [base, baseSepolia] as const;

type ZerionCandidate = (EIP1193Provider & {
  isZerion?: true;
  provider?: ZerionCandidate;
}) | undefined;

function extractZerionProvider(candidate: unknown): ZerionCandidate {
  if (!candidate || typeof candidate !== 'object') return undefined;
  const record = candidate as ZerionCandidate;
  if (!record) return undefined;
  if (record.isZerion) return record;
  if (record.provider && record.provider.isZerion) return record.provider;
  return undefined;
}

function getZerionInjectedProvider(): ZerionCandidate {
  if (typeof window === 'undefined') return undefined;
  const win = window as typeof window & {
    zerionWallet?: {
      ethereum?: ZerionCandidate;
      provider?: ZerionCandidate;
    };
    ethereum?: ZerionCandidate & {
      providers?: ZerionCandidate[];
    };
  };

  const providers = win.ethereum?.providers;
  if (Array.isArray(providers)) {
    for (const provider of providers) {
      const extracted = extractZerionProvider(provider);
      if (extracted) return extracted;
    }
  }

  const fallbacks: (ZerionCandidate | undefined)[] = [
    win.ethereum,
    win.zerionWallet?.ethereum,
    win.zerionWallet?.provider,
    win.zerionWallet as ZerionCandidate,
  ];

  for (const candidate of fallbacks) {
    const extracted = extractZerionProvider(candidate);
    if (extracted) return extracted;
  }

  return undefined;
}

const patchedZerionWallet: typeof zerionWallet = (options) => {
  const wallet = zerionInjectedWallet(options);

  const provider = getZerionInjectedProvider();
  if (!provider) {
    return wallet;
  }

  const injectedConfig = {
    target: () => ({
      id: 'zerion-injected',
      name: 'Zerion',
      provider: () => provider,
    }),
  } as const;

  const baseHidden = wallet.hidden;

  return {
    ...wallet,
    hidden: () => baseHidden?.() ?? false,
    installed: true,
    createConnector: (walletDetails) =>
      createConnector((config) => ({
        ...injected(injectedConfig)(config),
        ...walletDetails,
      })),
  };
};

const walletGroups = [
  {
    groupName: 'Popular',
    wallets: [
      rainbowWallet,
      metaMaskWallet,
      coinbaseWallet,
      ...(walletConnectAvailable ? [walletConnectWallet] : []),
      patchedZerionWallet,
      rabbyWallet,
    ],
  },
  {
    groupName: 'More options',
    wallets: [
      braveWallet,
      ...(walletConnectAvailable
        ? [
            trustWallet,
            ledgerWallet,
            argentWallet,
            dawnWallet,
            okxWallet,
            bitgetWallet,
            imTokenWallet,
            phantomWallet,
            talismanWallet,
            foxWallet,
          ]
        : []),
      enkryptWallet,
      backpackWallet,
      kaikasWallet,
      safeWallet,
      injectedWallet,
    ],
  },
] satisfies WalletList;

const DUMMY_WALLETCONNECT_ID = 'placeholder-walletconnect-id';

const config = getDefaultConfig({
  appName: 'Base Bounties',
  projectId: walletConnectId ?? DUMMY_WALLETCONNECT_ID,
  chains,
  transports,
  wallets: walletGroups,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    patchWalletConnectModal();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#00FFD1',
            accentColorForeground: '#001d1a',
            borderRadius: 'large',
            overlayBlur: 'small',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
