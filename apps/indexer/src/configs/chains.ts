import {
  createPublicClient,
  http,
  PublicClient,
  Transport,
  Chain as ViemChain,
} from 'viem';
import { bobSepolia, rootstock, rootstockTestnet } from 'viem/chains';
type ChainConfig = {
  key: string;
  chainId: number;
  name: string;

  rpc: PublicClient;

  // Aave subgraph URL
  aaveSubgraphUrl?: string;
  aavePriceFeedUrl?: string;
};

const items = [
  {
    key: 'rootstock',
    chainId: rootstock.id,
    name: 'Rootstock',
    rpc: createPublicClient({
      chain: rootstock,
      transport: http(rootstock.rpcUrls.default.http[0]),
    }),
  },
  {
    key: 'rsk-testnet',
    chainId: rootstockTestnet.id,
    name: 'Rootstock Testnet',
    rpc: createPublicClient({
      chain: rootstockTestnet,
      transport: http(rootstockTestnet.rpcUrls.default.http[0]),
    }),
  },
  {
    key: 'bob-sepolia',
    chainId: bobSepolia.id,
    name: 'BOB Sepolia',
    rpc: createPublicClient({
      chain: bobSepolia,
      transport: http(bobSepolia.rpcUrls.default.http[0]),
    }) as PublicClient<Transport, ViemChain>,
    aaveSubgraphUrl:
      'https://bob-mm.test.sovryn.app/subgraphs/name/DistributedCollective/sov-protocol-subgraphs',
    aavePriceFeedUrl: 'https://bob-mm-cache.test.sovryn.app/data/rates-history',
  },
] as const satisfies ChainConfig[];

export type Chain = (typeof items)[number];
export type ChainId = Chain['chainId'];
export type ChainKey = Chain['key'];
export type ChainSelector = Chain['key'] | Chain['chainId'];

export const chains = {
  get: <T extends ChainSelector>(
    chain: T,
  ): Extract<Chain, { key: T }> extends never
    ? Extract<Chain, { chainId: T }>
    : Extract<Chain, { key: T }> =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items.find((c) => c.key === chain || c.chainId == chain)! as any,
  list: (): Chain[] => items,
};
