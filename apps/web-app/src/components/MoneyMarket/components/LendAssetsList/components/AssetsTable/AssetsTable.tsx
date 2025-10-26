import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import { Fragment, useCallback, useEffect, useState, type FC } from 'react';

import iconSort from '@/assets/lend/icon-sort.svg';
import { Button } from '@/components/ui/button';
import { InfoButton } from '@/components/ui/info-button';
import {
  OrderColumn,
  OrderType,
  type OrderSorting,
} from '@/components/ui/table/table.types';
import { Check, X } from 'lucide-react';
import type { LendAsset } from '../../LendAssetsList.types';

type AssetsTableProps = {
  assets: LendAsset[];
};

export const AssetsTable: FC<AssetsTableProps> = ({ assets }) => {
  const [sortDirection, setSortDirection] = useState<OrderSorting>(
    OrderType.ASC,
  );
  const [sortedAssets, setSortedAssets] = useState<LendAsset[]>(assets);
  useEffect(() => {
    setSortedAssets(assets);
  }, [assets]);

  const sortAssets = useCallback(
    (column: keyof LendAsset) => {
      const newSortDirection =
        sortDirection === OrderType.ASC ? OrderType.DESC : OrderType.ASC;
      setSortDirection(newSortDirection);

      const sorted = [...sortedAssets].sort((a, b) => {
        if (column === OrderColumn.SYMBOL) {
          return newSortDirection === OrderType.ASC
            ? a[column].localeCompare(b[column])
            : b[column].localeCompare(a[column]);
        } else if (column === OrderColumn.BALANCE) {
          const balanceA = parseFloat(a.balance.replace(/,/g, ''));
          const balanceB = parseFloat(b.balance.replace(/,/g, ''));
          return newSortDirection === OrderType.ASC
            ? balanceA - balanceB
            : balanceB - balanceA;
        } else if (column === OrderColumn.APY) {
          const apyA = parseFloat(a.apy.replace('%', ''));
          const apyB = parseFloat(b.apy.replace('%', ''));
          return newSortDirection === OrderType.ASC ? apyA - apyB : apyB - apyA;
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
              <span>Asset</span>
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
              <span>Wallet balance</span>
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
                <InfoButton content="APY - The annual percentage yield (APY) is the real rate of return earned on an investment, taking into account the effect of compounding interest." />
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
          <TableHead>
            <div className="flex items-center gap-2">
              <div>Can be collateral</div>
            </div>
          </TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAssets.map((asset, index) => (
          <Fragment key={asset.symbol}>
            <TableRow className="hover:bg-transparent">
              <TableCell className="border-neutral-800 border-y border-l rounded-tl-[1.25rem] rounded-bl-[1.25rem]">
                <div className="flex items-center min-w-24">
                  <img
                    src={asset.icon}
                    alt={asset.symbol}
                    className="w-8 h-8"
                  />
                  <div className="ml-2">
                    <p className="text-gray-50 font-medium">{asset.symbol}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <p className="text-gray-50 font-medium">{asset.balance}</p>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <div className="flex items-center">
                  <p className="text-gray-50 font-medium">{asset.apy}%</p>
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <div className="flex items-center">
                  {asset.canBeCollateral ? (
                    <Check className="text-emerald-500 w-4 h-4" />
                  ) : (
                    <X className="text-red-500 w-4 h-4" />
                  )}
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y border-r rounded-tr-[1.25rem] rounded-br-[1.25rem]">
                <div className="flex items-center justify-end gap-4">
                  <Button className="rounded-full min-w-24 h-10 hover:cursor-pointer">
                    Lend
                  </Button>
                  <Button
                    className="rounded-full min-w-24 h-10 hover:cursor-pointer"
                    variant="secondary"
                  >
                    Details
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            {index !== sortedAssets.length - 1 && (
              <TableRow className="h-1 hover:bg-transparent border-none">
                <TableCell className="p-0.5" colSpan={5}></TableCell>
              </TableRow>
            )}
          </Fragment>
        ))}
        {sortedAssets.length === 0 && (
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
