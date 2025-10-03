'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Calendar, CircleDot, Clock, Coins, Loader2, RefreshCcw } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { formatEther } from 'viem';
import { useReadContract } from 'wagmi';

import { CONTRACT_ADDRESS, CONTRACT_CONFIGURED, TASK_ESCROW_ABI } from '@/lib/utils';

const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

function shorten(address: `0x${string}`) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatReward(amount: bigint) {
  const parsed = Number(formatEther(amount));
  if (!Number.isFinite(parsed) || parsed === 0) return '0 ETH';
  if (parsed >= 1) return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH`;
  return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
}

function formatDeadline(deadline: bigint) {
  const deadlineMs = Number(deadline) * 1000;
  if (!Number.isFinite(deadlineMs) || deadlineMs <= 0) return '—';
  try {
    return formatDistanceToNowStrict(new Date(deadlineMs), { addSuffix: true });
  } catch {
    return '—';
  }
}

function resolveStatus(task: { claimed: boolean; refunded: boolean; deadline: bigint }) {
  if (task.claimed) return { label: 'Claimed', tone: 'emerald' } as const;
  if (task.refunded) return { label: 'Refunded', tone: 'zinc' } as const;
  const deadlineMs = Number(task.deadline) * 1000;
  if (Number.isFinite(deadlineMs) && deadlineMs < Date.now()) {
    return { label: 'Expired', tone: 'amber' } as const;
  }
  return { label: 'Open', tone: 'sky' } as const;
}

export default function TaskDeepLink({ params }: { params: { id: string } }) {
  const idNumber = Number(params.id);
  const isValidId = Number.isFinite(idNumber) && idNumber > 0;

  const { data, refetch, isFetching, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TASK_ESCROW_ABI,
    functionName: 'getTask',
    args: [BigInt(isValidId ? idNumber : 1)],
    query: {
      enabled: CONTRACT_CONFIGURED && isValidId,
    },
  });

  const task = useMemo(() => {
    if (!data || !isValidId) return null;
    return {
      id: idNumber,
      creator: data.creator as `0x${string}`,
      amount: data.amount as bigint,
      deadline: data.deadline as bigint,
      claimed: data.claimed as boolean,
      refunded: data.refunded as boolean,
      workHash: data.workHash as `0x${string}`,
    };
  }, [data, idNumber, isValidId]);

  const status = task ? resolveStatus(task) : null;
  const deadlineLabel = task ? formatDeadline(task.deadline) : null;
  const hasWorkHash = task ? task.workHash !== ZERO_HASH : false;

  return (
    <div className="relative mx-auto mt-24 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#050b17]/85 p-10 text-white shadow-[0_24px_80px_rgba(3,9,20,0.6)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute -inset-px rounded-3xl border border-white/10 opacity-50 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent)]" />
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[#00ffd1]/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#0066ff]/18 blur-3xl" />

      <div className="relative space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
          Deep link
        </span>
        <h2 className="text-3xl font-semibold">Task #{params.id}</h2>

        {!CONTRACT_CONFIGURED && (
          <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            Configure NEXT_PUBLIC_CONTRACT_ADDRESS to load escrow details for this task.
          </p>
        )}

        {!isValidId && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
            The task id must be a positive integer.
          </p>
        )}

        {isValidId && CONTRACT_CONFIGURED && (
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Loader2 className="h-4 w-4 animate-spin" /> Fetching on-chain data…
              </div>
            )}

            {isError && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                Unable to load this task. Confirm that it exists on the configured contract.
              </div>
            )}

            {task && (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <CircleDot className="h-3.5 w-3.5 text-emerald-300" /> {status ? status.label : 'Open'}
                  </span>
                  <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" /> Refresh
                  </button>
                </div>

                <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#040a18]/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white/60">
                      <Coins className="h-4 w-4 text-[#7af6ff]" /> Reward
                    </span>
                    <span className="text-base font-semibold text-white">{formatReward(task.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white/60">
                      <Clock className="h-4 w-4" /> Deadline
                    </span>
                    <span>{deadlineLabel ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white/60">
                      <Calendar className="h-4 w-4" /> Work hash
                    </span>
                    <span className="font-mono text-[11px] text-white/55">
                      {hasWorkHash ? `${task.workHash.slice(0, 8)}…${task.workHash.slice(-6)}` : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white/60">
                      <CircleDot className="h-4 w-4 text-emerald-300" /> Creator
                    </span>
                    <span className="font-mono text-[11px] text-white/55">{shorten(task.creator)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-white/70">
          Share this link with hunters so they can open the claim helper focused on your bounty. Data streams directly from the TaskBoardEscrow contract.
        </p>

        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
        >
          Back to control room
        </Link>
      </div>
    </div>
  );
}
