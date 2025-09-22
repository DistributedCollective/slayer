import { eq, sql } from 'drizzle-orm';
import { client } from '../../database/client';
import {
  TIngestionSource,
  TIngestionSourceMode,
  tIngestionSources,
} from '../../database/schema';
import { logger } from '../../libs/logger';
import { HighWaterMark } from './types';

const log = logger.child({ service: 'ingest-checkpoints' });

const preparedInsert = client
  .insert(tIngestionSources)
  .values({
    key: sql.placeholder('key'),
    tags: sql.placeholder('tags'),
    mode: TIngestionSourceMode.backfill,
    highWaterMark: sql.placeholder('highWaterMark'),
  })
  .onConflictDoNothing()
  .returning()
  .prepare('insert_ingestion_source');

const preparedSelect = client.query.tIngestionSources
  .findFirst({
    where: eq(tIngestionSources.key, sql.placeholder('key')),
  })
  .prepare('select_ingestion_source');

const get = async (sourceKey: string) =>
  preparedSelect.execute({ key: sourceKey }) as Promise<TIngestionSource>;

const getOrCreate = async (
  sourceKey: string,
  tags: string[],
  highWaterMark: HighWaterMark = HighWaterMark.date,
) => {
  const insert = await preparedInsert.execute({
    key: sourceKey,
    tags: JSON.stringify(tags),
    highWaterMark,
  });
  if (insert.length) {
    return insert[0] as TIngestionSource;
  }

  return get(sourceKey);
};

const markBackfillProgress = async (
  cp: TIngestionSource,
  cursor?: string,
  highWater?: string,
) => {
  try {
    // If cursor is null OR we've reached near-now (live edge), flip to live mode.
    const now = new Date();

    const nearNow =
      cp.highWaterMark === HighWaterMark.date && highWater
        ? now.getTime() - new Date(Number(highWater)).getTime() <= 300_000
        : false;

    if (cursor === null || nearNow) {
      await client
        .update(tIngestionSources)
        .set({
          mode: TIngestionSourceMode.live,
          backfillCursor: null,
          liveWatermark: highWater,
          lastSyncedAt: now,
        })
        .where(eq(tIngestionSources.key, cp.key))
        .execute();
    } else {
      await client
        .update(tIngestionSources)
        .set({ backfillCursor: cursor, lastSyncedAt: now })
        .where(eq(tIngestionSources.key, cp.key))
        .execute();
    }
  } catch (e) {
    log.error(
      { err: e, key: cp.key, cursor, highWater },
      'error: markBackfillProgress',
    );
    throw e;
  }
};

const markIncrementalProgress = async (
  key: string,
  cursor?: string | null,
  highWater?: string,
) => {
  try {
    const now = new Date();
    if (highWater !== undefined && highWater !== null) {
      await client
        .update(tIngestionSources)
        .set({
          liveCursor: cursor ?? null,
          lastSyncedAt: now,
          liveWatermark: sql`GREATEST(${tIngestionSources.liveWatermark}, ${highWater})`,
        })
        .where(eq(tIngestionSources.key, key))
        .execute();
    } else {
      await client
        .update(tIngestionSources)
        .set({ liveCursor: cursor ?? null, lastSyncedAt: now })
        .where(eq(tIngestionSources.key, key))
        .execute();
    }
  } catch (err) {
    log.error({ err, key, cursor }, 'error: markIncrementalProgress');
  }
};

export const checkpoints = {
  getOrCreate,
  get,
  markBackfillProgress,
  markIncrementalProgress,
};
