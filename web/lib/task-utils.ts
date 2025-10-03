import { formatDistanceStrict } from 'date-fns';
import { formatEther } from 'viem';

export type TaskSummary = {
  id: number;
  creator: `0x${string}`;
  amount: bigint;
  deadline: bigint;
  claimed: boolean;
  refunded: boolean;
  workHash: `0x${string}`;
};

export type TaskStatusTone = 'emerald' | 'zinc' | 'sky' | 'amber';

export type TaskStatus = {
  label: string;
  tone: TaskStatusTone;
};

export const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

export function shortenAddress(address: `0x${string}`) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatReward(amount: bigint) {
  const parsed = Number(formatEther(amount));
  if (!Number.isFinite(parsed) || parsed === 0) return '0 ETH';
  if (parsed >= 1) {
    return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH`;
  }
  return `${parsed.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
}

export function formatEscrowValue(amount: bigint) {
  const parsed = Number(formatEther(amount));
  if (!Number.isFinite(parsed) || parsed === 0) return '0';
  if (parsed >= 1) {
    return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function formatRelativeDeadline(deadline: bigint, now: number = Date.now()) {
  const deadlineMs = Number(deadline) * 1000;
  if (!Number.isFinite(deadlineMs) || deadlineMs <= 0) return '—';
  try {
    return formatDistanceStrict(new Date(deadlineMs), new Date(now), {
      addSuffix: true,
    });
  } catch {
    return '—';
  }
}

export function resolveTaskStatus(
  task: Pick<TaskSummary, 'claimed' | 'refunded' | 'deadline'>,
  now: number = Date.now()
): TaskStatus {
  if (task.claimed) return { label: 'Claimed', tone: 'emerald' };
  if (task.refunded) return { label: 'Refunded', tone: 'zinc' };

  const deadlineMs = Number(task.deadline) * 1000;
  if (Number.isFinite(deadlineMs) && deadlineMs < now) {
    return { label: 'Expired', tone: 'amber' };
  }

  return { label: 'Open', tone: 'sky' };
}

export function hasSubmittedWork(workHash?: `0x${string}` | null) {
  return Boolean(workHash && workHash !== ZERO_HASH);
}

export function formatWorkHash(
  workHash?: `0x${string}` | null,
  options?: { fallback?: string }
) {
  if (!hasSubmittedWork(workHash)) {
    return options?.fallback ?? 'Pending';
  }
  return `${workHash!.slice(0, 8)}…${workHash!.slice(-6)}`;
}
