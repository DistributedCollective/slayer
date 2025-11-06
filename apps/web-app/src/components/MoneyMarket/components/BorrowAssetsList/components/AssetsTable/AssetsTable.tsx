import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import React, { useCallback, useEffect, useState, type FC } from 'react';

import { Button } from '@/components/ui/button';
import { InfoButton } from '@/components/ui/info-button';
import {
  OrderType,
  type OrderSorting,
} from '@/components/ui/table/table.types';
import { sdk } from '@/lib/sdk';
import { useSlayerTx } from '@/lib/transactions';
import { type MoneyMarketPoolReserve, type Token } from '@sovryn/slayer-sdk';
import { Decimal } from '@sovryn/slayer-shared';
import { useAccount, useWriteContract } from 'wagmi';

type AssetsTableProps = {
  assets: MoneyMarketPoolReserve[];
};

export const AssetsTable: FC<AssetsTableProps> = ({ assets }) => {
  const [sortDirection, setSortDirection] = useState<OrderSorting>(
    OrderType.ASC,
  );
  const [sortedAssets, setSortedAssets] =
    useState<MoneyMarketPoolReserve[]>(assets);
  useEffect(() => {
    setSortedAssets(assets);
  }, [assets]);

  const sortAssets = useCallback(
    (column: keyof MoneyMarketPoolReserve) => {
      const newSortDirection =
        sortDirection === OrderType.ASC ? OrderType.DESC : OrderType.ASC;
      setSortDirection(newSortDirection);

      // const sorted = [...sortedAssets].sort((a, b) => {
      //   if (column === OrderColumn.SYMBOL) {
      //     return newSortDirection === OrderType.ASC
      //       ? a[column].localeCompare(b[column])
      //       : b[column].localeCompare(a[column]);
      //   } else if (column === OrderColumn.BALANCE) {
      //     const balanceA = parseFloat(a.balance.replace(/,/g, ''));
      //     const balanceB = parseFloat(b.balance.replace(/,/g, ''));
      //     return newSortDirection === OrderType.ASC
      //       ? balanceA - balanceB
      //       : balanceB - balanceA;
      //   } else if (column === OrderColumn.APY) {
      //     const apyA = parseFloat(a.apy.replace('%', ''));
      //     const apyB = parseFloat(b.apy.replace('%', ''));
      //     return newSortDirection === OrderType.ASC ? apyA - apyB : apyB - apyA;
      //   }
      //   return 0;
      // });

      // setSortedAssets(sorted);
    },
    [sortDirection],
  );

  const { address } = useAccount();

  const { writeContractAsync } = useWriteContract();

  const { begin } = useSlayerTx();

  const handleBorrow = async (token: Token) => {
    begin(async () => {
      const s = await sdk.moneyMarket.borrow(token, Decimal.from(1), 1, {
        account: address!,
      });
      console.log('Transaction Request:', s);
      return s;
    });

    // const msg = await sdk.moneyMarket.borrow(
    //   token,
    //   Decimal.from(1),
    //   BorrowRateMode.stable,
    //   {
    //     account: address!,
    //   },
    // );
    // console.log('Transaction Request:', msg);

    // if (msg.length) {
    //   // const data = await writeContractAsync<any>(msg[0]);
    //   // console.log('Transaction Response:', data);
    // }
    // const d = await signMessageAsync(msg);
    // console.warn('Signature:', { data, d });
  };

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
              <div className="flex items-center">
                Available
                <InfoButton content="This is the total amount available for you to borrow. You can borrow based on your collateral and until the borrow cap is reached." />
              </div>
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
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAssets.map((asset, index) => (
          <React.Fragment key={asset.token.address}>
            <TableRow className="hover:bg-transparent">
              <TableCell className="border-neutral-800 border-y border-l rounded-tl-[1.25rem] rounded-bl-[1.25rem]">
                <div className="flex items-center min-w-24">
                  <img
                    src={asset.token.logoUrl}
                    alt={asset.token.symbol}
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
                <p className="text-gray-50 font-medium">
                  {Decimal.from(asset.totalLiquidity).toString()}{' '}
                  {asset.token.symbol}
                </p>
                <p className="text-neutral-500 font-medium text-xs">
                  ~${asset.totalLiquidity}
                </p>
              </TableCell>
              <TableCell className="border-neutral-800 border-y">
                <div className="flex items-center">
                  <p className="text-gray-50 font-medium">{0}%</p>
                </div>
              </TableCell>
              <TableCell className="border-neutral-800 border-y border-r rounded-tr-[1.25rem] rounded-br-[1.25rem]">
                <div className="flex items-center justify-end gap-4">
                  <Button
                    className="rounded-full min-w-24 h-10 hover:cursor-pointer"
                    onClick={() => handleBorrow(asset.token)}
                  >
                    Borrow
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
