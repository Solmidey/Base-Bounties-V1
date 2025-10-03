'use client';

import { Calendar, Coins, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const cards = [
  { title: 'Farcaster Frame for launch', cat: 'Frontend', amount: '0.03 ETH', deadline: '24h' },
  { title: 'Logo in Base palette', cat: 'Design', amount: '0.02 ETH', deadline: '48h' },
  { title: 'Docs polish & README', cat: 'Content', amount: '0.015 ETH', deadline: '36h' },
  { title: 'Benchmark EIP-712 flows', cat: 'Research', amount: '0.025 ETH', deadline: '72h' },
  { title: 'Landing animation', cat: 'Design', amount: '0.04 ETH', deadline: '96h' },
  { title: 'Task subgraph v0', cat: 'Frontend', amount: '0.05 ETH', deadline: '5d' },
];

export default function TaskGrid({ onNewTask }: { onNewTask: () => void }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, index) => (
        <motion.article
          key={card.title}
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
              {card.cat}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {card.deadline}
            </span>
          </div>

          <h3 className="relative mt-4 text-lg font-semibold text-white">{card.title}</h3>

          <div className="relative mt-5 flex items-center justify-between text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-[#00ffd1]" />
              <span className="text-base font-medium text-white">{card.amount}</span>
            </div>
            <button
              onClick={onNewTask}
              className="group/fund relative overflow-hidden rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/15"
            >
              <span className="relative z-10 flex items-center gap-2">
                Fund bounty
                <ArrowRight className="h-4 w-4" />
              </span>
              <span className="absolute inset-0 translate-x-[-40%] bg-white/25 blur-md transition group-hover/fund:translate-x-0" />
            </button>
          </div>

          <div className="relative mt-5 flex items-center gap-2 text-xs text-white/60">
            <Calendar className="h-4 w-4" />
            Deadline visible on-chain after funding
          </div>
        </motion.article>
      ))}
    </div>
  );
}
