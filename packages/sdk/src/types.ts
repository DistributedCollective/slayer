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

export type TransactionOpts<account extends Account> = {
  account: account | Address;
};

export interface SdkToken {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  isNative?: boolean;
}

export type Token = Pick<SdkToken, 'address' | 'decimals'> &
  Partial<Pick<SdkToken, 'symbol' | 'name' | 'logoUrl' | 'isNative'>>;

export interface MoneyMarketPoolReserve {
  id: string;
  originalId: number;
  token: SdkToken;
  pool: MoneyMarketPool;

  availableLiquidity: string;
  baseLTVasCollateral: string;

  borrowingEnabled: boolean;
  usageAsCollateralEnabled: boolean;

  isActive: boolean;
  isFrozen: boolean;

  liquidityRate: string;
  variableBorrowRate: string;

  reserveFactor: string;
  reserveLiquidationBonus: string;
  reserveLiquidationThreshold: string;
}

export interface MoneyMarketPool {
  id: string | 'default';
  name: string;
  logoURI: string;
  address: Address;
  wethGateway: Address;
  uiPoolDataProvider: Address;
  poolAddressesProvider: Address;
  variableDebtEth: Address;
  weth: Address;
  treasury: Address;
  subgraphURI: string;
  priceFeedURI: string;
}

export const BORROW_RATE_MODES = {
  stable: 1n,
  variable: 2n,
} as const;

export type BorrowRateMode =
  (typeof BORROW_RATE_MODES)[keyof typeof BORROW_RATE_MODES];
