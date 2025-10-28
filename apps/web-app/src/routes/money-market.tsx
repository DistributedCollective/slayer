import { createFileRoute } from '@tanstack/react-router';

import { LendPositionsList } from '@/components/MoneyMarket/components/LendPositionsList/LendPositionsList';
import { TopPanel } from '@/components/MoneyMarket/components/TopPanel/TopPanel';

import { BorrowAssetsList } from '@/components/MoneyMarket/components/BorrowAssetsList/BorrowAssetsList';
import { BORROW_ASSETS } from '@/components/MoneyMarket/components/BorrowAssetsList/components/AssetsTable/AssetsTable.constants';
import { BorrowPositionsList } from '@/components/MoneyMarket/components/BorrowPositionsList/BorrowPositionsList';
import { BORROW_POSITIONS } from '@/components/MoneyMarket/components/BorrowPositionsList/components/AssetsTable/AssetsTable.constants';
import { LEND_ASSETS } from '@/components/MoneyMarket/components/LendAssetsList/components/AssetsTable/AssetsTable.constants';
import { LendAssetsList } from '@/components/MoneyMarket/components/LendAssetsList/LendAssetsList';
import { LEND_POSITIONS } from '@/components/MoneyMarket/components/LendPositionsList/components/AssetsTable/AssetsTable.constants';
import {
  healthFactor,
  netApy,
  netWorth,
} from '@/components/MoneyMarket/MoneyMarket.constants';
import PoolsTable from '@/components/PoolsTable/PoolsTable';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading/heading';

export const Route = createFileRoute('/money-market')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <Heading className="text-3xl font-bold mb-2">Money Market</Heading>
        <p className="text-muted-foreground">Earn fees from AMM swaps on RSK</p>
      </div>

      <TopPanel
        healthFactor={healthFactor}
        netApy={netApy}
        netWorth={netWorth}
      />

      <div className="grid grid-cols-1 2xl:grid-cols-2 2xl:gap-4 space-y-4">
        <div className="space-y-4">
          <LendPositionsList
            lendPositions={LEND_POSITIONS}
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
          <BorrowAssetsList borrowAssets={BORROW_ASSETS} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liquidity Pools</CardTitle>
          <CardDescription>
            Provide a 1:1 ratio of two assets to the AMM pool and instantly
            start accruing your share of weekly rewards. Next rewards
            recalibration on October 7
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PoolsTable />
        </CardContent>
      </Card>
    </div>
  );
}
