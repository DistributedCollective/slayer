export type LendAsset = {
  icon: string;
  symbol: string;
  balance: string;
  balanceUsd?: number;
  apy: string;
  canBeCollateral: boolean;
  isSortable?: boolean;
};
