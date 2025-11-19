import { type Chain } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../../lib/context.js';
import { buildQuery } from '../../lib/helpers.js';
import {
  MoneyMarketPool,
  MoneyMarketPoolReserve,
  SdkPaginatedResponse,
  SdkResponse,
} from '../../types.js';
import { Reserve } from './reserve.js';

export class MoneyMarketManager<chain extends Chain> extends BaseClient<chain> {
  listReserves(opts: SdkRequestOptions = {}) {
    return this.ctx.http
      .request<
        SdkPaginatedResponse<MoneyMarketPoolReserve>
      >(`/${this.ctx.chainId}/money-market/reserves`, { ...opts, query: buildQuery(opts.query) })
      .then((response) => ({
        ...response,
        data: response.data.map((r) => new Reserve<chain>(r, this.ctx)),
      }));
  }

  #poolInfo: Promise<SdkResponse<MoneyMarketPool>> | null = null;
  getPoolInfo(opts: SdkRequestOptions = {}) {
    if (!this.#poolInfo) {
      this.#poolInfo = this.ctx.http.request<SdkResponse<MoneyMarketPool>>(
        `/${this.ctx.chainId}/money-market`,
        { ...opts, query: buildQuery(opts.query) },
      );
    }
    return this.#poolInfo;
  }

  useReserve(reserve: MoneyMarketPoolReserve) {
    return new Reserve<chain>(reserve, this.ctx);
  }
}
