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
                Ship bounties at the speed of <span className="bg-gradient-to-r from-[#00FFD1] to-[#0085FF] bg-clip-text text-transparent">Base</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mt-5 max-w-lg text-white/70"
              >
                Create tasks, sign approvals with EIP-712, and pay out on-chain. A refined marketplace UX that makes crypto work feel effortless.
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
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-[#00FFD1]/10 px-3 py-1 text-xs font-medium text-[#00FFD1]">Base mainnet</span>
                  <span className="text-xs text-white/60">Escrowed • EIP-712 approvals</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="mb-2 text-sm text-white/70">Bounty preview</div>
                  <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Design “Base-blue” thumbnail</div>
                        <div className="text-xs text-white/60">Deadline: 48h • 0.02 ETH</div>
                      </div>
                      <button
                        onClick={() => setOpen(true)}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#061017]"
                      >
                        Fund
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FILTERS + GRID */}
      <section id="browse" className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Live bounties</h2>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">All</button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Design</button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Frontend</button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Content</button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Research</button>
          </div>
        </div>

        <TaskGrid onNewTask={() => setOpen(true)} />
      </section>

      <Footer />

      <CreateTaskModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-white/70">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

