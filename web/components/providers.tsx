'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'viem';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- ENV ---
const rawWalletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID?.trim();
const FALLBACK_WALLETCONNECT_ID = '00000000000000000000000000000000';
export const walletConnectId =
  rawWalletConnectId && rawWalletConnectId.length > 0 ? rawWalletConnectId : FALLBACK_WALLETCONNECT_ID;
export const walletConnectConfigured = Boolean(rawWalletConnectId && rawWalletConnectId.length > 0);
const RPC_MAINNET = process.env.NEXT_PUBLIC_RPC_URL?.trim(); // optional but recommended
const RPC_SEPOLIA = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL?.trim(); // optional if you support testnet

const transports: Record<number, ReturnType<typeof http>> = {};
if (RPC_MAINNET) {
  transports[base.id] = http(RPC_MAINNET);
}
if (RPC_SEPOLIA) {
  transports[baseSepolia.id] = http(RPC_SEPOLIA);
}

// --- Wagmi/RainbowKit config (v2 style) ---
const config = getDefaultConfig({
  appName: 'Base Bounties',
  projectId: walletConnectId,
  chains: [base, baseSepolia],
  transports,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#00FFD1',
            accentColorForeground: '#001d1a',
            borderRadius: 'large',
            overlayBlur: 'small',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
