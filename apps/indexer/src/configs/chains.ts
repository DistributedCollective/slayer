type ChainConfig = {
  key: string;
  chainId: number;
  name: string;

  // Aave subgraph URL
  aaveSubgraphUrl?: string;
};

const items = [
  {
    key: 'rootstock',
    chainId: 30,
    name: 'Rootstock',
  },
  {
    key: 'rsk-testnet',
    chainId: 31,
    name: 'Rootstock Testnet',
  },
  {
    key: 'bob-sepolia',
    chainId: 808813,
    name: 'BOB Sepolia',
    aaveSubgraphUrl:
      'https://bob-mm.test.sovryn.app/subgraphs/name/DistributedCollective/sov-protocol-subgraphs',
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
