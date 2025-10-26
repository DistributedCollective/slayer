import iconUsdc from '@/assets/tokens/usdc.png';
import iconUsdt from '@/assets/tokens/usdt.png';
import iconWbtc from '@/assets/tokens/wbtc.png';
import type { BorrowAsset } from '../../ BorrowAssetsList.types';

export const BORROW_ASSETS: BorrowAsset[] = [
  {
    symbol: 'USDT',
    balance: '10.5',
    balanceUsd: '10.5',
    apy: '50.90',
    icon: iconUsdt,
    isSortable: true,
  },
  {
    symbol: 'WBTC',
    balance: '0.09',
    balanceUsd: '150.0',
    apy: '2.75',
    icon: iconWbtc,
    isSortable: true,
  },
  {
    symbol: 'USDC',
    balance: '1.566',
    balanceUsd: '1.566',
    apy: '15.34',
    icon: iconUsdc,
    isSortable: true,
  },
];
