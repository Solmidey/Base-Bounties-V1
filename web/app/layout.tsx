import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "../components/providers";
import { cn } from "../lib/utils";

export const metadata = {
  title: "Base Task Board",
  description: "Lean bounty board with onchain escrow",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("antialiased")}
      >
        <Providers>
          <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-10">
            <header className="flex flex-col gap-3">
              <h1 className="text-3xl font-semibold">Base Task Board</h1>
              <p className="max-w-2xl text-sm text-zinc-400">
                Post tasks, escrow funds on Base, and let builders submit proof of work.
                Payouts are authorized via an EIP-712 signature so hunters can self-serve
                the claim transaction.
              </p>
            </header>
            <main className="flex-1 pb-10">{children}</main>
            <footer className="text-xs text-zinc-500">
              Built for Base hackathon. Contracts unaudited.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
