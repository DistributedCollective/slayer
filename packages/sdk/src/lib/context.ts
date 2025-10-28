import { HttpClient } from '@sovryn/slayer-shared';
import { PublicClient, WalletClient } from 'viem';

export type FetchLike = typeof fetch;

export interface SdkConfig {
  publicClient: PublicClient;
  walletClient?: WalletClient; // maybe not needed / write calls should return only tx data for signing?
  indexerBaseUrl: string;
  fetch?: FetchLike; // Optional custom fetch implementation
  apiKey?: string;
  userAgent?: string;
  timeoutMs?: number;
}

export interface SdkRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // per-call baseUrl override if needed:
  baseUrlOverride?: string;
}

export class Context {
  readonly config: Required<
    Pick<SdkConfig, 'indexerBaseUrl' | 'publicClient'>
  > &
    SdkConfig;

  readonly http: HttpClient;

  constructor(cfg: SdkConfig) {
    if (!cfg.publicClient)
      throw new Error('publicClient is required in SdkConfig');
    if (!cfg.indexerBaseUrl)
      throw new Error('indexerBaseUrl is required in SdkConfig');
    this.config = cfg;
    this.http = new HttpClient({
      baseUrl: this.config.indexerBaseUrl,
      fetch: this.config.fetch,
      apiKey: this.config.apiKey,
      userAgent: this.config.userAgent,
      timeoutMs: this.config.timeoutMs,
    });
  }
}

export abstract class BaseClient {
  protected readonly ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }
}
