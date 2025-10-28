import { Chain } from 'viem';
import { Context, SdkConfig } from './lib/context.js';
import { MoneyMarketManager } from './managers/money-market.js';
import { TokensClient } from './managers/tokens.js';

export class SDK<chain extends Chain> {
  private readonly ctx: Context<chain>;

  constructor(config: SdkConfig<chain>) {
    this.ctx = new Context<chain>(config);
  }

  private _tokens?: TokensClient<chain>;
  get tokens(): TokensClient<chain> {
    if (!this._tokens) {
      this._tokens = new TokensClient<chain>(this.ctx);
    }
    return this._tokens;
  }

  private _moneyMarket?: MoneyMarketManager<chain>;
  get moneyMarket(): MoneyMarketManager<chain> {
    if (!this._moneyMarket) {
      this._moneyMarket = new MoneyMarketManager<chain>(this.ctx);
    }
    return this._moneyMarket;
  }
}
