'use client';

import { useState } from 'react';
import CreateTaskModal from '../components/ui/CreateTaskModal';

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-dvh bg-[#0a0f14] text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold">Base Bounties</h1>
        <p className="mt-2 text-white/70">
          Create a bounty escrow on Base and share it with contributors.
        </p>

        <button
          onClick={() => setOpen(true)}
          className="mt-8 rounded-xl bg-gradient-to-r from-[#00FFD1] to-[#0085FF] px-5 py-3 font-semibold text-[#061017]"
        >
          New Bounty
        </button>
      </div>

      <CreateTaskModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
