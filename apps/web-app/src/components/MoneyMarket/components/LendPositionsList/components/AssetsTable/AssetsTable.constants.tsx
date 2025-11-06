import iconUsdc from '@/assets/tokens/usdc.png';
import type { LendPosition } from '../../LendPositionsList.types';

export const LEND_POSITIONS: LendPosition[] = [
  {
    symbol: 'USDC',
    balance: '1.01234566',
    balanceUsd: 159489.7,
    apy: '15.34',
    icon: iconUsdc,
    isSortable: true,
    collateral: true,
    canToggleCollateral: true,
    canBeCollateral: true,
  },
];
