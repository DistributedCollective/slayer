import { shouldRevalidateQuery } from '@/integrations/tanstack-query/root-provider';
import { sdk } from '@/lib/sdk';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

export const STALE_TIME = 1000 * 60 * 60; // 1 hour
export const QUERY_KEY_MONEY_MARKET_POSITIONS = 'money-market:positions';

export const useMoneyMarketPositions = ({
  pool,
  address,
}: {
  address: Address;
  pool: string;
}) =>
  useQuery({
    queryKey: ['money-market:positions', pool, address],
    queryFn: ({ queryKey }) =>
      sdk.moneyMarket.listUserPositions(
        pool,
        address!,
        shouldRevalidateQuery(queryKey),
      ),
    staleTime: STALE_TIME,
    enabled: !!address && !!pool,
  });
