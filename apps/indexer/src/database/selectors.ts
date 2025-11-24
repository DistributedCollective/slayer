import { TToken, tTokens } from './schema';

export const tTokensSelectors = {
  columns: {
    address: true,
    symbol: true,
    name: true,
    decimals: true,
    logoUrl: true,
  },
  select: {
    address: tTokens.address,
    symbol: tTokens.symbol,
    name: tTokens.name,
    decimals: tTokens.decimals,
    logoUrl: tTokens.logoUrl,
  },
} as const;

export type TTokenSelected = Pick<
  TToken,
  keyof typeof tTokensSelectors.columns
>;
