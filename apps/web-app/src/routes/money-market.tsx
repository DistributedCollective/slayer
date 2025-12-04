import { createFileRoute } from '@tanstack/react-router';

import { LendPositionsList } from '@/components/MoneyMarket/components/LendPositionsList/LendPositionsList';
import { TopPanel } from '@/components/MoneyMarket/components/TopPanel/TopPanel';

import { BorrowAssetsList } from '@/components/MoneyMarket/components/BorrowAssetsList/BorrowAssetsList';
import { BorrowDialog } from '@/components/MoneyMarket/components/BorrowDialog/BorrowDialog';
import { BorrowPositionsList } from '@/components/MoneyMarket/components/BorrowPositionsList/BorrowPositionsList';
import { LendAssetsList } from '@/components/MoneyMarket/components/LendAssetsList/LendAssetsList';
import { LendDialog } from '@/components/MoneyMarket/components/LendDialog/LendDialog';
import {
  healthFactor,
  netApy,
  netWorth,
} from '@/components/MoneyMarket/MoneyMarket.constants';
import { Heading } from '@/components/ui/heading/heading';
import { sdk } from '@/lib/sdk';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import z from 'zod';

const STALE_TIME = 1000 * 60 * 60; // 1 hour

const poolSearchSchema = z.object({
  offset: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().default(''),
  pool: z.string().default('default'),
});

export const Route = createFileRoute('/money-market')({
  component: RouteComponent,
  validateSearch: poolSearchSchema,
  loaderDeps: ({ search: { offset, limit, search, pool } }) => ({
    offset,
    limit,
    search,
    pool,
  }),
  loader: ({ deps: { pool }, context }) => {
    const client = context.queryClient;
    client.prefetchQuery({
      queryKey: ['money-market:pools'],
      queryFn: () => sdk.moneyMarket.listPools(),
      staleTime: STALE_TIME,
    });

    client.prefetchQuery({
      queryKey: ['money-market:reserve', pool || 'default'],
      queryFn: () => sdk.moneyMarket.listReserves(pool || 'default'),
      staleTime: STALE_TIME,
    });

    const owner = context.connection().address;
    if (owner) {
      client.prefetchQuery({
        queryKey: ['money-market:borrows', pool || 'default', owner],
        queryFn: () =>
          sdk.moneyMarket.listUserPositions(pool || 'default', owner),
        staleTime: STALE_TIME,
      });

      client.prefetchQuery({
        queryKey: ['money-market:lendings', pool || 'default', owner],
        queryFn: () =>
          sdk.moneyMarket.listUserLendings(pool || 'default', owner),
        staleTime: STALE_TIME,
      });
    }
  },
});

function RouteComponent() {
  const { pool } = Route.useLoaderDeps();
  const { address } = useAccount();

  // const { data: pools } = useQuery({
  //   queryKey: ['money-market:pools'],
  //   queryFn: () => sdk.moneyMarket.listPools(),
  //   staleTime: 1000 * 60 * 60, // 1 hour
  // });

  const { data: reserves } = useQuery({
    queryKey: ['money-market:reserve', pool || 'default'],
    queryFn: () => sdk.moneyMarket.listReserves(pool || 'default'),
    staleTime: STALE_TIME,
  });

  const { data: positions } = useQuery({
    queryKey: ['money-market:positions', pool || 'default', address],
    queryFn: () =>
      sdk.moneyMarket.listUserPositions(pool || 'default', address!),
    staleTime: STALE_TIME,
    enabled: !!address,
  });

  const borrowAssets = useMemo(
    () => (reserves?.data ?? []).filter((r) => r.borrowingEnabled),
    [reserves],
  );

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <Heading className="text-3xl font-bold mb-2">Money Market</Heading>
          <p className="text-muted-foreground">
            Earn fees from AMM swaps on RSK
          </p>
        </div>

        <TopPanel
          healthFactor={healthFactor}
          netApy={netApy}
          netWorth={netWorth}
        />

        <div className="grid grid-cols-1 2xl:grid-cols-2 2xl:gap-4 space-y-4">
          <div className="space-y-4">
            <LendPositionsList
              lendPositions={positions?.data ?? []}
              supplyBalance={100}
              collateralBalance={50}
              supplyWeightedApy={2.5}
            />
            <LendAssetsList lendAssets={reserves?.data ?? []} />
          </div>
          <div className="space-y-4">
            <BorrowPositionsList
              borrowPositions={positions?.data ?? []}
              supplyBalance={10}
              borrowPower={1.29}
              supplyWeightedApy={0.05}
            />
            <BorrowAssetsList borrowAssets={borrowAssets} />
          </div>
        </div>
      </div>
      <BorrowDialog />
      <LendDialog />
    </>
  );
}
