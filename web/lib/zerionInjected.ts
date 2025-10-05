import { injected, createConnector } from 'wagmi';
import type { Wallet, WalletDetailsParams } from '@rainbow-me/rainbowkit';
import { zerionWallet } from '@rainbow-me/rainbowkit/wallets';

function getZerionInjectedProvider(): any | undefined {
  // Try window.zerionEthereum first, then scan ethereum.providers
  const w: any = typeof window !== 'undefined' ? window : undefined;
  if (!w) return undefined;
  const fromDirect = (w as any).zerionEthereum;
  if (fromDirect?.isZerion) return fromDirect;

  const providers: any[] | undefined = w?.ethereum?.providers;
  if (Array.isArray(providers)) {
    const found = providers.find((p) => p && p.isZerion);
    if (found) return found;
  }
  if (w?.ethereum?.isZerion) return w.ethereum;
  return undefined;
}

/** Wrap RainbowKit's zerionWallet to prefer injected when available */
export const zerionInjectedWallet = (options: Parameters<typeof zerionWallet>[0]): Wallet => {
  const wcVersion = zerionWallet(options);
  const provider = getZerionInjectedProvider();
  if (!provider) return wcVersion;

  return {
    ...wcVersion,
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
      createConnector((config) => ({
        ...injected({
          target: () => ({
            id: 'zerion-injected',
            name: 'Zerion',
            provider: () => provider,
          }),
        })(config),
        ...walletDetails,
      })),
  };
};
