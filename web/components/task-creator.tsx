"use client";

import { useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, TASK_ESCROW_ABI } from "../lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function TaskCreator() {
  const { isConnected } = useAccount();
  const [deadline, setDeadline] = useState(72);
  const [amount, setAmount] = useState("0.1");
  const { data: hash, isPending, writeContract, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });
  const errorMessage =
    error && typeof error === "object" && error !== null
      ? "shortMessage" in error && typeof (error as any).shortMessage === "string"
        ? (error as any).shortMessage
        : "message" in error && typeof (error as any).message === "string"
          ? (error as any).message
          : String(error)
      : null;

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const hours = Number(formData.get("deadline"));
    const reward = String(formData.get("amount"));

    const seconds = BigInt(Math.floor(Date.now() / 1000 + hours * 3600));

    writeContract({
      abi: TASK_ESCROW_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "createTask",
      args: [seconds],
      value: parseEther(reward)
    });
  };

  return (
    <div className="card flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Create a task</h2>
          <p className="text-sm text-zinc-400">
            Escrow ETH on Base. Metadata is stored offchain (ex: IPFS) and linked in the description you share.
          </p>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm">
          <span>Deadline (hours from now)</span>
          <input
            required
            name="deadline"
            type="number"
            min={1}
            value={deadline}
            onChange={(event) => setDeadline(Number(event.target.value))}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>Reward (ETH)</span>
          <input
            required
            name="amount"
            type="number"
            min={0.0001}
            step={0.0001}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <button type="submit" disabled={!isConnected || isPending || isConfirming}>
          {isPending ? "Confirm in wallet" : isConfirming ? "Waiting for confirmation" : "Create task"}
        </button>
      </form>

      {errorMessage && (
        <div className="rounded-md border border-red-800 bg-red-900/40 p-4 text-sm">
          {errorMessage}
        </div>
      )}

      {isSuccess && (
        <div className="rounded-md border border-emerald-700 bg-emerald-900/40 p-4 text-sm">
          Task created! Index the metadata offchain and share the task id to hunters.
        </div>
      )}
    </div>
  );
}
