export type LendPosition = {
  icon: string;
  symbol: string;
  balance: string;
  balanceUsd: number;
  apy: string;
  collateral: boolean;
  canToggleCollateral: boolean;
  canBeCollateral: boolean;
  isSortable?: boolean;
};
