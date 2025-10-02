'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import type { Address, Abi } from 'viem';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS, TASK_ESCROW_ABI } from '../../lib/utils';

export default function CreateTaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = React.useState('0.01');
  const [hours, setHours] = React.useState(48);
  const [desc, setDesc] = React.useState('');

  const deadlineTs = React.useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return BigInt(now + hours * 3600);
  }, [hours]);

  const { address, isConnected } = useAccount();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  React.useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1217] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create a new bounty</h3>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-white/80">Description (optional)</span>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g., Thumbnail in Base palette"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none placeholder:text-white/40"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm text-white/80">Amount (ETH)</span>
              <input
                type="number"
                min="0"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-white/80">Deadline (hours)</span>
              <input
                type="number"
                min={1}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none"
              />
            </label>
          </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
            Deadline UNIX: <span className="font-mono">{deadlineTs.toString()}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            disabled={!isConnected || isPending || confirming}
            onClick={() =>
              writeContract({
                address: CONTRACT_ADDRESS as Address,
                abi: TASK_ESCROW_ABI as Abi,
                functionName: 'createTask',
                args: [deadlineTs],
                value: parseEther(amount || '0'),
                account: address as Address,
                chain: base,
              })
            }
            className="rounded-xl bg-gradient-to-r from-[#00FFD1] to-[#0085FF] px-4 py-2 text-sm font-semibold text-[#061017] disabled:opacity-60"
          >
            {isPending || confirming ? 'Confirming…' : 'Fund Escrow'}
          </button>
        </div>
      </div>
    </div>
  );
}
