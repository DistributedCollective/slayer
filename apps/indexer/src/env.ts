import 'dotenv/config';
import { cleanEnv, port, str } from 'envalid';

export const ENV = cleanEnv(process.env, {
  PORT: port({ default: 4000 }),
  HOST: str({ default: 'localhost' }),
  NODE_ENV: str({ default: 'development' }),
  DATABASE_URL: str(),

  CORS_ORIGINS: str({ default: '*' }),
});
