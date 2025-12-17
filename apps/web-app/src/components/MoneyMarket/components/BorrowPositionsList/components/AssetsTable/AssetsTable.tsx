import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import { Fragment, useCallback, useMemo, useState, type FC } from 'react';

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
import type { MoneyMarketPoolPosition } from '@sovryn/slayer-sdk';
import { Decimal } from '@sovryn/slayer-shared';
import type { BorrowPosition } from '../../BorrowPositionsList.types';

type AssetsTableProps = {
  assets: MoneyMarketPoolPosition[];
};

export const AssetsTable: FC<AssetsTableProps> = ({ assets }) => {
  const items = useMemo(
    () => assets.filter((a) => Decimal.from(a.borrowed).gt(0)),
    [assets],
  );

  const [selectedApy, setSelectedApy] = useState<Record<string, number>>({});

  const parsePct = (v: unknown): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v.replace('%', '').trim());
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const inferDefaultSelected = (asset: BorrowPosition): number => {
    const candidates = (asset.apyType ?? [])
      .map(Number)
      .filter(Number.isFinite);
    const active = parsePct(asset.apy);
    if (candidates.includes(active)) return active;
    return candidates.length ? candidates[0] : active;
  };

  const rowKey = useMemo(
    () => (asset: BorrowPosition, idx: number) =>
      asset.poolId ?? asset.address ?? `${asset.symbol}-${idx}`,
    [],
  );

  const currentApy = useCallback(
    (a: BorrowPosition, idx: number) =>
      selectedApy[rowKey(a, idx)] ?? inferDefaultSelected(a),
    [selectedApy, rowKey],
  );

  const repayLoan = (position: MoneyMarketPoolPosition) =>
    repayRequestStore.getState().setPosition(position);

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
                      value={String(asset.borrowApy)}
                      // onValueChange={(val) =>
                      //   handleApyTypeChange(asset, index, val)
                      // }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={String(asset.variableBorrowApy)}>
                          APY, variable{' '}
                          <AmountRenderer
                            value={asset.variableBorrowApy}
                            suffix="%"
                            showApproxSign
                          />
                        </SelectItem>
                        <SelectItem value={String(asset.stableBorrowApy)}>
                          APY, stable{' '}
                          <AmountRenderer
                            value={asset.stableBorrowApy}
                            suffix="%"
                            showApproxSign
                          />
                        </SelectItem>
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
