import { HttpClient } from '@sovryn/slayer-shared';
import debug from 'debug';
import { Chain, PublicClient, Transport, WalletClient } from 'viem';
import { INDEXER_URL, Mode, modes } from '../constants.js';
import { SdkPaginatedQuery } from '../types.js';

const logger = debug('slayer-sdk:context');

export type FetchLike = typeof fetch;

export interface SdkConfig<chain extends Chain> {
  publicClient: PublicClient<Transport, chain>;
  walletClient?: WalletClient<Transport, chain>; // maybe not needed / write calls should return only tx data for signing?
  mode?: Mode;
  /**
   * Override the base URL for the indexer API
   */
  indexerBaseUrl?: string;
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
  readonly config: Required<Pick<SdkConfig<chain>, 'publicClient'>> &
    SdkConfig<chain>;

  readonly http: HttpClient;
  readonly publicClient: PublicClient<Transport, chain>;
  readonly chainId: number;

  constructor(cfg: SdkConfig<chain>) {
    if (!cfg.publicClient)
      throw new Error('publicClient is required in SdkConfig');
    if (cfg.indexerBaseUrl) {
      cfg.mode = modes.custom;
      logger.log('Using custom indexer base URL:', cfg.indexerBaseUrl);
    }
    if (!cfg.mode) cfg.mode = modes.production;
    this.config = cfg;
    this.publicClient = cfg.publicClient;
    this.chainId = this.publicClient.chain?.id ?? 0;
    this.http = new HttpClient({
      baseUrl:
        this.config.mode === modes.custom && this.config.indexerBaseUrl
          ? this.config.indexerBaseUrl
          : INDEXER_URL[this.config.mode as Exclude<Mode, 'custom'>],
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
