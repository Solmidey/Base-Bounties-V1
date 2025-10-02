import { TaskCreator } from "../components/task-creator";
import { TaskExplorer } from "../components/task-explorer";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="card">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="mt-4 space-y-3 text-sm text-zinc-300">
          <li>
            <strong>Creator escrows onchain.</strong> Call <code>createTask()</code> with ETH value and share task metadata (title,
            scope, deliverables) offchain — for example, pin JSON to IPFS and include the CID in the Frame.
          </li>
          <li>
            <strong>Hunter completes the task.</strong> Deliver proof of work (link, IPFS hash). Creator reviews asynchronously.
          </li>
          <li>
            <strong>Creator signs payout.</strong> Using the built-in typed data helper, they sign a Claim struct that specifies
            the task id, hunter, and work hash.
          </li>
          <li>
            <strong>Hunter self-claims.</strong> With the signature they call <code>claim()</code> to pull funds from escrow. If no
            claim happens before the deadline the creator can <code>refund()</code> to recover the escrow.
          </li>
        </ol>
      </section>

      <TaskCreator />
      <TaskExplorer />
    </div>
  );
}
