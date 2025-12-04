import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import { Fragment, useCallback, useMemo, type FC } from 'react';

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
    () => assets.filter((asset) => Decimal.from(asset.suppliedBalance).gt(0)),
    [assets],
  );

  // const [sortDirection, setSortDirection] = useState<OrderSorting>(
  //   OrderType.ASC,
  // );
  // const [sortedAssets, setSortedAssets] =
  //   useState<MoneyMarketPoolPosition[]>(assets);
  // useEffect(() => {
  //   setSortedAssets(assets);
  // }, [assets]);

  // const sortAssets = useCallback(
  //   (column: keyof MoneyMarketPoolPosition) => {
  //     const newSortDirection =
  //       sortDirection === OrderType.ASC ? OrderType.DESC : OrderType.ASC;
  //     setSortDirection(newSortDirection);

  //     const sorted = [...sortedAssets].sort((a, b) => {
  //       if (column === OrderColumn.SYMBOL) {
  //         return newSortDirection === OrderType.ASC
  //           ? a[column].localeCompare(b[column])
  //           : b[column].localeCompare(a[column]);
  //       } else if (column === OrderColumn.BALANCE) {
  //         const balanceA = parseFloat(a.balance.replace(/,/g, ''));
  //         const balanceB = parseFloat(b.balance.replace(/,/g, ''));
  //         return newSortDirection === OrderType.ASC
  //           ? balanceA - balanceB
  //           : balanceB - balanceA;
  //       } else if (column === OrderColumn.APY) {
  //         const apyA = parseFloat(a.apy.replace('%', ''));
  //         const apyB = parseFloat(b.apy.replace('%', ''));
  //         return newSortDirection === OrderType.ASC ? apyA - apyB : apyB - apyA;
  //       }
  //       return 0;
  //     });

  //     setSortedAssets(sorted);
  //   },
  //   [sortDirection],
  // );

  const toggleCollateral = useCallback((symbol: string) => {
    // setSortedAssets((prevAssets) =>
    //   prevAssets.map((asset) =>
    //     asset.symbol === symbol
    //       ? { ...asset, collateral: !asset.collateral }
    //       : asset,
    //   ),
    // );
  }, []);

  return (
    <Table className="w-full border-separate">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-none text-xs">
          <TableHead>
            <div className="flex items-center gap-2">
              <span>Asset</span>
              {/* {assets.some((asset) => asset.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.SYMBOL)}
                  aria-label="Sort Assets"
                >
                  <img src={iconSort} alt="Sort Icon" className="w-2 h-2.5" />
                </Button>
              )} */}
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <span>Balance</span>
              {/* {assets.some((asset) => asset.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.BALANCE)}
                  aria-label="Sort Wallet Balance"
                >
                  <img src={iconSort} alt="Sort Icon" className="w-2 h-2.5" />
                </Button>
              )} */}
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                APY
                <InfoButton content="APY - The annual percentage yield (APY) is the real rate of return earned on an investment, taking into account the effect of compounding interest." />
              </div>
              {/* {assets.some((asset) => asset.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.APY)}
                  aria-label="Sort APY"
                >
                  <img src={iconSort} alt="Sort Icon" className="w-2 h-2.5" />
                </Button>
              )} */}
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
        {items.map((asset, index) => (
          <Fragment key={asset.token.address}>
            <TableRow className="hover:bg-transparent">
              <TableCell className="border-neutral-800 border-y border-l rounded-tl-[1.25rem] rounded-bl-[1.25rem]">
                <div className="flex items-center min-w-24">
                  <img
                    src={asset.token.logoUrl}
                    alt={asset.token.name}
                    className="w-8 h-8"
                  />
                  <div className="ml-2">
                    <p className="text-gray-50 font-medium">
                      {asset.token.symbol}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <AmountRenderer value={asset.suppliedBalance} />
                {/* <p className="text-neutral-500 font-medium text-xs">
                  <AmountRenderer
                    value={asset.suppliedBalance}
                    prefix="$"
                    showApproxSign
                  />
                </p> */}
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <div className="flex items-center">
                  <p className="text-gray-50 font-medium">
                    {asset.stableBorrowRate}
                  </p>
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <div className="flex items-center">
                  <Switch
                    className="cursor-pointer data-[state=checked]:bg-primary"
                    checked={asset.usageAsCollateralEnabledOnUser}
                    id={`collateral-${asset.token.address}`}
                    onClick={() => toggleCollateral(asset.id)}
                    // disabled={!asset}
                  />
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y border-r rounded-tr-[1.25rem] rounded-br-[1.25rem]">
                <div className="flex items-center justify-end">
                  <Button
                    className="rounded-full min-w-24 h-10 hover:cursor-pointer"
                    variant="secondary"
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
