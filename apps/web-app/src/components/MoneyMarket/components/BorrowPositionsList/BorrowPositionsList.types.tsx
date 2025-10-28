export type BorrowPosition = {
  icon: string;
  symbol: string;
  balance: string;
  balanceUsd: string;
  apy: string;
  apyType: [number, number];
  isSortable?: boolean;
  poolId?: string;
  address?: string;
};
