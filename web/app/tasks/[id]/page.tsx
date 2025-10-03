import Link from 'next/link';

export default function TaskDeepLink({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="relative mx-auto mt-24 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#050b17]/85 p-10 text-white shadow-[0_24px_80px_rgba(3,9,20,0.6)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute -inset-px rounded-3xl border border-white/10 opacity-50 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent)]" />
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[#00ffd1]/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#0066ff]/18 blur-3xl" />

      <div className="relative space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
          Deep link
        </span>
        <h2 className="text-3xl font-semibold">Task #{id}</h2>
        <p className="text-sm text-white/70">
          Paste this identifier into the explorer on the homepage to inspect escrow details, or jump directly once wallet support is enabled. Share this link in your Farcaster frame so hunters can open the claim flow instantly.
        </p>

        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
        >
          Back to control room
        </Link>
      </div>
    </div>
  );
}
