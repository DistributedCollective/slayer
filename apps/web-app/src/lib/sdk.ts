import { ENV } from '@/env';
import { SDK } from '@sovryn/slayer-sdk';
import { createPublicClient, http } from 'viem';
import { bobSepolia } from 'viem/chains';

export const sdk = new SDK({
  indexerBaseUrl: ENV.VITE_API_BASE,
  publicClient: createPublicClient({
    chain: bobSepolia,
    transport: http(),
  }),
});
