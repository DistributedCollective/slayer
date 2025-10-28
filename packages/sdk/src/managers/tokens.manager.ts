import { Chain } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../lib/context.js';
import { buildQuery } from '../lib/helpers.js';
import { SdkPaginatedResponse, Token } from '../types.js';

export class TokensManager<chain extends Chain> extends BaseClient<chain> {
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
