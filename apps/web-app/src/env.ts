import { cleanEnv, str, url } from 'envalid';

export const ENV = cleanEnv(
  { ...process.env, ...import.meta.env },
  {
    NODE_ENV: str(),

    VITE_APP_NAME: str({ default: 'Sovryn Layer' }),
    VITE_API_BASE: url({
      default: 'https://indexer.sovryn.app',
      devDefault: 'http://localhost:3000',
    }),

    // Privy
    VITE_PRIVY_APP_ID: str(),
    VITE_PRIVY_APP_CLIENT_ID: str(),
  },
);
