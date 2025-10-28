import type { Chain, Transport, WalletClient } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../lib/context.js';
import { buildQuery } from '../lib/helpers.js';
import { SdkPaginatedResponse } from '../types.js';
import { Token } from './tokens.js';

export interface MoneyMarketPoolReserve {
  id: string;
  totalLiquidity: string;
  underlyingAsset: string;
  token: Token;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
}

export class MoneyMarketManager<chain extends Chain> extends BaseClient<chain> {
  listReserves(opts: SdkRequestOptions = {}) {
    return this.ctx.http.request<SdkPaginatedResponse<MoneyMarketPoolReserve>>(
      `/${this.ctx.chainId}/money-market`,
      { ...opts, query: buildQuery(opts.query) },
    );
  }

  borrow(pool: string, wallet: WalletClient<Transport, chain>) {
    //
  }
}
