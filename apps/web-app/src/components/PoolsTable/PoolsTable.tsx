import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { Button } from '../ui/button';
import { pools } from './PoolsTable.constants';
import DepositDialog from './components/DepositDialog';
import PoolDetails from './components/PoolDetails';

export default function PoolsTable() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  return (
    <div className="rounded-md sm:border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Pair</TableHead>
            <TableHead className="font-medium">Liquidity</TableHead>
            <TableHead className="font-medium">Return rate</TableHead>
            <TableHead className="font-medium">24H volume</TableHead>
            <TableHead className="font-medium">Balance</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pools.map((pool) => (
            <Collapsible key={pool.id} asChild>
              <>
                <CollapsibleTrigger asChild>
                  <TableRow>
                    <TableCell>
                      {pool.base.symbol}/{pool.quote.symbol}
                    </TableCell>
                    <TableCell>{pool.baseLiquidity}</TableCell>
                    <TableCell>0%</TableCell>
                    <TableCell>{pool.dailyBaseVolume} BTC</TableCell>
                    <TableCell>
                      0 {pool.base.symbol} <br />0 {pool.quote.symbol}
                    </TableCell>
                    <TableCell>
                      <Button
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDepositOpen(true);
                        }}
                      >
                        Deposit
                      </Button>
                    </TableCell>
                  </TableRow>
                </CollapsibleTrigger>

                <CollapsibleContent className="w-full" asChild>
                  <PoolDetails />
                </CollapsibleContent>
              </>
            </Collapsible>
          ))}
        </TableBody>
      </Table>
      <DepositDialog open={isDepositOpen} onOpenChange={setIsDepositOpen} />
    </div>
  );
}
