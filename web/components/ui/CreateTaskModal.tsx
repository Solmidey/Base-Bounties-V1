'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { X, Loader2, ArrowUpRight } from 'lucide-react';
import { parseEther } from 'viem';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { base } from 'wagmi/chains';

import WalletButton from '@/components/ui/WalletButton';
import { CONTRACT_ADDRESS, CONTRACT_CONFIGURED, TASK_ESCROW_ABI } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

function formatError(error: unknown) {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const maybeMessage =
      (error as { shortMessage?: string; message?: string }).shortMessage ??
      (error as { message?: string }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
  }
  return 'Something went wrong. Please try again.';
}

function toLocalDateTimeInput(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
}

function defaultDeadlineValue() {
  return toLocalDateTimeInput(new Date(Date.now() + 60 * 60 * 1000));
}

export default function CreateTaskModal({ open, onClose, onCreated }: Props) {
  const { address, chain, isConnected } = useAccount();
  const [amount, setAmount] = useState('0.05');
  const [deadline, setDeadline] = useState(() => defaultDeadlineValue());
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: txHash, isPending, writeContractAsync, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
  });

  const wrongNetwork = Boolean(chain && chain.id !== base.id);
  const minDeadline = useMemo(() => toLocalDateTimeInput(new Date(Date.now() + 60_000)), [open]);
  const canSubmit = isConnected && !wrongNetwork && CONTRACT_CONFIGURED;

  const errorMessage = useMemo(() => localError ?? formatError(error), [localError, error]);
  const submitLabel = useMemo(() => {
    if (!isConnected) return 'Connect a wallet';
    if (wrongNetwork) return 'Switch to Base';
    if (!CONTRACT_CONFIGURED) return 'Contract not configured';
    if (isPending) return 'Confirm in wallet';
    if (isConfirming) return 'Waiting for confirmation';
    return 'Create bounty';
  }, [isConnected, wrongNetwork, isPending, isConfirming]);

  useEffect(() => {
    if (open) {
      setLocalError(null);
      reset();
      setAmount('0.05');
      setDeadline(defaultDeadlineValue());
    }
  }, [open, reset]);

  useEffect(() => {
    if (isSuccess) {
      setAmount('0.05');
      setDeadline(defaultDeadlineValue());
      onCreated();
    }
  }, [isSuccess, onCreated]);

  useEffect(() => {
    if (!open) return;
    if (!deadline) {
      setDeadline(defaultDeadlineValue());
      return;
    }
    const current = new Date(deadline).getTime();
    const minimum = new Date(minDeadline).getTime();
    if (!Number.isFinite(current) || !Number.isFinite(minimum) || current < minimum) {
      setDeadline(minDeadline);
    }
  }, [deadline, minDeadline, open]);

  useEffect(() => {
    if (!open) return;
    setLocalError(null);
  }, [address, chain?.id, open]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!CONTRACT_CONFIGURED) {
      setLocalError('Set NEXT_PUBLIC_CONTRACT_ADDRESS to enable bounty creation.');
      return;
    }

    if (!deadline) {
      setLocalError('Choose a deadline for the bounty.');
      return;
    }

    const timestamp = Math.floor(new Date(deadline).getTime() / 1000);
    if (!Number.isFinite(timestamp) || timestamp <= Math.floor(Date.now() / 1000) + 60) {
      setLocalError('Deadline must be at least one minute in the future.');
      return;
    }

    const sanitizedAmount = amount.trim();

    if (!sanitizedAmount || Number(sanitizedAmount) <= 0) {
      setLocalError('Enter an escrow amount greater than zero.');
      return;
    }

    if (!address) {
      setLocalError('Connect a wallet to fund the bounty.');
      return;
    }

    if (chain && chain.id !== base.id) {
      setLocalError('Switch to the Base network to fund the bounty.');
      return;
    }

    let parsedAmount: bigint;
    try {
      parsedAmount = parseEther(sanitizedAmount);
    } catch {
      setLocalError('Enter a valid ETH amount (for example 0.05).');
      return;
    }

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: TASK_ESCROW_ABI,
        functionName: 'createTask',
        args: [BigInt(timestamp)],
        value: parsedAmount,
        // wagmi v2 accepts these; casting keeps TS quiet across minor versions.
        chainId: (chain?.id ?? base.id) as typeof base.id,
        account: address,
      } as any);
    } catch (submissionError) {
      setLocalError(formatError(submissionError));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[36px] border border-white/10 bg-[#050b17]/92 p-8 shadow-[0_32px_120px_rgba(4,10,25,0.72)] backdrop-blur-3xl">
        <div className="pointer-events-none absolute -inset-px rounded-[36px] border border-white/10 opacity-40 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent)]" />
        <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-lg space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
              Launch bounty
            </span>
            <h2 className="text-2xl font-semibold text-white">Create a mission</h2>
            <p className="text-sm text-white/70">
              Escrow ETH directly into the TaskBoardEscrow contract. Share metadata links (IPFS, briefs) in the optional
              notes field so hunters understand the deliverable.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WalletButton
              variant="ghost"
              label={isConnected ? 'Switch wallet' : 'Connect wallet'}
              className="border-white/15 text-white"
            />
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form className="relative grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                Escrow amount (ETH)
              </span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#00ffd1]/60 focus:ring-2 focus:ring-[#00ffd1]/20"
                placeholder="0.05"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                min={0}
                step={0.0001}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                Deadline
              </span>
              <input
                type="datetime-local"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#00ffd1]/60 focus:ring-2 focus:ring-[#00ffd1]/20"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
                min={minDeadline}
              />
            </label>
          </div>

          {!isConnected && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              Connect a wallet to fund the bounty. We support every connector in the picker above.
            </div>
          )}

          {wrongNetwork && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              Switch to the Base network to continue.
            </div>
          )}

          {!CONTRACT_CONFIGURED && (
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-xs text-sky-100">
              Set NEXT_PUBLIC_CONTRACT_ADDRESS to enable bounty creation.
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
              {errorMessage}
            </div>
          )}

          {isSuccess && txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/20"
            >
              <ArrowUpRight className="h-4 w-4" />
              Bounty created. View transaction on BaseScan.
            </a>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isPending || isConfirming}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#00ffd1] via-[#05c4ff] to-[#0066ff] px-5 py-2 text-sm font-medium text-[#001b16] shadow-[0_18px_45px_rgba(0,102,255,0.35)] transition hover:shadow-[0_24px_60px_rgba(0,102,255,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {(isPending || isConfirming) && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="relative z-10">{submitLabel}</span>
              <span className="absolute inset-0 translate-x-[-40%] bg-white/25 blur-lg transition group-hover:translate-x-0" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

