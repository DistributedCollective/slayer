import iconTether from '@/assets/tokens/usdt.png';
import type { BorrowPosition } from '../../BorrowPositionsList.types';

export const BORROW_POSITIONS: BorrowPosition[] = [
  {
    symbol: 'USDT',
    balance: '1.01234566',
    balanceUsd: 159489.7,
    apy: '15.34',
    apyType: [0, 5.12],
    icon: iconTether,
    isSortable: true,
  },
  {
    symbol: 'USDT',
    balance: '2.01234566',
    balanceUsd: 159489.7,
    apy: '4.4',
    apyType: [1, 6.12],
    icon: iconTether,
    isSortable: true,
  },
];
