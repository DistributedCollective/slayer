import { shouldRevalidateQuery } from '@/integrations/tanstack-query/root-provider';
import { sdk } from '@/lib/sdk';
import { useQuery } from '@tanstack/react-query';

export const STALE_TIME = 1000 * 60 * 60; // 1 hour
export const QUERY_KEY_MONEY_MARKET_RESERVES = 'money-market:reserves';

export const useMoneyMarketReserves = ({ pool }: { pool: string }) => {
  const { data, ...rest } = useQuery({
    queryKey: [QUERY_KEY_MONEY_MARKET_RESERVES, pool || 'default'],
    queryFn: ({ queryKey }) =>
      sdk.moneyMarket.listReserves(
        pool || 'default',
        shouldRevalidateQuery(queryKey),
      ),
    staleTime: STALE_TIME,
  });

  return {
    ...rest,
    data,
    reserves: data?.data.reservesData || [],
    eModes: data?.data.eModes || [],
    baseCurrencyData: data?.data.baseCurrencyData,
  };
};
