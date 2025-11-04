import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { SDK } from './sdk.js';

describe('SDK', () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  describe('initialization', () => {
    it('creates an SDK instance with default parameters', () => {
      const sdk = new SDK({
        publicClient: client,
        mode: 'production',
      });
      expect(sdk).toBeDefined();
      expect(sdk.ctx.chainId).toBe(sepolia.id);
    });
  });
});
