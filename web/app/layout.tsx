import './globals.css';
import { ReactNode } from 'react';
import Providers from '../components/providers';
import { cn } from '../lib/utils';

export const metadata = {
  title: 'Base Bounties',
  description: 'A cinematic bounty board experience built for the Base ecosystem.',
  metadataBase: new URL('https://example.com'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen overflow-x-hidden bg-[#030712] text-white antialiased',
          'selection:bg-[#00ffd1]/20 selection:text-white'
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_900px_at_-10%_-10%,rgba(0,133,255,0.16),transparent),radial-gradient(1200px_900px_at_120%_-10%,rgba(0,255,209,0.14),transparent)]" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(130deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_50%),linear-gradient(to_bottom,rgba(3,7,18,0.1)_0%,rgba(3,7,18,0.9)_85%)]" />
            <main className="relative flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
