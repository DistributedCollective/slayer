import { isAddress, type Address } from 'viem';
import z from 'zod';

export const ze = {
  address: z
    .custom<Address>(
      (v) => isAddress(v as string, { strict: false }),
      'invalid address',
    )
    .transform((v) => v.toLowerCase() as Address),
} as const;
