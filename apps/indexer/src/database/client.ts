import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ENV } from '../env';
import * as schema from './schema';

const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
});

export const client = drizzle({ client: pool, schema, logger: false });

export type Tx = Parameters<Parameters<typeof client.transaction>[0]>[0];
