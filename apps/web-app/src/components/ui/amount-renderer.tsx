import { Decimal } from '@sovryn/slayer-shared';
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
  showApproxSign?: boolean;
};

function formatAmount(value: string | number | bigint, decimals = 4) {
  try {
    const dec = Decimal.from(value);
    let str = dec.d.toFixed(decimals);
    str = str.replace(/\.?(0+)$/, '');
    return str;
  } catch {
    return '-';
  }
}

export const AmountRenderer: FC<AmountRendererProps> = ({
  value,
  decimals = 4,
  suffix = '',
  prefix = '',
  className = '',
  showTooltip = true,
  showApproxSign = false,
}) => {
  const formatted = formatAmount(value, decimals);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(String(value));
  }, [value]);

  const approxSign = showApproxSign ? (
    <span
      aria-label="approximate"
      title="Approximate value"
      style={{ marginRight: 2 }}
    >
      &#x223C;
    </span>
  ) : null;

  if (!showTooltip) {
    return (
      <span className={className}>
        {approxSign}
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
          {approxSign}
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
