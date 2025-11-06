import iconUsdc from '@/assets/tokens/usdc.png';
import iconUsdt from '@/assets/tokens/usdt.png';
import iconWbtc from '@/assets/tokens/wbtc.png';
import type { LendAsset } from '../../LendAssetsList.types';

export const LEND_ASSETS: LendAsset[] = [
  {
    symbol: 'USDC',
    balance: '1.01234566',
    balanceUsd: 159489.7,
    apy: '15.34',
    icon: iconUsdc,
    isSortable: true,
    canBeCollateral: true,
  },
  {
    symbol: 'USDT',
    balance: '0',
    balanceUsd: 0,
    apy: '12.50',
    icon: iconUsdt,
    isSortable: true,
    canBeCollateral: false,
  },
  {
    symbol: 'WBTC',
    balance: '0.005',
    balanceUsd: 1.23,
    apy: '8.75',
    icon: iconWbtc,
    isSortable: true,
    canBeCollateral: true,
  },
];
