import { Context, SdkConfig } from './lib/context.js';
import { TokensClient } from './tokens.js';

export class SDK {
  private readonly ctx: Context;

  constructor(config: SdkConfig) {
    this.ctx = new Context(config);
  }

  private _tokens?: TokensClient;
  get tokens(): TokensClient {
    if (!this._tokens) {
      this._tokens = new TokensClient(this.ctx);
    }
    return this._tokens;
  }
}
