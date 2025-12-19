import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import { Fragment, useCallback, useMemo, type FC } from 'react';

import { repayRequestStore } from '@/components/MoneyMarket/stores/repay-request.store';
import { AmountRenderer } from '@/components/ui/amount-renderer';
import { Button } from '@/components/ui/button';
import { InfoButton } from '@/components/ui/info-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { revalidateQuery } from '@/integrations/tanstack-query/root-provider';
import { sdk } from '@/lib/sdk';
import { useSlayerTx } from '@/lib/transactions';
import {
  BORROW_RATE_MODES,
  type BorrowRateMode,
  type MoneyMarketPoolPosition,
} from '@sovryn/slayer-sdk';
import { Decimal } from '@sovryn/slayer-shared';
import { useAccount } from 'wagmi';

type AssetsTableProps = {
  assets: MoneyMarketPoolPosition[];
};

export const AssetsTable: FC<AssetsTableProps> = ({ assets }) => {
  const { address } = useAccount();
  const items = useMemo(
    () => assets.filter((a) => Decimal.from(a.borrowed).gt(0)),
    [assets],
  );

  const { begin } = useSlayerTx({
    onCompleted: () =>
      revalidateQuery({
        queryKey: [
          'money-market:positions',
          items[0]?.pool.id || 'default',
          address,
        ],
      }),
  });

  const repayLoan = (position: MoneyMarketPoolPosition) =>
    repayRequestStore.getState().setPosition(position);

  const handleBorrowRateChange = useCallback(
    (position: MoneyMarketPoolPosition, value: string) => {
      const currentMode = position.borrowRateMode;
      const selected = BigInt(value) as BorrowRateMode;

      if (currentMode === selected) {
        return;
      }

      return begin(() =>
        sdk.moneyMarket.swapBorrowRateMode(
          {
            ...position.reserve,
            token: position.token,
            pool: position.pool,
          },
          currentMode,
          {
            account: address!,
          },
        ),
      );
    },
    [address, begin],
  );

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
                <InfoButton content="APY is the annual percentage yield including compounding." />
              </div>
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                APY type
                <InfoButton content="Variable rate changes with market conditions." />
              </div>
            </div>
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((asset, index) => {
          return (
            <Fragment key={asset.id}>
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
                  <div className="flex flex-col gap-1">
                    <AmountRenderer value={asset.borrowed} />
                    <AmountRenderer
                      value={asset.borrowedUsd}
                      prefix="$"
                      showApproxSign
                      className="text-neutral-500 font-medium text-xs"
                    />
                  </div>
                </TableCell>

                <TableCell className="border-neutral-800 border-y">
                  <div className="flex items-center">
                    <AmountRenderer
                      value={asset.borrowApy}
                      suffix="%"
                      showApproxSign
                    />
                  </div>
                </TableCell>

                <TableCell className="border-neutral-800 border-y">
                  <div className="flex items-center">
                    <Select
                      value={String(asset.borrowRateMode)}
                      onValueChange={(value) =>
                        handleBorrowRateChange(asset, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={String(BORROW_RATE_MODES.variable)}>
                          APY, variable{' '}
                          <AmountRenderer
                            value={asset.variableBorrowApy}
                            suffix="%"
                            showApproxSign
                          />
                        </SelectItem>
                        {((asset.reserve.stableBorrowRateEnabled &&
                          !asset.collateral) ||
                          asset.borrowRateMode ===
                            BORROW_RATE_MODES.stable) && (
                          <SelectItem value={String(BORROW_RATE_MODES.stable)}>
                            APY, stable{' '}
                            <AmountRenderer
                              value={asset.stableBorrowApy}
                              suffix="%"
                              showApproxSign
                            />
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>

                <TableCell className="border-neutral-800 border-y border-r rounded-tr-[1.25rem] rounded-br-[1.25rem]">
                  <div className="flex items-center justify-end">
                    <Button
                      className="rounded-full min-w-24 h-10 hover:cursor-pointer"
                      variant="secondary"
                      onClick={() => repayLoan(asset)}
                    >
                      Repay
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
          );
        })}

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
