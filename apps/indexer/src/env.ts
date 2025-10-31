import 'dotenv/config';
import { bool, cleanEnv, makeValidator, port, str, testOnly } from 'envalid';

export const ENV = cleanEnv(process.env, {
  PORT: port({ default: 8000 }),
  HOST: str({ default: '0.0.0.0' }),
  NODE_ENV: str({ default: 'development' }),

  DATABASE_URL: str({
    default: testOnly('postgres://postgres:secret@localhost:5432/db'),
  }),
  REDIS_URL: str({ default: testOnly('redis://localhost:6379/0') }),
  REDIS_CLUSTER_MODE: bool({ default: true, devDefault: false }),

  CORS_ORIGINS: str({ default: '*' }),

  READ_ONLY_MODE: bool({ default: false }),

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
