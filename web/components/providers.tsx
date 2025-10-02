'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'viem';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- ENV ---
const WC_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID!;
const RPC_MAINNET = process.env.NEXT_PUBLIC_RPC_URL;        // optional but recommended
const RPC_SEPOLIA = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL; // optional if you support testnet

// --- Wagmi/RainbowKit config (v2 style) ---
const config = getDefaultConfig({
  appName: 'Base Bounties',
  projectId: WC_ID,
  chains: [base, baseSepolia], // include only base if you don’t want testnet
  transports: {
    [base.id]: http(RPC_MAINNET),          // if undefined, RainbowKit will use default/public RPC
    [baseSepolia.id]: http(RPC_SEPOLIA),   // remove this line if you don’t support testnet
  },
  // optional: ssr: true,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
