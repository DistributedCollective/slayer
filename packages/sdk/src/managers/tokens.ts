import { Chain } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../lib/context.js';
import { buildQuery } from '../lib/helpers.js';
import { SdkPaginatedResponse } from '../types.js';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
}

export class TokensClient<chain extends Chain> extends BaseClient<chain> {
  async get(id: string, options: SdkRequestOptions = {}): Promise<Token> {
    return this.ctx.http.request<Token>(
      `/${this.ctx.chainId}/tokens/${encodeURIComponent(id)}`,
      options,
    );
  }

  async list(options: SdkRequestOptions = {}) {
    return this.ctx.http.request<SdkPaginatedResponse<Token>>(
      `/${this.ctx.chainId}/tokens`,
      { ...options, query: buildQuery(options.query) },
    );
  }
}
