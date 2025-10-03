'use client';

import Link from 'next/link';
import { Flame, Sparkles } from 'lucide-react';

import WalletButton from '@/components/ui/WalletButton';
import { CONTRACT_ADDRESS, CONTRACT_CONFIGURED } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  disabled?: boolean;
  external?: boolean;
};

const baseNavItems: NavItem[] = [
  { href: '#browse', label: 'Missions' },
  { href: '#', label: 'Docs', disabled: true },
];

const navItems: NavItem[] = [
  ...baseNavItems,
  ...(CONTRACT_CONFIGURED
    ? [{ href: `https://basescan.org/address/${CONTRACT_ADDRESS}`, label: 'Contract', external: true }]
    : []),
];

export default function Navbar({ onNewTask }: { onNewTask: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#02060f]/90 via-[#02060f]/70 to-transparent">
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="relative flex items-center justify-between rounded-[28px] border border-white/10 bg-[#040a18]/75 px-4 py-3 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 opacity-40 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent)]" />

          <Link href="/" className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00ffd1] to-[#0066ff] text-[#041215] shadow-[0_14px_35px_rgba(0,102,255,0.45)]">
              <Flame className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="text-xs uppercase tracking-[0.35em] text-white/50">Base</span>
              <div className="text-lg font-semibold">Bounty Studio</div>
            </div>
          </Link>

          <nav className="relative hidden items-center gap-6 text-sm text-white/60 md:flex">
            {navItems.map((item) => {
              const className = `transition hover:text-white/90 ${
                item.disabled ? 'cursor-not-allowed text-white/30 hover:text-white/30' : ''
              }`;

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${className} inline-flex items-center gap-1`}
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-[0.7rem] text-white/40">
                      ↗
                    </span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.disabled ? '#' : item.href}
                  aria-disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : undefined}
                  className={className}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative flex items-center gap-3">
            <button
              onClick={onNewTask}
              className="group relative hidden overflow-hidden rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 md:inline-flex"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#74f8ff]" />
                Create bounty
              </span>
              <span className="absolute inset-0 translate-x-[-40%] bg-white/20 blur-md transition group-hover:translate-x-0" />
            </button>

            <WalletButton className="bg-[#030915]/80" />
          </div>
        </div>
      </div>
    </header>
  );
}

