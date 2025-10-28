import type { FC } from 'react';
import { InfoButton } from '../ui/info-button';

type IStatsCardProps = {
  title: string;
  value: string;
  percent: string;
  tooltip?: string;
};

export const StatsCard: FC<IStatsCardProps> = ({
  title,
  value,
  percent,
  tooltip,
}) => (
  <div className="p-4 rounded-[1.25rem] lg:max-w-72 border border-neutral-700 w-full">
    <div className="text-sm font-medium text-neutral-400 flex items-center">
      {title}
      {tooltip && <InfoButton content={tooltip} />}
    </div>
    <div className="text-3xl font-semibold mt-2">{value}</div>
    <div className="text-sm font-medium text-neutral-400 mt-2">{percent}</div>
  </div>
);
