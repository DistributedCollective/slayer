export interface IAsset {
  symbol: string;
  name: string;
  balance: string;
  usdBalance?: string;
  apy: string;
  icon: string;
  isHighApy?: boolean;
  isSortable?: boolean;
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
