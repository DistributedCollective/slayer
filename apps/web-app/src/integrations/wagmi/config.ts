import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import {
  bobSepolia,
  mainnet,
  rootstock,
  rootstockTestnet,
  sepolia,
} from 'viem/chains';

export const config = createConfig({
  chains: [mainnet, sepolia, bobSepolia, rootstock, rootstockTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bobSepolia.id]: http(),
    [rootstock.id]: http(),
    [rootstockTestnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
