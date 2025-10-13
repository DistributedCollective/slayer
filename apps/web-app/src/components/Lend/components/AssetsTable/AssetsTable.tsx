import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EllipsisVertical, Info } from 'lucide-react';
import React, { useCallback, useEffect, useState, type FC } from 'react';
import { Button } from '../../../ui/button';

import iconFlame from '@/assets/lend/icon-fire.svg';
import iconSort from '@/assets/lend/icon-sort.svg';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../ui/tooltip';
import {
  OrderColumn,
  OrderType,
  type IAsset,
  type OrderSorting,
} from './AssetsTable.types';

type AssetsTableProps = {
  assets: IAsset[];
};

export const AssetsTable: FC<AssetsTableProps> = ({ assets }) => {
  const [sortDirection, setSortDirection] = useState<OrderSorting>(
    OrderType.ASC,
  );
  const [sortedAssets, setSortedAssets] = useState<IAsset[]>(assets);
  useEffect(() => {
    setSortedAssets(assets);
  }, [assets]);

  const sortAssets = useCallback(
    (column: keyof IAsset) => {
      setSortDirection((prev) =>
        prev === OrderType.ASC ? OrderType.DESC : OrderType.ASC,
      );
      const sorted = [...sortedAssets].sort((a, b) => {
        if (column === OrderColumn.SYMBOL || column === OrderColumn.NAME) {
          return sortDirection === OrderType.ASC
            ? a[column].localeCompare(b[column])
            : b[column].localeCompare(a[column]);
        } else if (column === OrderColumn.BALANCE) {
          const balanceA = parseFloat(a.balance.replace(/,/g, ''));
          const balanceB = parseFloat(b.balance.replace(/,/g, ''));
          return sortDirection === OrderType.ASC
            ? balanceA - balanceB
            : balanceB - balanceA;
        } else if (column === OrderColumn.APY) {
          const apyA = parseFloat(a.apy.replace('%', ''));
          const apyB = parseFloat(b.apy.replace('%', ''));
          return sortDirection === OrderType.ASC ? apyA - apyB : apyB - apyA;
        }
        return 0;
      });
      setSortedAssets(sorted);
    },
    [sortDirection, sortedAssets],
  );

  return (
    <Table className="w-full border-separate">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-none text-xs">
          <TableHead>
            <div className="flex items-center gap-2">
              <span>Assets</span>
              {assets.some((asset) => asset.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.SYMBOL)}
                  aria-label="Sort Assets"
                >
                  <img src={iconSort} alt="Sort Icon" className="w-2 h-2.5" />
                </Button>
              )}
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <span>Wallet Balance</span>
              {assets.some((asset) => asset.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.BALANCE)}
                  aria-label="Sort Wallet Balance"
                >
                  <img src={iconSort} alt="Sort Icon" className="w-2 h-2.5" />
                </Button>
              )}
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                APY
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer leading-0">
                      <Info className="inline h-3 w-3 text-neutral-400 ml-1" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-3xs"
                  >
                    <p>
                      APY - The annual percentage yield (APY) is the real rate
                      of return earned on an investment, taking into account the
                      effect of compounding interest.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {assets.some((asset) => asset.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.APY)}
                  aria-label="Sort APY"
                >
                  <img src={iconSort} alt="Sort Icon" className="w-2 h-2.5" />
                </Button>
              )}
            </div>
          </TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAssets.map((asset, index) => (
          <React.Fragment key={asset.symbol}>
            <TableRow className="hover:bg-transparent">
              <TableCell className="border-neutral-800 border-y-1 border-l-1 rounded-tl-[1.25rem] rounded-bl-[1.25rem]">
                <div className="flex items-center">
                  {asset.icon}
                  <div className="ml-2">
                    <p className="text-gray-50 font-medium">{asset.symbol}</p>
                    <p className="text-neutral-500 font-medium text-xs">
                      {asset.name}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <p className="text-gray-50 font-medium">{asset.balance}</p>
                <p className="text-neutral-500 font-medium text-xs">
                  ~${asset.usdBalance}
                </p>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <div className="flex items-center">
                  <p className="text-gray-50 font-medium">{asset.apy}</p>
                  {asset.isHighApy && (
                    <img
                      src={iconFlame}
                      alt="High APY"
                      className="ml-1.5 w-3"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y border-r rounded-tr-[1.25rem] rounded-br-[1.25rem]">
                <div className="flex items-center gap-4 justify-end">
                  <Button
                    color="orange"
                    className="rounded-full min-w-24 h-10 hover:cursor-pointer"
                  >
                    Lend
                  </Button>

                  <Button
                    variant="ghost"
                    className="hover:border-none cursor-pointer rounded-full "
                  >
                    <span className="text-gray-400">
                      <EllipsisVertical className="w-5" />
                    </span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            {index !== sortedAssets.length - 1 && (
              <TableRow className="h-1 hover:bg-transparent border-none">
                <TableCell className="p-0.5" colSpan={4}></TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
        {sortedAssets.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              No assets found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
