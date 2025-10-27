import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
} from 'react';

import iconSort from '@/assets/lend/icon-sort.svg';
import { Button } from '@/components/ui/button';
import { InfoButton } from '@/components/ui/info-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OrderColumn,
  OrderType,
  type OrderSorting,
} from '@/components/ui/table/table.types';
import type { BorrowPosition } from '../../BorrowPositionsList.types';

type AssetsTableProps = {
  assets: BorrowPosition[];
};

export const AssetsTable: FC<AssetsTableProps> = ({ assets }) => {
  const [sortDirection, setSortDirection] = useState<OrderSorting>(
    OrderType.ASC,
  );
  const [sortedAssets, setSortedAssets] = useState<BorrowPosition[]>(assets);

  // Selection per *object instance* (no collisions between pools with same symbol)
  const selectionRef = useRef<WeakMap<BorrowPosition, number>>(new WeakMap());
  // Just to trigger rerenders after updating WeakMap
  const [, force] = useState(0);
  const bump = useCallback(() => force((v) => v + 1), []);

  useEffect(() => {
    setSortedAssets(assets);
    // seed defaults for any new objects
    for (const a of assets) {
      if (!selectionRef.current.has(a)) {
        selectionRef.current.set(a, inferDefaultSelected(a));
      }
    }
  }, [assets]);

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

  // Current (selected) APY per object
  const currentApy = useCallback(
    (a: BorrowPosition) =>
      selectionRef.current.get(a) ?? inferDefaultSelected(a),
    [],
  );

  const sortAssets = useCallback(
    (column: OrderColumn) => {
      const nextDir =
        sortDirection === OrderType.ASC ? OrderType.DESC : OrderType.ASC;
      setSortDirection(nextDir);

      const sorted = [...sortedAssets].sort((a, b) => {
        switch (column) {
          case OrderColumn.SYMBOL: {
            const cmp = a.symbol.localeCompare(b.symbol);
            return nextDir === OrderType.ASC ? cmp : -cmp;
          }
          case OrderColumn.BALANCE: {
            const av = parseFloat(String(a.balance).replace(/,/g, '')) || 0;
            const bv = parseFloat(String(b.balance).replace(/,/g, '')) || 0;
            return nextDir === OrderType.ASC ? av - bv : bv - av;
          }
          case OrderColumn.APY:
          case OrderColumn.APY_TYPE: {
            const av = currentApy(a);
            const bv = currentApy(b);
            return nextDir === OrderType.ASC ? av - bv : bv - av;
          }
          default:
            return 0;
        }
      });

      setSortedAssets(sorted);
    },
    [sortDirection, sortedAssets, currentApy],
  );

  const handleApyTypeChange = useCallback(
    (asset: BorrowPosition, value: string) => {
      selectionRef.current.set(asset, Number(value));
      bump(); // trigger re-render
    },
    [bump],
  );

  // If you do have a stable unique id, use it just for React keys (not for state):
  const rowKey = (asset: BorrowPosition, idx: number) =>
    // prefer poolId/address if present; fall back to a stable combo + idx
    (asset as any).poolId ?? (asset as any).address ?? `${asset.symbol}-${idx}`;

  return (
    <Table className="w-full border-separate">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-none text-xs">
          <TableHead>
            <div className="flex items-center gap-2">
              <span>Asset</span>
              {assets.some((a) => a.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.SYMBOL)}
                  aria-label="Sort Assets"
                >
                  <img src={iconSort} alt="Sort" className="w-2 h-2.5" />
                </Button>
              )}
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <span>Balance</span>
              {assets.some((a) => a.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.BALANCE)}
                  aria-label="Sort Wallet Balance"
                >
                  <img src={iconSort} alt="Sort" className="w-2 h-2.5" />
                </Button>
              )}
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                APY
                <InfoButton content="APY is the annual percentage yield including compounding." />
              </div>
              {assets.some((a) => a.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.APY)}
                  aria-label="Sort APY"
                >
                  <img src={iconSort} alt="Sort" className="w-2 h-2.5" />
                </Button>
              )}
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                APY type
                <InfoButton content="Variable rate changes with market conditions." />
              </div>
              {assets.some((a) => a.isSortable) && (
                <Button
                  variant="ghost"
                  className="p-0 cursor-pointer hover:opacity-80 dark:hover:bg-transparent"
                  onClick={() => sortAssets(OrderColumn.APY_TYPE)}
                  aria-label="Sort APY type"
                >
                  <img src={iconSort} alt="Sort" className="w-2 h-2.5" />
                </Button>
              )}
            </div>
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>

      <TableBody>
        {sortedAssets.map((asset, index) => {
          const selected = currentApy(asset);
          const types = (asset.apyType ?? [])
            .map(Number)
            .filter(Number.isFinite);
          const options = [selected, ...types.filter((t) => t !== selected)];

          return (
            <Fragment key={rowKey(asset, index)}>
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
                  <p className="text-neutral-500 font-medium text-xs">
                    ~${asset.balanceUsd}
                  </p>
                </TableCell>

                <TableCell className="border-neutral-800 border-y">
                  <div className="flex items-center">
                    <p className="text-gray-50 font-medium">{selected}%</p>
                  </div>
                </TableCell>

                <TableCell className="border-neutral-800 border-y">
                  <div className="flex items-center">
                    <Select
                      value={String(selected)}
                      onValueChange={(val) => handleApyTypeChange(asset, val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((type) => (
                          <SelectItem
                            value={String(type)}
                            key={`${rowKey(asset, index)}-${type}`}
                          >
                            APY, variable {type}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>

                <TableCell className="border-neutral-800 border-y border-r rounded-tr-[1.25rem] rounded-br-[1.25rem]">
                  <div className="flex items-center justify-end">
                    <Button
                      className="rounded-full min-w-24 h-10 hover:cursor-pointer"
                      variant="secondary"
                    >
                      Repay
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
          );
        })}

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
