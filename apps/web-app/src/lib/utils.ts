import { Decimal, type Decimalish } from '@sovryn/slayer-shared';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function isFullAmount<T extends Decimalish = Decimalish>(
  value: T,
  total: T,
  // default to 0.1% threshold
  percentageThreshold = 0.1,
): boolean {
  const decimalValue = Decimal.from(value);
  const decimalTotal = Decimal.from(total);
  const threshold = decimalTotal.mul(
    Decimal.from(percentageThreshold).div(100),
  );
  return decimalValue.gte(decimalTotal.sub(threshold));
}
