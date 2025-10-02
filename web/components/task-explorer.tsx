"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { useAccount, useReadContract, useWriteContract, useSignTypedData, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { Address, formatEther, isAddress } from "viem";
import { CONTRACT_ADDRESS, TASK_ESCROW_ABI, CLAIM_TYPED_DATA } from "../lib/utils";
import { BadgeCheck, CircleAlert, FileText, HandCoins, Loader2, RefreshCcw } from "lucide-react";
import clsx from "clsx";

function formatStatus(task: any) {
  if (task.claimed) return { label: "Claimed", tone: "emerald" };
  if (task.refunded) return { label: "Refunded", tone: "zinc" };
  return { label: "Open", tone: "sky" };
}

export function TaskExplorer() {
  const [taskId, setTaskId] = useState(1);
  const [workHash, setWorkHash] = useState("");
  const [hunterAddress, setHunterAddress] = useState<string>("");
  const [signatureInput, setSignatureInput] = useState<string>("");
  const [generatedSignature, setGeneratedSignature] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();

  const { data, refetch, isFetching, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TASK_ESCROW_ABI,
    functionName: "getTask",
    args: [BigInt(taskId)],
    query: {
      enabled: !!taskId
    }
  });

  const { data: nextTaskId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TASK_ESCROW_ABI,
    functionName: "nextTaskId"
  });

  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
  const { writeContractAsync, data: txHash, isPending: isWriting } = useWriteContract();
  const { isLoading: isClaimLoading, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const task = data as
    | {
        creator: Address;
        amount: bigint;
        deadline: bigint;
        claimed: boolean;
        refunded: boolean;
        workHash: `0x${string}`;
      }
    | undefined;

  const status = useMemo(() => (task ? formatStatus(task) : null), [task]);

  useEffect(() => {
    if (address && hunterAddress === "") {
      setHunterAddress(address);
    }
  }, [address, hunterAddress]);

  useEffect(() => {
    if (taskId > 0) {
      refetch();
    }
  }, [taskId, refetch]);

  async function signClaim() {
    if (!task || !address) return;
    const signature = await signTypedDataAsync({
      domain: {
        name: "TaskBoardEscrow",
        version: "1",
        chainId: chainId ?? 8453,
        verifyingContract: CONTRACT_ADDRESS
      },
      ...CLAIM_TYPED_DATA,
      message: {
        taskId: BigInt(taskId),
        hunter: hunterAddress as Address,
        workHash: workHash as `0x${string}`
      }
    });
    setGeneratedSignature(signature);
    setSignatureInput(signature);
    setCopied(false);
    return signature;
  }

  async function submitClaim() {
    if (!signatureInput) return;
    await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: TASK_ESCROW_ABI,
      functionName: "claim",
      args: [BigInt(taskId), hunterAddress as Address, workHash as `0x${string}`, signatureInput as `0x${string}`]
    });
  }

  const deadlineLabel = task
    ? formatDistanceToNowStrict(new Date(Number(task.deadline) * 1000), {
        addSuffix: true
      })
    : null;

  const explorerUrl = `https://basescan.org/address/${CONTRACT_ADDRESS}`;

  return (
    <div className="card flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Task explorer & claim</h2>
          <p className="text-sm text-zinc-400">
            Plug the task id shared by the creator to inspect escrow details, craft a work hash (IPFS CID) and produce the
            claim signature. The creator signs offchain; the hunter calls <code>claim</code> onchain.
          </p>
        </div>
        <a className="badge" href={explorerUrl} target="_blank" rel="noreferrer">
          View contract
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span>Task ID</span>
          <input
            type="number"
            min={1}
            value={taskId}
            onChange={(event) => setTaskId(Number(event.target.value))}
            onBlur={() => refetch()}
          />
        </label>
        <div className="grid gap-2 text-sm">
          <span>Latest Task ID</span>
          <div className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300">
            {nextTaskId ? Number(nextTaskId) - 1 : "–"}
          </div>
        </div>
      </div>

      <button className="w-fit" onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />} Refresh task
      </button>

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-red-800 bg-red-900/40 p-4 text-sm">
          <CircleAlert className="h-4 w-4" />
          Unable to load task. Confirm the task id exists.
        </div>
      )}

      {task && (
        <div className="grid gap-6">
          <div className="grid gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Creator</span>
              <span className="font-mono text-xs">{task.creator}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Reward</span>
              <span className="font-semibold">{formatEther(task.amount)} ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Deadline</span>
              <span>{deadlineLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Status</span>
              {status && (
                <span
                  className={clsx(
                    "badge",
                    status.tone === "emerald" && "bg-emerald-800 text-emerald-100",
                    status.tone === "zinc" && "bg-zinc-800 text-zinc-200",
                    status.tone === "sky" && "bg-sky-800 text-sky-100"
                  )}
                >
                  {status.label}
                </span>
              )}
            </div>
            {task.workHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Work hash</span>
                <span className="font-mono text-xs">{task.workHash}</span>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Generate claim</h3>
            <p className="text-sm text-zinc-400">
              Creator signs an EIP-712 message for the hunter. When the hunter submits the transaction the contract
              validates the signature and releases funds.
            </p>

            <label className="grid gap-2 text-sm">
              <span>Hunter address</span>
              <input
                value={hunterAddress}
                onChange={(event) => {
                  setHunterAddress(event.target.value);
                }}
                placeholder="0xabc..."
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span>Work hash (IPFS CID digest)</span>
              <input value={workHash} onChange={(event) => setWorkHash(event.target.value)} placeholder="0x..." />
            </label>

            <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="badge bg-zinc-800 text-zinc-300">
                <FileText className="mr-1 inline h-3 w-3" />
                Prepare metadata → pin JSON on IPFS
              </span>
              <span className="badge bg-zinc-800 text-zinc-300">
                <BadgeCheck className="mr-1 inline h-3 w-3" />
                Creator signs claim
              </span>
              <span className="badge bg-zinc-800 text-zinc-300">
                <HandCoins className="mr-1 inline h-3 w-3" />
                Hunter submits claim()
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="w-fit"
                disabled={
                  !task ||
                  !isAddress(hunterAddress || "") ||
                  !workHash.startsWith("0x") ||
                  workHash.length !== 66 ||
                  isSigning
                }
                onClick={() => signClaim()}
              >
                {isSigning ? "Signing..." : "Generate signature"}
              </button>

              <button
                type="button"
                className="w-fit"
                disabled={
                  !task ||
                  !isAddress(hunterAddress || "") ||
                  !workHash.startsWith("0x") ||
                  workHash.length !== 66 ||
                  signatureInput.length === 0 ||
                  !signatureInput.startsWith("0x") ||
                  signatureInput.length !== 132 ||
                  isClaimLoading ||
                  isWriting
                }
                onClick={() => submitClaim()}
              >
                {isClaimLoading || isWriting ? "Submitting claim" : "Submit claim"}
              </button>
            </div>

            <label className="grid gap-2 text-sm">
              <span>Signature (paste from creator)</span>
              <textarea
                className="min-h-[120px]"
                value={signatureInput}
                onChange={(event) => setSignatureInput(event.target.value.trim())}
                placeholder="0x..."
              />
            </label>

            {generatedSignature && (
              <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900/60 p-4 text-xs text-zinc-300">
                <span>Signature generated. Share it with the hunter securely.</span>
                <button
                  type="button"
                  className="rounded-md bg-zinc-800 px-3 py-1 text-xs hover:bg-zinc-700"
                  onClick={async () => {
                    try {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        await navigator.clipboard.writeText(generatedSignature);
                        setCopied(true);
                      }
                    } catch (error) {
                      console.error("Clipboard error", error);
                    }
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}

            {claimSuccess && (
              <div className="rounded-md border border-emerald-800 bg-emerald-900/40 p-4 text-sm">
                Claim successful! Funds released to hunter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
