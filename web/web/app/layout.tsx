import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Base Bounties',
  description: 'Create and fund bounties on Base',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
