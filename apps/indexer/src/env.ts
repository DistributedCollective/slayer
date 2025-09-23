import 'dotenv/config';
import { bool, cleanEnv, port, str, testOnly } from 'envalid';

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
});
