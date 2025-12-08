import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import {
  bobSepolia,
  mainnet,
  rootstock,
  rootstockTestnet,
  sepolia,
} from 'viem/chains';
import { getAccount } from 'wagmi/actions';

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

export const getConnection = () => getAccount(config);

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
