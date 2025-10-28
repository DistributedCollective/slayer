import { Chain } from 'viem';
import { Context, SdkConfig } from './lib/context.js';
import { MoneyMarketManager } from './managers/money-market.manager.js';
import { TokensManager } from './managers/tokens.manager.js';

export * from './types.js';

export class SDK<chain extends Chain> {
  public readonly ctx: Context<chain>;

  constructor(config: SdkConfig<chain>) {
    this.ctx = new Context<chain>(config);
  }

  private _tokens?: TokensManager<chain>;
  get tokens(): TokensManager<chain> {
    if (!this._tokens) {
      this._tokens = new TokensManager<chain>(this.ctx);
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
