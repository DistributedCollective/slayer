import {
  boolean,
  char,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const tTokens = pgTable(
  'tokens',
  {
    id: serial('id'),
    // sha256(chainId + address)
    identifier: char('identifier', { length: 64 }).primaryKey(),
    chainId: integer('chain_id').notNull(),
    address: char('address', { length: 42 }).notNull(),
    symbol: varchar('symbol', { length: 24 }),
    name: varchar('name', { length: 256 }),
    logoUrl: text('logo_url'),
    decimals: integer('decimals').default(18),
    ignored: boolean('ignored').default(false),
    processed: boolean('processed').default(false),
    ...timestamps,
  },
  (t) => [unique('chain_address_pkey').on(t.chainId, t.address)],
);

export type TToken = typeof tTokens.$inferSelect;
export type TNewToken = typeof tTokens.$inferInsert;

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
