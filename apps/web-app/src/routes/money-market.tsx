import { createFileRoute } from '@tanstack/react-router';

import PoolsTable from '@/components/PoolsTable/PoolsTable';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/money-market')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Money Market</h1>
        <p className="text-muted-foreground">Earn fees from AMM swaps on RSK</p>
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
