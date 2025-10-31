import z from 'zod';

export const DEFAULT_LIMIT = 250;

export const atob = (str: string) =>
  Buffer.from(str, 'base64').toString('binary');
export const btoa = (str: string) =>
  Buffer.from(str, 'binary').toString('base64');

export const paginationSchema = z.object({
  cursor: z
    .string()
    .optional()
    .transform((val) => (val ? atob(val) : undefined)),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be at least 1')
    .max(1000, 'Limit cannot exceed 1000')
    .optional()
    .default(DEFAULT_LIMIT)
    .transform((val) => (val < 1 ? 0 : val + 1)),
  search: z.coerce.string().optional(),
});

export const paginationResponse = <T>(
  data: T[],
  limit: number,
  key: keyof T | ((v: T) => string),
) => {
  const items = data.length ? data.slice(0, limit - 1) : [];
  const cursorKey =
    typeof key === 'function'
      ? key(data[data.length - 1])
      : data[data.length - 1]?.[key]?.toString() || '';

  return {
    data: items,
    nextCursor: limit > 0 && data.length >= limit ? btoa(cursorKey) : null,
    count: items.length,
  };
};
