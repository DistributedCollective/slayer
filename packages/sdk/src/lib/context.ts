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

  constructor(cfg: SdkConfig) {
    if (!cfg.publicClient)
      throw new Error('publicClient is required in SdkConfig');
    if (!cfg.indexerBaseUrl)
      throw new Error('indexerBaseUrl is required in SdkConfig');
    this.config = cfg;
  }

  buildUrl(
    path: string,
    query?: SdkRequestOptions['query'],
    baseUrlOverride?: string,
  ) {
    const base = (baseUrlOverride ?? this.config.indexerBaseUrl).replace(
      /\/+$/,
      '',
    );
    const url = new URL(`${base}/${path.replace(/^\/+/, '')}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }

  async request<T>(path: string, opts: SdkRequestOptions = {}): Promise<T> {
    const f = this.config.fetch ?? globalThis.fetch;
    if (!f)
      throw new Error(
        'No fetch available. Provide SDKConfig.fetch in non-browser envs.',
      );

    const url = this.buildUrl(path, opts.query, opts.baseUrlOverride);
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(this.config.apiKey
        ? { authorization: `Bearer ${this.config.apiKey}` }
        : {}),
      ...(this.config.userAgent ? { 'user-agent': this.config.userAgent } : {}),
      ...(opts.headers ?? {}),
    };

    const controller =
      !opts.signal && this.config.timeoutMs ? new AbortController() : undefined;

    const timeout = controller
      ? setTimeout(() => controller.abort(), this.config.timeoutMs)
      : undefined;

    try {
      const res = await f(url, {
        method: opts.method ?? (opts.body ? 'POST' : 'GET'),
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        signal: controller?.signal ?? opts.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new HTTPError(res.status, res.statusText, text, url);
      }
      // Handle empty responses (204, etc.)
      if (res.status === 204) return undefined as unknown as T;
      return (await res.json()) as T;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

export class HTTPError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string,
    public url: string,
  ) {
    super(`HTTP ${status} ${statusText} for ${url}\n${body}`);
  }
}

export abstract class BaseClient {
  protected readonly ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }
}
