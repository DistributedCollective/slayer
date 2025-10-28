import z from 'zod';

export const searchDefaults = {
  limit: 100,
  cursor: '',
  search: '',
} as const;

export const defaultSearchSchema = z.object({
  limit: z.number().min(1).max(1000).catch(searchDefaults.limit),
  cursor: z.string().optional().catch(searchDefaults.cursor),
  search: z.string().optional().catch(searchDefaults.search),
});

// 3) Compose parsing + stripping for TanStack Router validateSearch
export function makeSearchValidator<
  S extends z.ZodTypeAny,
  D extends Partial<z.infer<S>>,
>(schema: S, defaults: D) {
  type Search = z.infer<S>;
  return (raw: Record<string, unknown>): Partial<Search> => {
    // Use .catch() (or .default()) inside the schema to produce app-facing defaults
    const parsed = schema.parse(raw) as Search;
    console.log('Raw search params:', { raw, parsed });
    // if parsed value equals schema-level default, remove it from the final result
    (Object.keys(defaults) as (keyof D)[]).forEach((key) => {
      // @ts-expect-error -- TS can't figure out that parsed[key] exists
      if (parsed[key] === defaults[key]) {
        // @ts-expect-error -- TS can't figure out that parsed[key] exists
        delete parsed[key];
      }
    });
    console.log('Validated search params:', parsed);
    return parsed;
  };
}
