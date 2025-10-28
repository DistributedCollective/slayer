import { InfoButton } from '@/components/ui/info-button';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import type { FC, ReactElement } from 'react';

type StatisticsCardProps = {
  label: string;
  value?: ReactElement;
  link?: string;
  help?: string;
  className?: string;
  valueClassName?: string;
};

export const StatisticsCard: FC<StatisticsCardProps> = ({
  link,
  label,
  value,
  help,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex space-x-2 items-center text-gray-30">
        <span className="text-xs font-medium">{label}</span>
        {help && <InfoButton content={help} />}
      </div>

      <div className="text-white flex items-center">
        {value ? (
          <>
            {value}
            {link && (
              <a href={link} className="ml-3" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 text-gray-30" />
              </a>
            )}
          </>
        ) : (
          <span>N/A</span>
        )}
      </div>
    </div>
  );
};
