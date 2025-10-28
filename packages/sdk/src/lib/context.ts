import { HttpClient } from '@sovryn/slayer-shared';
import { SdkPaginatedQuery } from 'src/types.js';
import { Chain, PublicClient, Transport, WalletClient } from 'viem';

export type FetchLike = typeof fetch;

export interface SdkConfig<chain extends Chain> {
  publicClient: PublicClient<Transport, chain>;
  walletClient?: WalletClient<Transport, chain>; // maybe not needed / write calls should return only tx data for signing?
  indexerBaseUrl: string;
  fetch?: FetchLike; // Optional custom fetch implementation
  apiKey?: string;
  userAgent?: string;
  timeoutMs?: number;
}

export interface Query extends SdkPaginatedQuery {
  [key: string]: string | number | boolean | undefined;
}

export interface SdkRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  query?: Query;
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // per-call baseUrl override if needed:
  baseUrlOverride?: string;
}

export class Context<chain extends Chain> {
  readonly config: Required<
    Pick<SdkConfig<chain>, 'indexerBaseUrl' | 'publicClient'>
  > &
    SdkConfig<chain>;

  readonly http: HttpClient;
  readonly publicClient: PublicClient<Transport, chain>;
  readonly chainId: number;

  constructor(cfg: SdkConfig<chain>) {
    if (!cfg.publicClient)
      throw new Error('publicClient is required in SdkConfig');
    if (!cfg.indexerBaseUrl)
      throw new Error('indexerBaseUrl is required in SdkConfig');
    this.config = cfg;
    this.publicClient = cfg.publicClient;
    this.chainId = this.publicClient.chain?.id ?? 0;
    this.http = new HttpClient({
      baseUrl: this.config.indexerBaseUrl,
      fetch: this.config.fetch,
      apiKey: this.config.apiKey,
      userAgent: this.config.userAgent,
      timeoutMs: this.config.timeoutMs,
    });
  }
}

export abstract class BaseClient<chain extends Chain> {
  protected readonly ctx: Context<chain>;
  constructor(ctx: Context<chain>) {
    this.ctx = ctx;
  }
}
