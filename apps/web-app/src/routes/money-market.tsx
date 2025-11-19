import { createFileRoute } from '@tanstack/react-router';

import { LendPositionsList } from '@/components/MoneyMarket/components/LendPositionsList/LendPositionsList';
import { TopPanel } from '@/components/MoneyMarket/components/TopPanel/TopPanel';

import { BorrowAssetsList } from '@/components/MoneyMarket/components/BorrowAssetsList/BorrowAssetsList';
import { BorrowDialog } from '@/components/MoneyMarket/components/BorrowDialog/BorrowDialog';
import { BorrowPositionsList } from '@/components/MoneyMarket/components/BorrowPositionsList/BorrowPositionsList';
import { BORROW_POSITIONS } from '@/components/MoneyMarket/components/BorrowPositionsList/components/AssetsTable/AssetsTable.constants';
import { LEND_ASSETS } from '@/components/MoneyMarket/components/LendAssetsList/components/AssetsTable/AssetsTable.constants';
import { LendAssetsList } from '@/components/MoneyMarket/components/LendAssetsList/LendAssetsList';
import {
  healthFactor,
  netApy,
  netWorth,
} from '@/components/MoneyMarket/MoneyMarket.constants';
import { Heading } from '@/components/ui/heading/heading';
import { sdk } from '@/lib/sdk';
import { isAbortError } from '@sovryn/slayer-shared';
import z from 'zod';

const poolSearchSchema = z.object({
  offset: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().default(''),
});

export const Route = createFileRoute('/money-market')({
  component: RouteComponent,
  validateSearch: poolSearchSchema,
  loaderDeps: ({ search: { offset, limit, search } }) => ({
    offset,
    limit,
    search,
  }),
  loader: ({ abortController, deps }) =>
    sdk.moneyMarket
      .listReserves({
        signal: abortController.signal,
        query: deps,
      })
      .catch((e) => (isAbortError(e) ? null : Promise.reject(e))),
});

function RouteComponent() {
  const pools = Route.useLoaderData();

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
              lendPositions={(pools?.data ?? []).map((r) => r.data)}
              supplyBalance={100}
              collateralBalance={50}
              supplyWeightedApy={2.5}
            />
            <LendAssetsList lendAssets={LEND_ASSETS} />
          </div>
          <div className="space-y-4">
            <BorrowPositionsList
              borrowPositions={BORROW_POSITIONS}
              supplyBalance={10}
              borrowPower={1.29}
              supplyWeightedApy={0.05}
            />
            <BorrowAssetsList
              borrowAssets={(pools?.data ?? []).map((r) => r.data)}
            />
          </div>
        </div>
      </div>
      <BorrowDialog />
    </>
  );
}
