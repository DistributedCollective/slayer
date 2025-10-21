type ChainConfig = {
  key: string;
  chainId: number;
  name: string;
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
  },
] as const satisfies ChainConfig[];

export type Chain = (typeof items)[number];
export type ChainId = Chain['chainId'];
export type ChainKey = Chain['key'];
export type ChainSelector = Chain['key'] | Chain['chainId'];

export const chains = {
  get: (chain: ChainSelector): Chain =>
    items.find((c) => c.key === chain || c.chainId === chain)!,
  list: (): Chain[] => items,
};
