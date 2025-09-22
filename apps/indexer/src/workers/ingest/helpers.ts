import { ingestSources } from './sources';
import { SourceAdapter } from './types';

export const getAdapter = (key: string): SourceAdapter<unknown, unknown> => {
  const a = ingestSources.find((s) => s.name === key);
  if (!a) throw new Error(`Unknown source ${key}`);
  return a as SourceAdapter<unknown, unknown>;
};
