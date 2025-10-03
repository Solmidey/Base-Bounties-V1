export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#030915]/80">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_220px_at_50%_0%,rgba(0,102,255,0.18),transparent)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-12 text-center">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
          Keep shipping
        </span>
        <p className="max-w-xl text-sm text-white/70">
          Built for the Base ecosystem • Follow{' '}
          <a
            className="text-white underline-offset-4 transition hover:text-white/90 hover:underline"
            href="https://x.com/KamiKaiteneth"
            target="_blank"
            rel="noreferrer"
          >
            @KamiKaiteneth
          </a>{' '}
          for bounty drops and studio updates.
        </p>
      </div>
    </footer>
  );
}
