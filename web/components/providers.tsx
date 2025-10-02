"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { ReactNode, useState } from "react";
import { RainbowKitProvider, getDefaultWallets, midnightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const { chains, publicClient } = configureChains(
  [base, baseSepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] })
    })
  ]
);

const walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "demo";

const { connectors } = getDefaultWallets({
  appName: "Base Task Board",
  projectId: walletConnectId,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider chains={chains} theme={midnightTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
