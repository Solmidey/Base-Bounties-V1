'use client';

import * as React from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateTaskModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [deadline, setDeadline] = React.useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#050b17]/90 p-6 shadow-[0_24px_80px_rgba(3,9,20,0.7)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -inset-px rounded-3xl border border-white/10 opacity-50 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent)]" />
        <div className="relative mb-4 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
              Launch bounty
            </span>
            <h2 className="mt-3 text-xl font-semibold">New mission</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-white/60">Title</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-white/30 focus:border-[#00ffd1]/60 focus:ring-2 focus:ring-[#00ffd1]/20"
              placeholder="Design a Base-themed hero"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-white/60">Amount (ETH)</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-white/30 focus:border-[#00ffd1]/60 focus:ring-2 focus:ring-[#00ffd1]/20"
              placeholder="0.05"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.2em] text-white/60">Deadline</span>
            <input
              type="date"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-[#00ffd1]/60 focus:ring-2 focus:ring-[#00ffd1]/20"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>
        </div>

        <div className="relative mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onCreated();
              setTitle('');
              setAmount('');
              setDeadline('');
            }}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00ffd1] via-[#05c4ff] to-[#0066ff] px-5 py-2 text-sm font-medium text-[#001b16] shadow-[0_18px_45px_rgba(0,102,255,0.35)] transition hover:shadow-[0_24px_60px_rgba(0,102,255,0.45)]"
          >
            <span className="relative z-10">Create bounty</span>
            <span className="absolute inset-0 translate-x-[-40%] bg-white/25 blur-lg transition group-hover:translate-x-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
