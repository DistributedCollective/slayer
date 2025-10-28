export type FetchLike = typeof fetch;

export interface HttpClientOptions {
  baseUrl: string;
  fetch?: FetchLike;
  apiKey?: string;
  userAgent?: string;
  timeoutMs?: number;
}

export interface HttpRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // per-call baseUrl override if needed:
  baseUrlOverride?: string;
}

export class HttpClient {
  readonly config: Required<Pick<HttpClientOptions, 'baseUrl'>> &
    HttpClientOptions;

  constructor(cfg: HttpClientOptions) {
    if (!cfg.baseUrl)
      throw new Error('baseUrl is required in HttpClientOptions');
    this.config = cfg;
  }

  buildUrl(
    path: string,
    query?: HttpRequestOptions['query'],
    baseUrlOverride?: string,
  ) {
    const base = (baseUrlOverride ?? this.config.baseUrl).replace(/\/+$/, '');
    const url = new URL(
      `${base}${path.replace(/^\/+/, '')}`.replace(/([^:]\/)\/+/g, '$1'),
    );
    console.log('Built URL:', url.toString());

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }

  async request<T>(path: string, opts: HttpRequestOptions = {}): Promise<T> {
    console.log('fetching', path, opts);
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
      ? setTimeout(() => controller.abort('timeout'), this.config.timeoutMs)
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
        throw new HTTPClientError(res.status, res.statusText, text, url);
      }
      // Handle empty responses (204, etc.)
      if (res.status === 204) return undefined as unknown as T;
      return (await res.json()) as T;
    } catch (error) {
      console.log('HTTP request error:', error);
      if (isAbortError(error)) {
        const reason = controller?.signal.reason ?? error.reason;
        const isTimeout =
          (reason instanceof DOMException && reason.name === 'TimeoutError') ||
          (error instanceof DOMException && error.name === 'TimeoutError') ||
          reason === 'timeout';
        if (isTimeout) throw new HTTPTimeoutError(url, reason);
        throw new HTTPAbortError(url, reason);
      }
      throw new HTTPClientError(500, 'Internal Server Error', '', url);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

export function isAbortError(e: unknown): e is HTTPAbortError {
  // Native fetch aborts: DOMException name === 'AbortError'
  return (
    (e instanceof DOMException && e.name === 'AbortError') ||
    e instanceof HTTPAbortError
  );
}

export class HTTPClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
    public readonly url: string,
  ) {
    super(`HTTP ${status} ${statusText} for ${url}\n${body}`);
  }
}

export class HTTPAbortError extends Error {
  constructor(
    public readonly url: string,
    public readonly reason?: unknown, // e.g., 'timeout' or a custom object
  ) {
    super(`Request aborted for ${url}${reason ? `: ${String(reason)}` : ''}`);
    this.name = 'HTTPAbortError';
  }
}

export class HTTPTimeoutError extends HTTPAbortError {
  constructor(url: string, reason?: unknown) {
    super(url, reason ?? 'timeout');
    this.name = 'HTTPTimeoutError';
  }
}
