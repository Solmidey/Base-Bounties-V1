'use client';

import { Calendar, Coins, Clock, ArrowRight } from 'lucide-react';

export default function TaskGrid({ onNewTask }: { onNewTask: () => void }) {
  const cards = [
    { title: 'Farcaster Frame for launch', cat: 'Frontend', amount: '0.03 ETH', deadline: '24h' },
    { title: 'Logo in Base palette',       cat: 'Design',   amount: '0.02 ETH', deadline: '48h' },
    { title: 'Docs polish & README',       cat: 'Content',  amount: '0.015 ETH', deadline: '36h' },
    { title: 'Benchmark EIP-712 flows',    cat: 'Research', amount: '0.025 ETH', deadline: '72h' },
    { title: 'Landing animation',          cat: 'Design',   amount: '0.04 ETH',  deadline: '96h' },
    { title: 'Task subgraph v0',           cat: 'Frontend', amount: '0.05 ETH',  deadline: '5d' },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c, i) => (
        <article
          key={i}
          className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:translate-y-[-2px] hover:bg-white/[0.05]"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">{c.cat}</span>
            <span className="flex items-center gap-1 text-xs text-white/60">
              <Clock className="h-4 w-4" /> {c.deadline}
            </span>
          </div>

          <h3 className="text-lg font-semibold">{c.title}</h3>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Coins className="h-4 w-4" />
              {c.amount}
            </div>
            <button
              onClick={onNewTask}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00FFD1] to-[#0085FF] px-3 py-2 text-sm font-semibold text-[#061017]"
            >
              Fund
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
            <Calendar className="h-4 w-4" />
            Deadline visible on-chain after funding
          </div>
        </article>
      ))}
    </div>
  );
}
