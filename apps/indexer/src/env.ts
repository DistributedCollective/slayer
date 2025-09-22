import 'dotenv/config';
import { bool, cleanEnv, port, str } from 'envalid';

export const ENV = cleanEnv(process.env, {
  PORT: port({ default: 8000 }),
  HOST: str({ default: '0.0.0.0' }),
  NODE_ENV: str({ default: 'development' }),

  DATABASE_URL: str(),
  REDIS_URL: str(),

  CORS_ORIGINS: str({ default: '*' }),

  READ_ONLY_MODE: bool({ default: false }),
});
