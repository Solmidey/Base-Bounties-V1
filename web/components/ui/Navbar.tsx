'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Flame } from 'lucide-react';

export default function Navbar({ onNewTask }: { onNewTask: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0f13]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00FFD1] to-[#0085FF] text-[#061017]">
            <Flame className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Base Bounties</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://x.com/KamiKaiteneth"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 md:inline-block"
          >
            Twitter
          </a>
          <button
            onClick={onNewTask}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#061017]"
          >
            New Task
          </button>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
