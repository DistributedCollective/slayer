import { cleanEnv, str, url } from 'envalid';

export const ENV = cleanEnv(
  { ...process.env, ...import.meta.env },
  {
    NODE_ENV: str(),

    VITE_APP_NAME: str({ default: 'Sovryn Layer' }),

    VITE_MODE: str({
      default: 'production',
      choices: ['production', 'staging', 'development', 'custom'],
    }),

    VITE_INDEXER_BASE_URL: url({
      default: undefined,
      requiredWhen: (env) => env.VITE_MODE === 'custom',
    }),

    // Privy
    VITE_PRIVY_APP_ID: str(),
    VITE_PRIVY_APP_CLIENT_ID: str(),
  },
);
