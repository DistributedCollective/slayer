import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// used for development and CI only, in production we run migrations via main.ts
export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    prefix: 'timestamp',
  },
});
