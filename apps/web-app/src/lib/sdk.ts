import { ENV } from '@/env';
import { SDK, type Mode } from '@sovryn/slayer-sdk';
import {
  createPublicClient,
  http,
  type Chain,
  type PublicClient,
  type Transport,
} from 'viem';
import { bobSepolia } from 'viem/chains';

const sdks = new Map<Chain['id'], SDK<Chain>>();

export function makeSdkClient<chain extends Chain>(
  client: PublicClient<Transport, chain>,
): SDK<chain> {
  let sdk = sdks.get(client.chain.id) as unknown as SDK<chain>;
  if (sdk) {
    return sdk as SDK<chain>;
  }
  sdk = new SDK({
    mode: ENV.VITE_MODE as Mode,
    indexerBaseUrl:
      ENV.VITE_MODE === 'custom' ? ENV.VITE_INDEXER_BASE_URL : undefined,
    publicClient: client,
  });
  sdks.set(client.chain.id, sdk as unknown as SDK<Chain>);
  return sdk as SDK<chain>;
}

// Default SDK client
// todo: refactor to use current selected chain?
export const sdk = makeSdkClient(
  createPublicClient({
    chain: bobSepolia,
    transport: http(),
  }),
);
