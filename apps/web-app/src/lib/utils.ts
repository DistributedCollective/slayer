import { Decimal, type Decimalish } from '@sovryn/slayer-shared';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

// if value is within percentageThreshold of total, return true
// e.g. value=99, total=100, percentageThreshold=1 => true
// it helps to decide whether to use full amount in cases like withdrawing nearly all supplied assets
export function shouldUseFullAmount<T extends Decimalish = Decimalish>(
  value: T,
  total: T,
  // default to 0.5% (half percent) threshold
  percentageThreshold = 0.5,
): boolean {
  const decimalValue = Decimal.from(value);
  const decimalTotal = Decimal.from(total);
  const threshold = decimalTotal.mul(
    Decimal.from(percentageThreshold).div(100),
  );
  return decimalValue.gte(decimalTotal.sub(threshold));
}
