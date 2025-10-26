import { Accordion } from '@/components/ui/accordion';
import { Settings, Zap } from 'lucide-react';
import { useState, type FC } from 'react';
import { PoolPositionStat } from '../PoolPositionStat/PoolPositionStat';
import type { BorrowPosition } from './BorrowPositionsList.types';
import { AssetsTable } from './components/AssetsTable/AssetsTable';

type BorrowPositionsListProps = {
  supplyBalance: number;
  supplyWeightedApy: number;
  borrowPower: number;
  borrowPositions: BorrowPosition[];
  loading?: boolean;
};

export const BorrowPositionsList: FC<BorrowPositionsListProps> = ({
  supplyBalance,
  supplyWeightedApy,
  borrowPower,
  borrowPositions,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Accordion
      label={
        <div className="flex items-center gap-6">
          <span className="text-[1rem] font-medium">Your loans</span>
          <div className="flex gap-3 items-center">
            <span className="text-neutral-300 font-medium text-sm">E-Mode</span>
            <Zap className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-neutral-300 font-medium text-sm">
              Disabled
            </span>
            <Settings className="w-4 h-4 text-neutral-300" />
          </div>
        </div>
      }
      className="px-4 py-3 space-y-3 lg:p-6 border border-neutral-700"
      labelClassName="justify-between h-7 flex items-center"
      open={open}
      onClick={setOpen}
    >
      <div className="flex flex-col gap-2 mb-2 lg:flex-row lg:gap-6 lg:mb-6">
        <PoolPositionStat
          label="Balance"
          value={`$${supplyBalance.toFixed(2)}`}
        />
        <PoolPositionStat
          label="APY"
          labelInfo="Compounding interest accrued by deposit or borrowing on the lending pool"
          value={`${supplyWeightedApy.toFixed(2)}%`}
        />
        <PoolPositionStat
          label="Borrow power used"
          labelInfo="The percentage of your borrow power that is currently being used."
          value={`${borrowPower.toFixed(2)}%`}
        />
      </div>

      <AssetsTable assets={borrowPositions} />
    </Accordion>
  );
};
