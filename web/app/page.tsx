'use client';

import {
  ArrowRight,
  Beaker,
  CheckCircle2,
  CircleDot,
  Coins,
  Box,
  Layers3,
  ListChecks,
  Radar,
  Sparkles,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { usePublicClient, useReadContract } from 'wagmi';

import CreateTaskModal from '@/components/ui/CreateTaskModal';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import TaskGrid from '@/components/ui/TaskGrid';
import { CONTRACT_ADDRESS, CONTRACT_CONFIGURED, TASK_ESCROW_ABI } from '@/lib/utils';
import {
  formatEscrowValue,
  formatRelativeDeadline,
  formatReward,
  resolveTaskStatus,
  shortenAddress,
  type TaskSummary,
} from '@/lib/task-utils';

const badges = [
  'On-chain escrow',
  'Cinematic briefs',
  'Real-time payouts',
];

const featureCards = [
  {
    icon: <Layers3 className="h-5 w-5 text-sky-200" />,
    title: 'Modular missions',
    description:
      'Compose creative, product, and research tracks with Base-native gating and auto approvals.',
  },
  {
    icon: <Box className="h-5 w-5 text-emerald-200" />,
    title: '3D-ready templates',
    description:
      'Render-ready briefs keep your art direction consistent—from volumetric frames to shader prompts.',
  },
  {
    icon: <Beaker className="h-5 w-5 text-cyan-200" />,
    title: 'Analytics you can touch',
    description:
      'Granular metrics on applications, releases, and refunds inside an immersive control surface.',
  },
];

const processSteps = [
  {
    title: 'Author the mission',
    icon: <Wand2 className="h-5 w-5" />,
    description:
      'Draft cinematic prompts, attach references, and lock the escrow—all in a single modal.',
  },
  {
    title: 'Signal and review',
    icon: <Radar className="h-5 w-5" />,
    description:
      'Applicants reply with work hashes. Collaborators co-review without exposing the vault.',
  },
  {
    title: 'Release with clarity',
    icon: <ListChecks className="h-5 w-5" />,
    description:
      'Push a single transaction to reward hunters. On-chain receipts stream everywhere instantly.',
  },
];

type GlowPoint = {
  x: number;
  y: number;
  size: number;
  blur: number;
  color: string;
};

const glowPoints: GlowPoint[] = [
  { x: 20, y: 18, size: 320, blur: 140, color: 'rgba(0,170,255,0.25)' },
  { x: 82, y: 28, size: 360, blur: 160, color: 'rgba(0,255,209,0.2)' },
  { x: 48, y: 72, size: 420, blur: 200, color: 'rgba(0,119,255,0.18)' },
];

function useTilt(maxTilt = 14) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(rotateX, { stiffness: 180, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 18 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;

    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;

    rotateX.set((0.5 - relativeY) * maxTilt);
    rotateY.set((relativeX - 0.5) * maxTilt);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return {
    ref,
    rotateX: springX,
    rotateY: springY,
    handlePointerMove,
    reset,
  };
}

function Glare({ rotateX, rotateY }: { rotateX: MotionValue<number>; rotateY: MotionValue<number> }) {
  const glareX = useTransform(rotateY, [-14, 14], [80, -80]);
  const glareY = useTransform(rotateX, [-14, 14], [-80, 80]);

  return (
    <motion.span
      style={{ translateX: glareX, translateY: glareY }}
      className="pointer-events-none absolute inset-16 rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55),rgba(255,255,255,0))] opacity-60 mix-blend-screen"
    />
  );
}

function HeroShowcase({
  onLaunch,
  task,
  contractConfigured,
  contractAddress,
}: {
  onLaunch: () => void;
  task: TaskSummary | null;
  contractConfigured: boolean;
  contractAddress: `0x${string}`;
}) {
  const { ref, rotateX, rotateY, handlePointerMove, reset } = useTilt(16);
  const status = task ? resolveTaskStatus(task) : null;
  const deadlineLabel = task ? formatRelativeDeadline(task.deadline) : null;
  const rewardLabel = task ? formatReward(task.amount) : '—';
  const creatorLabel = task ? shortenAddress(task.creator) : null;
  const contractUrl = `https://basescan.org/address/${contractAddress}`;

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className="relative mx-auto w-full max-w-[500px]"
    >
      <div className="absolute inset-0 -z-20 rounded-[40px] bg-gradient-to-br from-[#0ef7ff]/15 via-[#0a1c3d]/20 to-transparent blur-3xl" />
      <motion.div
        className="absolute inset-5 -z-10 rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(12,35,65,0.82),rgba(4,10,26,0.92))]"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-[#030917]/80 p-7 shadow-[0_32px_90px_rgba(4,13,34,0.65)] backdrop-blur-3xl">
        <Glare rotateX={rotateX} rotateY={rotateY} />
        <div className="grid gap-6 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
              Latest escrow
            </span>
            <span
              className={
                status
                  ? `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] ${
                      status.tone === 'emerald'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
                        : status.tone === 'zinc'
                          ? 'border-white/20 bg-white/10 text-white/70'
                          : status.tone === 'amber'
                            ? 'border-amber-400/40 bg-amber-400/15 text-amber-100'
                            : 'border-sky-400/40 bg-sky-500/15 text-sky-100'
                    }`
                  : 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/60'
              }
            >
              {status ? status.label : 'Awaiting launch'}
            </span>
          </div>
          {task ? (
            <>
              <div className="space-y-3 text-left">
                <h2 className="text-2xl font-semibold text-white">Task #{task.id}</h2>
                <p className="text-xs text-white/60">
                  {rewardLabel} locked by {creatorLabel}.{' '}
                  {deadlineLabel ? `Deadline ${deadlineLabel}.` : 'Deadline pending.'}
                </p>
              </div>
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
                  <span>Reward</span>
                  <span>Deadline</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-white">
                  <span className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[#7af6ff]" /> {rewardLabel}
                  </span>
                  <span className="flex items-center gap-2">
                    <ClockGlyph /> {deadlineLabel ?? '—'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span className="flex items-center gap-2">
                  <CircleDot className="h-4 w-4 text-emerald-300" /> Creator
                </span>
                <span className="font-mono text-[11px] text-white/60">{creatorLabel}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/tasks/${task.id}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#00ffd1] via-[#05c4ff] to-[#0066ff] px-4 py-2 text-sm font-semibold text-[#03110f] shadow-[0_16px_35px_rgba(0,110,255,0.35)] transition hover:shadow-[0_24px_50px_rgba(0,110,255,0.45)]"
                >
                  Open claim helper
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={onLaunch}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  Launch another
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 text-left">
                <h2 className="text-2xl font-semibold text-white">No missions yet</h2>
                <p className="text-xs text-white/60">
                  Fund your first bounty to see it mirrored here instantly. Hunters will be able to inspect escrow without leaving the page.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onLaunch}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#00ffd1] via-[#05c4ff] to-[#0066ff] px-4 py-2 text-sm font-semibold text-[#03110f] shadow-[0_16px_35px_rgba(0,110,255,0.35)] transition hover:shadow-[0_24px_50px_rgba(0,110,255,0.45)]"
                >
                  Create a mission
                  <ArrowRight className="h-4 w-4" />
                </button>
                {contractConfigured && (
                  <Link
                    href={contractUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    View contract
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ClockGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.5" opacity="0.65" />
      <path d="M7 3.5V7L9.4 8.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GlowBackdrop() {
  const gradients = useMemo(
    () =>
      glowPoints.map((point, index) => (
        <span
          key={`${point.x}-${index}`}
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: point.size,
            height: point.size,
            filter: `blur(${point.blur}px)`,
            background: point.color,
          }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      )),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {gradients}
    </div>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(
    CONTRACT_CONFIGURED ? null : 'Set NEXT_PUBLIC_CONTRACT_ADDRESS to load live tasks from the chain.'
  );
  const publicClient = usePublicClient();
  const { data: nextTaskId, refetch: refetchNextTaskId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TASK_ESCROW_ABI,
    functionName: 'nextTaskId',
    query: {
      enabled: CONTRACT_CONFIGURED,
      staleTime: 15_000,
    },
  });

  useEffect(() => {
    if (!CONTRACT_CONFIGURED) {
      setTasks([]);
      setTaskError('Set NEXT_PUBLIC_CONTRACT_ADDRESS to load live tasks from the chain.');
      setLoadingTasks(false);
      return;
    }
    if (!publicClient) return;

    if (!nextTaskId) {
      setLoadingTasks(true);
      return;
    }

    const lastId = Number(nextTaskId) - 1;
    if (lastId <= 0) {
      setTasks([]);
      setTaskError(null);
      setLoadingTasks(false);
      return;
    }

    let ignore = false;
    setLoadingTasks(true);
    setTaskError(null);

    const ids = Array.from({ length: lastId }, (_, index) => BigInt(lastId - index));

    async function loadTasks() {
      try {
        const contracts = ids.map((id) => ({
          address: CONTRACT_ADDRESS,
          abi: TASK_ESCROW_ABI,
          functionName: 'getTask',
          args: [id],
        }));

        const response = await publicClient.multicall({
          contracts,
          allowFailure: true,
          authorizationList: undefined,
          blockNumber: undefined,
          blockOverrides: undefined,
          blockTag: undefined,
          stateOverride: undefined,
        } as any);

        if (ignore) return;

        const mapped = response
          .map((item, idx) => {
            if (item.status !== 'success') return null;
            const value = item.result as {
              creator: `0x${string}`;
              amount: bigint;
              deadline: bigint;
              claimed: boolean;
              refunded: boolean;
              workHash: `0x${string}`;
            };
            return {
              id: Number(ids[idx]),
              creator: value.creator,
              amount: value.amount,
              deadline: value.deadline,
              claimed: value.claimed,
              refunded: value.refunded,
              workHash: value.workHash,
            } satisfies TaskSummary;
          })
          .filter(Boolean) as TaskSummary[];

        setTasks(mapped.sort((a, b) => b.id - a.id));

        if (response.some((item) => item.status === 'failure')) {
          setTaskError('Some tasks failed to load. Try refreshing.');
        }
      } catch (loadError) {
        if (ignore) return;
        console.error('task load error', loadError);
        setTaskError('Unable to read tasks from the contract. Check your RPC configuration.');
        setTasks([]);
      } finally {
        if (!ignore) {
          setLoadingTasks(false);
        }
      }
    }

    loadTasks();

    return () => {
      ignore = true;
    };
  }, [publicClient, nextTaskId, refreshNonce]);

  useEffect(() => {
    if (!CONTRACT_CONFIGURED || refreshNonce === 0) return;
    refetchNextTaskId();
  }, [refreshNonce, refetchNextTaskId]);

  const totalTasks = useMemo(() => {
    if (!CONTRACT_CONFIGURED) return 0;
    if (nextTaskId) return Math.max(Number(nextTaskId) - 1, 0);
    return tasks.length;
  }, [nextTaskId, tasks.length]);

  const openTaskCount = useMemo(() => {
    const current = Date.now();
    return tasks.filter((task) => {
      const deadlineMs = Number(task.deadline) * 1000;
      return !task.claimed && !task.refunded && (!Number.isFinite(deadlineMs) || deadlineMs > current);
    }).length;
  }, [tasks]);

  const totalEscrow = useMemo(() => tasks.reduce((acc, task) => acc + task.amount, 0n), [tasks]);
  const totalEscrowDisplay = useMemo(() => formatEscrowValue(totalEscrow), [totalEscrow]);

  const heroStats = useMemo(
    () =>
      CONTRACT_CONFIGURED
        ? [
            { label: 'Total tasks', value: totalTasks.toLocaleString() },
            { label: 'Open missions', value: openTaskCount.toLocaleString() },
            { label: 'Escrowed ETH', value: `${totalEscrowDisplay} ETH` },
          ]
        : [
            { label: 'Contract status', value: 'Not configured' },
            { label: 'Total tasks', value: '—' },
            { label: 'Escrowed ETH', value: '0 ETH' },
          ],
    [totalTasks, openTaskCount, totalEscrowDisplay]
  );

  const latestTask = tasks.length > 0 ? tasks[0] : null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#02060f] text-white">
      <GlowBackdrop />
      <Navbar onNewTask={() => setOpen(true)} />

      <main className="relative flex-1">
        <section className="relative isolate overflow-hidden pb-24 pt-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(10,78,148,0.45),transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,15,0.4)_0%,rgba(2,6,15,0.95)_80%)]" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center">
            <div className="max-w-xl space-y-10">
              <motion.span
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/60"
              >
                Base bounty studio
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.05 }}
                className="text-4xl font-semibold leading-tight md:text-6xl"
              >
                Launch cinematic missions with on-chain certainty.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-base text-white/70 md:text-lg"
              >
                Base Bounty Studio fuses creative direction with provable escrow. Spin up volumetric briefs, invite collaborators, and reward builders in minutes—all wrapped in a responsive 3D interface.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button
                  onClick={() => setOpen(true)}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00ffd1] via-[#05c4ff] to-[#0066ff] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#021410] shadow-[0_16px_40px_rgba(0,110,255,0.35)] transition hover:shadow-[0_22px_55px_rgba(0,110,255,0.45)]"
                >
                  <Sparkles className="h-5 w-5" />
                  Create bounty
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  href="#browse"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10"
                >
                  Browse live work
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.2 }}
                className="grid gap-4 sm:grid-cols-3"
              >
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/55">{stat.label}</div>
                    <div className="mt-2 text-xl font-semibold text-white">{stat.value}</div>
                  </div>
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25 }}
                className="flex flex-wrap items-center gap-3 text-xs text-white/55"
              >
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {badge}
                  </span>
                ))}
              </motion.div>
            </div>

            <HeroShowcase
              onLaunch={() => setOpen(true)}
              task={latestTask}
              contractConfigured={CONTRACT_CONFIGURED}
              contractAddress={CONTRACT_ADDRESS}
            />
          </div>
        </section>

        <section className="relative border-t border-white/5 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_900px_at_0%_0%,rgba(0,102,255,0.18),transparent),radial-gradient(900px_900px_at_100%_0%,rgba(0,255,209,0.12),transparent)]" />
          <div className="relative mx-auto max-w-6xl space-y-12 px-6">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
                Why builders choose us
              </span>
              <h2 className="text-3xl font-semibold md:text-4xl">A studio-grade workflow for bounty programs.</h2>
              <p className="text-white/70">
                Each mission runs inside a layered interface tuned for creative teams. Visual dashboards, network-aware payouts, and shareable deep links make it effortless to rally your community.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {featureCards.map((feature) => (
                <motion.article
                  key={feature.title}
                  whileHover={{ y: -10 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#050b17]/80 p-6 text-sm shadow-[0_18px_50px_rgba(4,12,28,0.55)] backdrop-blur-2xl"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(220px_220px_at_100%_0%,rgba(0,110,255,0.18),transparent)] opacity-80 transition group-hover:opacity-100" />
                  <div className="relative space-y-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                      {feature.icon}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="browse" className="relative border-t border-white/5 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(7,107,255,0.14),transparent)]" />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
                  Live missions
                </span>
                <h2 className="text-3xl font-semibold md:text-4xl">Plug into the bounty stream.</h2>
                <p className="text-white/70">
                  Explore fast-moving requests curated for Base-native builders. Each card reflects the interactive surfaces hunters will experience inside the wallet.
                </p>
              </div>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Post your own mission
                <Sparkles className="h-4 w-4 text-[#74f8ff]" />
              </button>
            </div>

            <TaskGrid
              tasks={tasks}
              loading={loadingTasks}
              error={taskError}
              onNewTask={() => setOpen(true)}
              onRefresh={() => setRefreshNonce((value) => value + 1)}
            />
          </div>
        </section>

        <section className="relative border-t border-white/5 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_900px_at_10%_0%,rgba(0,102,255,0.18),transparent),radial-gradient(900px_900px_at_90%_0%,rgba(0,255,209,0.16),transparent)]" />
          <div className="relative mx-auto max-w-6xl space-y-12 px-6">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
                How it flows
              </span>
              <h2 className="text-3xl font-semibold md:text-4xl">Guide missions from spark to payout.</h2>
              <p className="text-white/70">
                Studio operators orchestrate every stage from one translucent cockpit. Bounty cards update in real time as your collaborators review work and sign releases.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {processSteps.map((step) => (
                <div key={step.title} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(220px_220px_at_100%_0%,rgba(0,132,255,0.18),transparent)] opacity-60 group-hover:opacity-90" />
                  <div className="relative flex flex-col gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sky-100">
                      {step.icon}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-white/70">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden border-t border-white/5 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(0,110,255,0.2),transparent)]" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
              Ready to launch?
            </span>
            <h2 className="text-3xl font-semibold md:text-4xl">Turn ambitious ideas into Base-native missions.</h2>
            <p className="max-w-2xl text-white/70">
              Connect your wallet, draft a cinematic brief, and push funds into escrow without leaving this screen. Hunters get immersive surfaces, you retain full control.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setOpen(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00ffd1] via-[#05c4ff] to-[#0066ff] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#021410] shadow-[0_16px_40px_rgba(0,110,255,0.35)] transition hover:shadow-[0_22px_55px_rgba(0,110,255,0.45)]"
              >
                Launch a mission
                <Sparkles className="h-5 w-5" />
              </button>
              <Link
                href="/tasks/1"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10"
              >
                Peek at a task deep link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CreateTaskModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false);
          setRefreshNonce((value) => value + 1);
        }}
      />
    </div>
  );
}

