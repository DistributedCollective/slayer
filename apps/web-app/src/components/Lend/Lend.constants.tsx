import iconBos from '@/assets/tokens/bos.png';
import iconBtc from '@/assets/tokens/btc.png';
import iconSov from '@/assets/tokens/sov.png';
import iconTether from '@/assets/tokens/usdt.png';
import iconWbtc from '@/assets/tokens/wbtc.png';
import type { Pool } from './components/AssetsTable/AssetsTable.types';

export const TAB_CLASSNAME =
  'dark:data-[state=active]:bg-neutral-700 rounded-full min-h-8 dark:data-[state=active]:text-[#FF6228] px-3 text-sm dark:data-[state=active]:hover:bg-neutral-600 bg-transparent dark:data-[state=inactive]:text-neutral-300 dark:data-[state=inactive]:hover:text-neutral-200 cursor-pointer';
export const POOLS: Pool[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: '1.41234566',
    usdBalance: '199,489.70',
    apy: '11.34%',
    icon: iconBtc,
    isHighApy: true,
    isSortable: true,
  },
  {
    symbol: 'SOV',
    name: 'Sovryn token',
    balance: '1.31234566',
    usdBalance: '189,489.70',
    apy: '12.34%',
    icon: iconSov,
    isHighApy: true,
    isSortable: true,
  },
  {
    symbol: 'wBTC',
    name: 'Wrapped Bitcoin',
    balance: '1.21234566',
    usdBalance: '179,489.70',
    apy: '13.34%',
    icon: iconWbtc,
    isSortable: false,
  },
  {
    symbol: 'BOS',
    name: 'BOS',
    balance: '1.11234566',
    usdBalance: '169,489.70',
    apy: '14.34%',
    icon: iconBos,
    isHighApy: true,
    isSortable: true,
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    balance: '1.01234566',
    usdBalance: '159,489.70',
    apy: '15.34%',
    icon: iconTether,
    isSortable: true,
  },
];
