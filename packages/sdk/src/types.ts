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
  // originalId: number;
  token: SdkToken;
  pool: MoneyMarketPool;

  priceUsd: string;

  liquidity: string;
  liquidityUsd: string;

  stableBorrowApy: string;
  variableBorrowApy: string;
  supplyApy: string;

  canBeBorrowed: boolean;
  canBeCollateral: boolean;

  isActive: boolean;
  isFrozen: boolean;
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

export type MoneyMarketPoolPosition = {
  id: string;
  pool: MoneyMarketPool;
  token: SdkToken;
  reserve: Omit<MoneyMarketPoolReserve, 'pool' | 'token'>;

  supplied: string;
  suppliedUsd: string;

  supplyApy: string;
  canToggleCollateral: boolean;

  borrowed: string;
  borrowedUsd: string;

  borrowApy: string;
  stableBorrowApy: string;
  variableBorrowApy: string;

  collateral: boolean;

  availableToBorrow: string;
  availableToBorrowUsd: string;

  borrowRateMode: BorrowRateMode;
};

export type MoneyMarketUserSummary = {
  netApy: string;
  healthFactor: string;
  collateralRatio: string;
  borrowPower: string;
  borrowPowerUsed: string;

  totalLiquidityUsd: string;
  totalCollateralUsd: string;
  totalBorrowsUsd: string;
  availableBorrowsUsd: string;

  currentLoanToValue: string;
  currentLiquidationThreshold: string;

  supplyBalanceUsd: string;
  collateralBalanceUsd: string;

  netWorthUsd: string;
  userEmodeCategoryId: number | null;
  isInIsolationMode: boolean;

  borrowWeightedApy: string;
  supplyWeightedApy: string;
};
