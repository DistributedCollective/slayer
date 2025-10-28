import { BaseClient, type SdkRequestOptions } from './lib/context.js';

export interface ListTokensParams {
  chainId?: number;
  symbols?: string[];
  limit?: number;
  cursor?: string;
}

export interface Token {
  id: string;
}

export class TokensClient extends BaseClient {
  async get(id: string, options: SdkRequestOptions = {}): Promise<Token> {
    return this.ctx.http.request<Token>(
      `/tokens/${encodeURIComponent(id)}`,
      options,
    );
  }

  async list(
    params: ListTokensParams = {},
    options: SdkRequestOptions = {},
  ): Promise<{ items: Token[]; nextCursor?: string }> {
    const query = {
      chainId: params.chainId,
      limit: params.limit ?? 100,
      cursor: params.cursor,
      // allow repeated query via comma join (API-agnostic placeholder)
      symbols: params.symbols?.join(','),
    };
    return this.ctx.http.request<{ items: Token[]; nextCursor?: string }>(
      `/tokens`,
      { ...options, query },
    );
  }
}
