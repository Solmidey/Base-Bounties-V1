'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Flame, Twitter, Trophy, PlusCircle, Filter, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import CreateTaskModal from '@/components/ui/CreateTaskModal';
import TaskGrid from '@/components/ui/TaskGrid';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0f13] text-white">
      <Navbar onNewTask={() => setOpen(true)} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* animated base gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_70%_-10%,rgba(0,255,209,0.18),transparent),radial-gradient(900px_500px_at_0%_0%,rgba(0,140,255,0.22),transparent)] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-semibold leading-tight md:text-6xl"
              >
                Ship bounties at the speed of{' '}
                <span className="bg-gradient-to-r from-[#00FFD1] to-[#0085FF] bg-clip-text text-transparent">
                  Base
                </span>
                .
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mt-5 max-w-lg text-white/70"
              >
                Create tasks, sign approvals with EIP-712, and pay out on-chain. A refined marketplace UX that makes
                crypto work feel effortless.
              </motion.p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setOpen(true)}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00FFD1] to-[#0085FF] px-5 py-3 font-medium text-[#061017] shadow-[0_10px_30px_rgba(0,133,255,0.35)]"
                >
                  <PlusCircle className="h-5 w-5" />
                  Create Task
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </button>

                <a
                  href="https://x.com/KamiKaiteneth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur transition hover:bg-white/10"
                >
                  <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                  Follow on X
                </a>

                <Link
                  href="#browse"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-white/80 hover:text-white"
                >
                  <Filter className="h-5 w-5" />
                  Browse bounties
                </Link>
              </div>

              {/* stats */}
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-4 text-center text-sm">
                <Stat label="Active bounties" value="36" icon={<Flame className="h-4 w-4" />} />
                <Stat label="Payouts settled" value="124" icon={<Trophy className="h-4 w-4" />} />
                <Stat label="Avg. time to claim" value="2.1d" icon={<Sparkles className="h-4 w-4" />} />
              </div>
            </div>

            {/* showcase card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-6 shadow-2xl backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Most recent bounty</h3>
                  <p className="mt-1 text-sm text-white/60">
                    Design a Base-themed landing page animation with 3D spark effects.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">Open</span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <MiniStat label="Reward" value="0.25 ETH" />
                <MiniStat label="Deadline" value="3d 8h" />
                <MiniStat label="Applicants" value="12" />
              </div>

              <button
                onClick={() => setOpen(true)}
                className="mt-6 w-full rounded-xl bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur transition hover:bg-white/15"
              >
                Submit proposal
              </button>

              <div className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-[radial-gradient(400px_200px_at_100%_0%,rgba(0,255,209,0.15),transparent),radial-gradient(500px_300px_at_0%_100%,rgba(0,133,255,0.12),transparent)]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* BROWSE */}
      <section id="browse" className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Explore new bounties</h2>
            <Link href="#" className="text-sm text-white/70 hover:text-white">
              View all →
            </Link>
          </div>

          <TaskGrid onNewTask={() => setOpen(true)} />
        </div>
      </section>

      <Footer />

      {/* Modal with onCreated now passed */}
      <CreateTaskModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          // Close the modal and (optionally) refresh data
          setOpen(false);
          // If you fetch tasks server-side, you could call router.refresh() here
        }}
      />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mx-auto flex w-full max-w-[9rem] flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-white/70">
          <span className="h-5 w-5">{icon}</span>
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-lg font-medium">{value}</div>
    </div>
  );
}

