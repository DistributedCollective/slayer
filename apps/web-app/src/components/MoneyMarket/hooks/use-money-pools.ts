import { sdk } from '@/lib/sdk';
import { useQuery } from '@tanstack/react-query';

export const STALE_TIME = 1000 * 60 * 60; // 1 hour
export const QUERY_KEY_MONEY_MARKET_POOLS = 'money-market:pools';

export const useMoneyMarketPools = () => {
  const { data, ...rest } = useQuery({
    queryKey: [QUERY_KEY_MONEY_MARKET_POOLS],
    queryFn: () => sdk.moneyMarket.listPools(),
    staleTime: STALE_TIME,
  });

  return {
    ...rest,
    pools: data?.data || [],
  };
};

export const useMoneyMarketPoolById = (id?: string) => {
  const { pools } = useMoneyMarketPools();

  return pools.find((p) => p.id === (id || 'default'));
};
