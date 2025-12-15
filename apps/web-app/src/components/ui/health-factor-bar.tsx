import clsx from 'clsx';
import { useCallback, useMemo, type FC } from 'react';
import { MINIMUM_HEALTH_FACTOR } from '../MoneyMarket/constants';

type HealthFactorBarProps = {
  value: number;
  options?: {
    start: number;
    middleStart: number;
    middleEnd: number;
    end: number;
  };
};

export const HealthFactorBar: FC<HealthFactorBarProps> = ({
  value,
  options = {
    start: 1,
    middleStart: MINIMUM_HEALTH_FACTOR,
    middleEnd: 1.5,
    end: 2,
  },
}) => {
  const getBlurWidth = useCallback(
    (start: number, end: number) => {
      if (!value || value <= start) {
        return 0;
      }

      return (value >= end ? 1 : (value - start) / (end - start)) * 100;
    },
    [value, options.start],
  );

  const caretPosition = useMemo(() => {
    if (value <= options.start) {
      return 0;
    }
    if (value >= options.end) {
      return 100;
    }
    return ((value - options.start) / (options.end - options.start)) * 100;
  }, [value, options.start, options.end]);

  return (
    <span className="block py-3">
      <span className="flex flex-row items-center gap-0.5 relative w-full">
        <span
          className={clsx(
            'rounded-sm h-1.5 relative bg-red-600/25 overflow-hidden',
          )}
          style={{
            flexBasis: `${(options.middleStart - options.start) * 100}%`,
          }}
        >
          {value !== undefined && (
            <span
              className="absolute left-0 h-1.5 bg-red-600"
              style={{
                width: `${getBlurWidth(options.start, options.middleStart)}%`,
              }}
            />
          )}
        </span>
        <span
          className={clsx(
            'rounded-sm h-1.5 relative bg-amber-600/25 overflow-hidden',
          )}
          style={{
            flexBasis: `${(options.middleEnd - options.middleStart) * 100}%`,
          }}
        >
          {value !== undefined && (
            <span
              className="absolute left-0 h-1.5 bg-amber-600"
              style={{
                width: `${getBlurWidth(options.middleStart, options.middleEnd)}%`,
              }}
            />
          )}
        </span>
        <span
          className={clsx(
            'rounded-sm h-1.5 relative bg-green-600/25 overflow-hidden',
          )}
          style={{
            flexBasis: `${(options.end - options.middleEnd) * 100}%`,
          }}
        >
          {value !== undefined && (
            <span
              className="absolute left-0 h-1.5 bg-green-600"
              style={{
                width: `${getBlurWidth(options.middleEnd, options.end)}%`,
              }}
            />
          )}
        </span>

        {value !== undefined && (
          <span
            className="absolute h-4 w-0.5 bg-white/90 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `calc(${caretPosition}% + 0.125rem)` }}
          />
        )}
      </span>
    </span>
  );
};
