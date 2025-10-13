export interface IAsset {
  symbol: string;
  name: string;
  balance: string;
  usdBalance?: string;
  apy: string;
  icon: React.ReactNode;
  isHighApy?: boolean;
  isSortable?: boolean; // can be set to true or false for each column
}

export type OrderSorting = 'asc' | 'desc';
export enum OrderType {
  ASC = 'asc',
  DESC = 'desc',
}
export enum OrderColumn {
  NAME = 'name',
  SYMBOL = 'symbol',
  BALANCE = 'balance',
  APY = 'apy',
}
