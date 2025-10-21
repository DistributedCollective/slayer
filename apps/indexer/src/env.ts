import 'dotenv/config';
import {
  bool,
  cleanEnv,
  makeValidator,
  port,
  str,
  testOnly,
  url,
} from 'envalid';

export const ENV = cleanEnv(process.env, {
  PORT: port({ default: 8000 }),
  HOST: str({ default: '0.0.0.0' }),
  NODE_ENV: str({ default: 'development' }),

  DATABASE_URL: str({
    default: testOnly('postgres://postgres:secret@localhost:5432/db'),
  }),
  REDIS_URL: str({ default: testOnly('redis://localhost:6379') }),

  CORS_ORIGINS: str({ default: '*' }),

  READ_ONLY_MODE: bool({ default: false }),

  DATA_BASE_URL: url({
    default:
      'https://raw.githubusercontent.com/DistributedCollective/slayer-data/main',
  }),

  FLAGS: makeValidator((x) => {
    try {
      if (x && x.length)
        return x.split(',').map((s: string) => s.trim().toLowerCase());
      return [];
    } catch {
      throw new Error('FLAGS must be a comma-separated list of strings');
    }
  })({ default: [] }),
});
