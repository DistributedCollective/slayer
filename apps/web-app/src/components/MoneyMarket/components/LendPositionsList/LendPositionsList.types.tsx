export type LendPosition = {
  icon: string;
  symbol: string;
  balance: string;
  balanceUsd: string;
  apy: string;
  collateral: boolean;
  canToggleCollateral: boolean;
  canBeCollateral: boolean;
  isSortable?: boolean;
};
