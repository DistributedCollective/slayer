import type { WalletClient } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../lib/context.js';

export class LendingManager extends BaseClient {
  listPools(opts?: SdkRequestOptions) {
    return this.ctx.http.request<{ data: Array<{ id: string }> }>(
      '/money-market',
      opts,
    );
  }

  borrow(pool: string, wallet: WalletClient) {
    //
  }

  lend(pool: string, wallet: WalletClient) {
    //
  }
}
