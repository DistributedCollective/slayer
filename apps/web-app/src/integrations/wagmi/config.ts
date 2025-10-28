import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { bobSepolia } from 'viem/chains';

export const config = createConfig({
  chains: [bobSepolia],
  transports: {
    // [rootstock.id]: slayer(),
    [bobSepolia.id]: http(),
    // [rootstockTestnet.id]: slayer(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
