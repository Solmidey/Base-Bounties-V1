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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1217] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create a new bounty</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Title</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 outline-none placeholder:text-white/40"
              placeholder="Design a Base-themed hero"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Amount (ETH)</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 outline-none placeholder:text-white/40"
              placeholder="0.05"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Deadline</span>
            <input
              type="date"
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 outline-none"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-white/80 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // later: call your contract, on success call onCreated()
              onCreated();
            }}
            className="rounded-xl bg-gradient-to-r from-[#00FFD1] to-[#0085FF] px-5 py-2 font-medium text-[#061017] shadow-[0_10px_30px_rgba(0,133,255,0.35)]"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
