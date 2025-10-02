import { notFound } from "next/navigation";
import Link from "next/link";

export default function TaskDeepLink({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold">Task #{id}</h2>
      <p className="text-sm text-zinc-300">
        Paste this id into the explorer on the homepage to inspect escrow details, or jump directly once wallet support is
        enabled. Share this link in your Farcaster frame so hunters can quickly open the claim flow.
      </p>
      <Link href="/" className="w-fit rounded-md bg-sky-600 px-4 py-2 text-sm text-white">
        Back to dashboard
      </Link>
    </div>
  );
}
