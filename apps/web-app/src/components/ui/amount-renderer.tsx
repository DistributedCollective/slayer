import { CopyIcon } from 'lucide-react';
import { type FC, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export type AmountRendererProps = {
  value: string | number | bigint;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  showTooltip?: boolean;
};

function formatAmount(value: string | number | bigint, decimals = 4) {
  let num: number;
  if (typeof value === 'bigint') {
    num = Number(value);
  } else {
    num = Number(value);
  }
  if (isNaN(num)) return '-';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export const AmountRenderer: FC<AmountRendererProps> = ({
  value,
  decimals = 4,
  suffix = '',
  prefix = '',
  className = '',
  showTooltip = true,
}) => {
  const formatted = formatAmount(value, decimals);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(String(value));
  }, [value]);

  if (!showTooltip) {
    return (
      <span className={className}>
        {prefix}
        {formatted}
        {suffix && <span> {suffix}</span>}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className} style={{ cursor: 'pointer' }}>
          {prefix}
          {formatted}
          {suffix && <span> {suffix}</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className="flex items-center gap-2">
          <span>{String(value)}</span>
          <CopyIcon
            size={16}
            onClick={copyToClipboard}
            role="button"
            className="hover:opacity-70 cursor-pointer text-gray-700"
          />
        </span>
      </TooltipContent>
    </Tooltip>
  );
};
