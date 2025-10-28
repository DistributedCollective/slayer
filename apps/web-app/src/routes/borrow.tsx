import { SDK } from '@sovryn/slayer-sdk';
import { createFileRoute } from '@tanstack/react-router';

import PoolDetails from '@/components/PoolsTable/components/PoolDetails';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ENV } from '@/env';
import {
  defaultSearchSchema,
  makeSearchValidator,
  searchDefaults,
} from '@/lib/route-query-search.util';
import { isAbortError } from '@sovryn/slayer-shared';
import { createPublicClient, http } from 'viem';
import { bobSepolia } from 'viem/chains';

const validateSearch = makeSearchValidator(defaultSearchSchema, searchDefaults);

export const Route = createFileRoute('/borrow')({
  component: RouteComponent,
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ abortController, deps }) =>
    new SDK({
      indexerBaseUrl: ENV.VITE_API_BASE,
      publicClient: createPublicClient({
        chain: bobSepolia,
        transport: http(),
      }),
    }).moneyMarket
      .listReserves({
        signal: abortController.signal,
        query: deps,
      })
      .catch((e) => (isAbortError(e) ? null : Promise.reject(e))),
});

function RouteComponent() {
  const pools = Route.useLoaderData();
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
          <div className="rounded-md sm:border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Asset</TableHead>
                  <TableHead className="font-medium">Available</TableHead>
                  <TableHead className="font-medium">APY</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pools?.data.map((pool) => (
                  <Collapsible key={pool.id} asChild>
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow>
                          <TableCell>{pool.token.symbol}</TableCell>
                          <TableCell>{pool.totalLiquidity}</TableCell>
                          <TableCell>0%</TableCell>
                          <TableCell>
                            <Button
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                // setIsDepositOpen(true);
                              }}
                            >
                              Deposit
                            </Button>
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>

                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={6} className="p-0">
                            <PoolDetails />
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
            {/* <DepositDialog
              open={isDepositOpen}
              onOpenChange={setIsDepositOpen}
            /> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
