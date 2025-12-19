import { createFileRoute } from '@tanstack/react-router';

import { LendPositionsList } from '@/components/MoneyMarket/components/LendPositionsList/LendPositionsList';
import { TopPanel } from '@/components/MoneyMarket/components/TopPanel/TopPanel';

import { BorrowAssetsList } from '@/components/MoneyMarket/components/BorrowAssetsList/BorrowAssetsList';
import { BorrowPositionsList } from '@/components/MoneyMarket/components/BorrowPositionsList/BorrowPositionsList';
import { BorrowDialog } from '@/components/MoneyMarket/components/Dialogs/BorrowDialog/BorrowDialog';
import { EfficiencyModeDialog } from '@/components/MoneyMarket/components/Dialogs/EfficiencyModeDialog/EfficiencyModeDialog';
import { LendDialog } from '@/components/MoneyMarket/components/Dialogs/LendDialog/LendDialog';
import { RepayDialog } from '@/components/MoneyMarket/components/Dialogs/RepayDialog/RepayDialog';
import { WithdrawDialog } from '@/components/MoneyMarket/components/Dialogs/WithdrawDialog/WithdrawDialog';
import { LendAssetsList } from '@/components/MoneyMarket/components/LendAssetsList/LendAssetsList';
import {
  QUERY_KEY_MONEY_MARKET_POOLS,
  useMoneyMarketPools,
} from '@/components/MoneyMarket/hooks/use-money-pools';
import {
  QUERY_KEY_MONEY_MARKET_POSITIONS,
  useMoneyMarketPositions,
} from '@/components/MoneyMarket/hooks/use-money-positions';
import {
  QUERY_KEY_MONEY_MARKET_RESERVES,
  useMoneyMarketReserves,
} from '@/components/MoneyMarket/hooks/use-money-reserves';
import { Heading } from '@/components/ui/heading/heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sdk } from '@/lib/sdk';
import { SelectGroup } from '@radix-ui/react-select';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import z from 'zod';

const STALE_TIME = 1000 * 60 * 60; // 1 hour

const poolSearchSchema = z.object({
  search: z.string().default(''),
  pool: z.string().default('default'),
});

export const Route = createFileRoute('/money-market')({
  component: RouteComponent,
  validateSearch: poolSearchSchema,
  loaderDeps: ({ search: { search, pool } }) => ({
    search,
    pool,
  }),
  loader: ({ deps: { pool }, context }) => {
    const client = context.queryClient;
    client.prefetchQuery({
      queryKey: [QUERY_KEY_MONEY_MARKET_POOLS],
      queryFn: () => sdk.moneyMarket.listPools(),
      staleTime: STALE_TIME,
    });

    client.prefetchQuery({
      queryKey: [QUERY_KEY_MONEY_MARKET_RESERVES, pool || 'default'],
      queryFn: () => sdk.moneyMarket.listReserves(pool || 'default'),
      staleTime: STALE_TIME,
    });

    const owner = context.connection().address;
    if (owner) {
      client.prefetchQuery({
        queryKey: [QUERY_KEY_MONEY_MARKET_POSITIONS, pool || 'default', owner],
        queryFn: () =>
          sdk.moneyMarket.listUserPositions(pool || 'default', owner),
        staleTime: STALE_TIME,
      });
    }
  },
});

function RouteComponent() {
  const { pool } = Route.useLoaderDeps();
  const { address } = useAccount();

  const { pools } = useMoneyMarketPools();

  const { reserves } = useMoneyMarketReserves({
    pool: pool || 'default',
  });

  const { positions, summary, isPending } = useMoneyMarketPositions({
    pool: pool || 'default',
    address: address!,
  });

  const borrowAssets = useMemo(
    () =>
      reserves.filter((r) => {
        if (!r.canBeBorrowed) {
          return false;
        }

        const userEmodeCategoryId = summary?.userEmodeCategoryId;

        // When E-Mode is disabled (category 0 or undefined, allow all borrowable assets)
        if (userEmodeCategoryId === undefined || userEmodeCategoryId === 0) {
          return true;
        }

        // When E-Mode is enabled, restrict to assets in the same E-Mode category.
        return r.eModeCategoryId === userEmodeCategoryId;
      }),
    [reserves, summary],
  );

  const navigate = Route.useNavigate();

  const handlePoolChange = (value: string) => {
    navigate({
      search: (old) => ({ ...old, pool: value }),
    });
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <Heading className="text-3xl font-bold mb-2">Money Market</Heading>
          <p className="text-muted-foreground">
            Lend and borrow assets with variable and stable interest rates
          </p>
        </div>

        <div className="flex flex-row justify-between md:py-12">
          <TopPanel
            healthFactor={summary?.healthFactor ?? '0'}
            netApy={summary?.netApy ?? '0'}
            netWorth={summary?.netWorthUsd ?? '0'}
            isPending={isPending}
          />

          <Select onValueChange={handlePoolChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue
                placeholder={
                  pools.find((p) => p.id === pool)?.name || 'Select Pool'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {pools.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 2xl:gap-4 space-y-4">
          <div className="space-y-4">
            <LendPositionsList
              lendPositions={positions ?? []}
              supplyBalance={summary?.supplyBalanceUsd ?? '0'}
              collateralBalance={summary?.collateralBalanceUsd ?? '0'}
              supplyWeightedApy={summary?.supplyWeightedApy ?? '0'}
            />
            <LendAssetsList lendAssets={reserves ?? []} />
          </div>
          <div className="space-y-4">
            <BorrowPositionsList
              borrowPositions={positions ?? []}
              borrowBalance={summary?.totalBorrowsUsd ?? '0'}
              borrowPower={summary?.borrowPowerUsed ?? '0'}
              borrowWeightedApy={summary?.borrowWeightedApy ?? '0'}
              eModesCategoryId={summary?.userEmodeCategoryId ?? 0}
            />
            <BorrowAssetsList
              borrowAssets={borrowAssets}
              eModesCategoryId={summary?.userEmodeCategoryId ?? 0}
            />
          </div>
        </div>
      </div>
      <BorrowDialog />
      <LendDialog />
      <WithdrawDialog />
      <RepayDialog />
      <EfficiencyModeDialog />
    </>
  );
}
