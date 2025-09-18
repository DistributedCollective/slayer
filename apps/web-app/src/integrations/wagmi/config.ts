import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { rootstockTestnet } from 'viem/chains';

export const config = createConfig({
  chains: [rootstockTestnet],
  transports: {
    [rootstockTestnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
