import type { Account, Address } from 'viem';

export interface SdkResponse<T> {
  data: T;
}

export interface SdkPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  count: number;
}

export interface SdkPaginatedQuery {
  limit?: number;
  cursor?: string;
  search?: string;
}

export type TransactionOpts = {
  account: Account | Address;
};

export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  isNative?: boolean;
}

export interface MoneyMarketPoolReserve {
  id: string;
  totalLiquidity: string;
  underlyingAsset: string;
  token: Token;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
}

export interface MoneyMarketPool {
  pool: Address;
  addressProvider: Address;
}

export enum BorrowRateMode {
  stable = 1,
  variable = 2,
}
