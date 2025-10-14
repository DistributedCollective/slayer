import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import type { FC } from 'react';

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
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-pointer leading-0">
              <Info className="inline h-3 w-3 text-neutral-400 ml-1" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="max-w-3xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    <div className="text-3xl font-semibold mt-2">{value}</div>
    <div className="text-sm font-medium text-neutral-400 mt-2">{percent}</div>
  </div>
);
