import { Decimal } from '@sovryn/slayer-shared';
import clsx from 'clsx';
import { CopyIcon } from 'lucide-react';
import { type FC, useCallback, useMemo } from 'react';
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

function formatAmount(value: string | number | bigint, decimals = 8) {
  try {
    const dec = Decimal.from(value);
    let str = dec.d.toFixed(decimals).replace(/\.?(0+)$/, '');
    // if the value is very small, try with more decimals
    if (str === '' || str === '0') {
      str = dec.d.toFixed(decimals * 2).replace(/\.?(0+)$/, '');
    }
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
    <span aria-label="approximate" title="Approximate value">
      &#x7e;&nbsp;
    </span>
  ) : null;

  const content = useMemo(
    () => (
      <>
        {approxSign}
        {prefix}
        {formatted}
        {suffix && <span>&nbsp;{suffix}</span>}
      </>
    ),
    [approxSign, prefix, formatted, suffix],
  );

  if (!showTooltip) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={clsx(className, 'w-auto cursor-pointer')}>
          {content}
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
