import { Accordion } from '@/components/ui/accordion';
import { useState, type FC } from 'react';
import { AmountRenderer } from '../../../ui/amount-renderer';
import { PoolPositionStat } from '../PoolPositionStat/PoolPositionStat';
import { AssetsTable } from './components/AssetsTable/AssetsTable';
import type { LendPosition } from './LendPositionsList.types';

type LendPositionsListProps = {
  supplyBalance: number;
  supplyWeightedApy: number;
  collateralBalance: number;
  lendPositions: LendPosition[];
  loading?: boolean;
};

export const LendPositionsList: FC<LendPositionsListProps> = ({
  supplyBalance,
  supplyWeightedApy,
  collateralBalance,
  lendPositions,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Accordion
      label={
        <span className="text-[1rem] font-medium">Your lending assets</span>
      }
      className="px-4 py-3 space-y-3 lg:p-6 border border-neutral-700"
      labelClassName="justify-between h-7 flex items-center"
      open={open}
      onClick={setOpen}
    >
      <div className="flex flex-col gap-2 mb-2 lg:flex-row lg:gap-6 lg:mb-6">
        <PoolPositionStat
          label="Balance"
          value={
            <AmountRenderer value={supplyBalance} decimals={2} prefix="$" />
          }
        />
        <PoolPositionStat
          label="APY"
          labelInfo="Compounding interest accrued by deposit or borrowing on the lending pool"
          value={
            <AmountRenderer value={supplyWeightedApy} decimals={2} suffix="%" />
          }
        />
        <PoolPositionStat
          label="Collateral"
          labelInfo="The total amount of your assets denominated in USD that can be used as collateral for borrowing assets."
          value={
            <AmountRenderer value={collateralBalance} decimals={2} prefix="$" />
          }
        />
      </div>

      <AssetsTable assets={lendPositions} />
    </Accordion>
  );
};
