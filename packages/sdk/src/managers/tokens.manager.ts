import { Chain } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../lib/context.js';
import { buildQuery } from '../lib/helpers.js';
import { SdkPaginatedResponse, SdkToken } from '../types.js';

export class TokensManager<chain extends Chain> extends BaseClient<chain> {
  async get(id: string, options: SdkRequestOptions = {}): Promise<SdkToken> {
    return this.ctx.http.request<SdkToken>(
      `/${this.ctx.chainId}/tokens/${encodeURIComponent(id)}`,
      options,
    );
  }

  async list(options: SdkRequestOptions = {}) {
    return this.ctx.http.request<SdkPaginatedResponse<SdkToken>>(
      `/${this.ctx.chainId}/tokens`,
      { ...options, query: buildQuery(options.query) },
    );
  }
}
