import { char, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export enum TIngestionSourceMode {
  backfill = 'backfill',
  live = 'live',
}

export const tIngestionSources = pgTable('ingestion_sources', {
  id: serial('id'),
  key: char('key', { length: 64 }).notNull().primaryKey(),
  // workaround for drizzle prepared inserts not working with jsonb type
  // https://github.com/drizzle-team/drizzle-orm/issues/1117
  tags: varchar('tags', { length: 1024 }).default('[]'),
  mode: varchar('mode', { length: 32 })
    .$type<TIngestionSourceMode>()
    .notNull()
    .default(TIngestionSourceMode.backfill),

  highWaterMark: varchar('high_water_mark', { length: 32 })
    .notNull()
    .default('date'),

  backfillCursor: varchar('backfill_cursor', { length: 1024 }),

  liveCursor: varchar('live_cursor', { length: 1024 }),
  liveWatermark: varchar('live_watermark', { length: 256 }),

  lastSyncedAt: timestamp('last_synced_at'),
  ...timestamps,
});

export type TIngestionSource = typeof tIngestionSources.$inferSelect;
export type TNewIngestionSource = typeof tIngestionSources.$inferInsert;
