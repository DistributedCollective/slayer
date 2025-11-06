import { cn } from '@/lib/utils';

import { InfoButton } from '@/components/ui/info-button';
import type { FC, ReactNode } from 'react';

type PoolPositionStatProps = {
  label: string;
  labelInfo?: string;
  className?: string;
  value: ReactNode;
};

export const PoolPositionStat: FC<PoolPositionStatProps> = ({
  label,
  labelInfo,
  className,
  value,
}) => (
  <div
    className={cn(
      'flex items-center justify-between lg:gap-2 lg:px-3 lg:py-2 lg:rounded-md lg:bg-neutral-700',
      className,
    )}
  >
    <span className="text-xs font-bold flex text-gray-300">{label}</span>

    <div className="flex gap-[6px] items-center">
      <p className="cursor-pointer text-xs font-bold lg:text-sm lg:text-white">
        {value}
      </p>

      {labelInfo && <InfoButton content={labelInfo} />}
    </div>
  </div>
);
