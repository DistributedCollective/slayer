import { Decimal, type Decimalish } from '@sovryn/slayer-shared';
import { z } from 'zod';

export const validateDecimal = ({
  min,
  max,
}: {
  min?: Decimalish;
  max?: Decimalish;
} = {}) =>
  z.string().refine(
    (value) => {
      try {
        const decimalValue = Decimal.from(value);
        if (min !== undefined && decimalValue.lt(Decimal.from(min))) {
          return false;
        }
        if (max !== undefined && decimalValue.gt(Decimal.from(max))) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    {
      error: `Value must be a valid decimal${min !== undefined ? ` >= ${min}` : ''}${
        max !== undefined ? ` <= ${max}` : ''
      }.`,
    },
  );
