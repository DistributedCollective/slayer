import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import { Fragment, useCallback, useMemo, type FC } from 'react';

import { withdrawRequestStore } from '@/components/MoneyMarket/stores/withdraw-request.store';
import { AmountRenderer } from '@/components/ui/amount-renderer';
import { Button } from '@/components/ui/button';
import { InfoButton } from '@/components/ui/info-button';
import { Switch } from '@/components/ui/switch';
import type { MoneyMarketPoolPosition } from '@sovryn/slayer-sdk';
import { Decimal } from '@sovryn/slayer-shared';

type AssetsTableProps = {
  assets: MoneyMarketPoolPosition[];
};

export const AssetsTable: FC<AssetsTableProps> = ({ assets }) => {
  const items = useMemo(
    () => assets.filter((asset) => Decimal.from(asset.supplied).gt(0)),
    [assets],
  );

  const toggleCollateral = useCallback((symbol: string) => {
    // setSortedAssets((prevAssets) =>
    //   prevAssets.map((asset) =>
    //     asset.symbol === symbol
    //       ? { ...asset, collateral: !asset.collateral }
    //       : asset,
    //   ),
    // );
  }, []);

  const withdrawSupply = (position: MoneyMarketPoolPosition) =>
    withdrawRequestStore.getState().setPosition(position);

  return (
    <Table className="w-full border-separate">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-none text-xs">
          <TableHead>
            <div className="flex items-center gap-2">
              <span>Asset</span>
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <span>Balance</span>
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                APY
                <InfoButton content="APY - The annual percentage yield (APY) is the real rate of return earned on an investment, taking into account the effect of compounding interest." />
              </div>
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <div>Collateral</div>
            </div>
          </TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <Fragment key={item.token.address}>
            <TableRow className="hover:bg-transparent">
              <TableCell className="border-neutral-800 border-y border-l rounded-tl-[1.25rem] rounded-bl-[1.25rem]">
                <div className="flex items-center min-w-24">
                  <img
                    src={item.token.logoUrl}
                    alt={item.token.name}
                    className="w-8 h-8"
                  />
                  <div className="ml-2">
                    <p className="text-gray-50 font-medium">
                      {item.token.symbol}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <AmountRenderer
                  value={item.supplied}
                  suffix={item.token.symbol}
                />
                <p className="text-neutral-500 font-medium text-xs">
                  <AmountRenderer
                    value={item.suppliedUsd}
                    prefix="$"
                    showApproxSign
                  />
                </p>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <div className="flex items-center">
                  <AmountRenderer
                    value={item.supplyApy}
                    suffix="%"
                    className="text-gray-50 font-medium"
                    showApproxSign
                  />
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <div className="flex items-center">
                  <Switch
                    className="cursor-pointer data-[state=checked]:bg-primary"
                    checked={item.collateral}
                    id={`collateral-${item.token.address}`}
                    onClick={() => toggleCollateral(item.id)}
                    // disabled={!asset}
                  />
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y border-r rounded-tr-[1.25rem] rounded-br-[1.25rem]">
                <div className="flex items-center justify-end">
                  <Button
                    className="rounded-full min-w-24 h-10 hover:cursor-pointer"
                    variant="secondary"
                    onClick={() => withdrawSupply(item)}
                  >
                    Withdraw
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            {index !== items.length - 1 && (
              <TableRow className="h-1 hover:bg-transparent border-none">
                <TableCell className="p-0.5" colSpan={5}></TableCell>
              </TableRow>
            )}
          </Fragment>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No assets found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
