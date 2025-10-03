'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Coins, Clock, Copy, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { formatEther } from 'viem';

import { cn } from '@/lib/utils';

export type TaskSummary = {
  id: number;
  creator: `0x${string}`;
  amount: bigint;
  deadline: bigint;
  claimed: boolean;
  refunded: boolean;
  workHash: `0x${string}`;
};

type Props = {
  tasks: TaskSummary[];
  loading: boolean;
  error?: string | null;
  onNewTask: () => void;
  onRefresh: () => void;
};

const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

function formatAmount(amount: bigint) {
  const parsed = Number(formatEther(amount));
  if (!Number.isFinite(parsed)) return '0 ETH';
  if (parsed === 0) return '0 ETH';
  if (parsed >= 1) {
    return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH`;
  }
  return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
}

function getStatus(task: TaskSummary, now: number) {
  if (task.claimed) return { label: 'Claimed', tone: 'emerald' } as const;
  if (task.refunded) return { label: 'Refunded', tone: 'zinc' } as const;
  const deadlineMs = Number(task.deadline) * 1000;
  if (Number.isFinite(deadlineMs) && deadlineMs < now) {
    return { label: 'Expired', tone: 'amber' } as const;
  }
  return { label: 'Open', tone: 'sky' } as const;
}

export default function TaskGrid({ tasks, loading, error, onNewTask, onRefresh }: Props) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(9);
  const now = useMemo(() => Date.now(), [tasks.length, loading]);

  useEffect(() => {
    if (copiedId === null) return;
    const timeout = setTimeout(() => setCopiedId(null), 1600);
    return () => clearTimeout(timeout);
  }, [copiedId]);

  useEffect(() => {
    setVisibleCount((current) => {
      if (tasks.length === 0) return 9;
      return Math.min(Math.max(9, current), tasks.length);
    });
  }, [tasks.length]);

  const visibleTasks = useMemo(() => tasks.slice(0, visibleCount), [tasks, visibleCount]);
  const canLoadMore = visibleTasks.length < tasks.length;

  async function copyTaskId(id: number) {
    try {
      await navigator.clipboard.writeText(String(id));
      setCopiedId(id);
    } catch (err) {
      console.error('clipboard error', err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Latest onchain missions</h3>
          <p className="text-sm text-white/60">
            Pulled directly from TaskBoardEscrow. Share the task id so hunters can inspect the escrow and claim.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#00ffd1]" />}
            Refresh
          </button>
          <button
            onClick={onNewTask}
            className="inline-flex items-center gap-2 rounded-xl border border-[#00ffd1]/40 bg-[#00ffd1]/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#7afff1] transition hover:bg-[#00ffd1]/25"
          >
            Create bounty
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
          {error}
        </div>
      )}

      {loading && visibleTasks.length === 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>
      )}

      {!loading && visibleTasks.length === 0 && !error && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-sm text-white/65">
          No tasks have been funded yet. Kick off the first mission and share the link with your builders.
        </div>
      )}

      {visibleTasks.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTasks.map((task, index) => {
            const status = getStatus(task, now);
            const deadlineMs = Number(task.deadline) * 1000;
            const deadlineLabel = Number.isFinite(deadlineMs)
              ? formatDistanceToNowStrict(new Date(deadlineMs), { addSuffix: true })
              : '—';
            const hasWorkHash = task.workHash && task.workHash !== ZERO_HASH;

            return (
              <motion.article
                key={task.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -12, rotateX: 2, rotateY: -2 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#050b17]/80 p-6 text-sm shadow-[0_18px_55px_rgba(3,9,20,0.5)] backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute -inset-px rounded-3xl border border-white/10 opacity-40 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(220px_220px_at_100%_0%,rgba(0,102,255,0.18),transparent)]" />

                <div className="relative flex items-center justify-between text-xs text-white/65">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-medium uppercase tracking-wide">
                    Task #{task.id}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide',
                      status.tone === 'emerald' && 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100',
                      status.tone === 'zinc' && 'border-white/20 bg-white/10 text-white/70',
                      status.tone === 'sky' && 'border-sky-400/40 bg-sky-500/15 text-sky-100',
                      status.tone === 'amber' && 'border-amber-400/40 bg-amber-400/15 text-amber-100',
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                <h3 className="relative mt-4 text-lg font-semibold text-white">{formatAmount(task.amount)}</h3>

                <div className="relative mt-5 space-y-3 text-xs text-white/70">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-[#00ffd1]" />
                      Creator
                    </span>
                    <span className="font-mono text-[11px] text-white/60">{task.creator.slice(0, 6)}…{task.creator.slice(-4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Deadline
                    </span>
                    <span>{deadlineLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Claim hash
                    </span>
                    <span className="font-mono text-[11px] text-white/50">
                      {hasWorkHash ? `${task.workHash.slice(0, 8)}…${task.workHash.slice(-6)}` : 'Pending' }
                    </span>
                  </div>
                </div>

                <div className="relative mt-6 flex items-center justify-between text-xs text-white/70">
                  <button
                    onClick={() => copyTaskId(task.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 font-semibold uppercase tracking-wide text-white transition hover:bg-white/15"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedId === task.id ? 'Copied' : 'Copy ID'}
                  </button>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
                  >
                    View claim
                    <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {canLoadMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((count) => Math.min(count + 9, tasks.length))}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/15"
          >
            Load more tasks
          </button>
        </div>
      )}
    </div>
  );
}
