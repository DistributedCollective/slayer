import { Decimal } from '@sovryn/slayer-shared';
import { zeroAddress, type Chain, type WriteContractParameters } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../lib/context.js';
import { buildQuery } from '../lib/helpers.js';
import {
  BorrowRateMode,
  MoneyMarketPool,
  MoneyMarketPoolReserve,
  SdkPaginatedResponse,
  SdkResponse,
  Token,
  TransactionOpts,
} from '../types.js';

const poolAbi = [
  {
    type: 'function',
    name: 'borrow',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'asset' },
      { type: 'uint256', name: 'amount' },
      { type: 'uint256', name: 'interestRateMode' },
      { type: 'uint16', name: 'referralCode' },
      { type: 'address', name: 'onBehalfOf' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'swapBorrowRateMode',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'asset' },
      { type: 'uint256', name: 'rateMode' },
    ],
    outputs: [],
  },
] as const;

export class MoneyMarketManager<chain extends Chain> extends BaseClient<chain> {
  listReserves(opts: SdkRequestOptions = {}) {
    return this.ctx.http.request<SdkPaginatedResponse<MoneyMarketPoolReserve>>(
      `/${this.ctx.chainId}/money-market/reserves`,
      { ...opts, query: buildQuery(opts.query) },
    );
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

  async borrow(
    asset: Token,
    amount: Decimal,
    rateMode: BorrowRateMode,
    opts: TransactionOpts,
  ): Promise<WriteContractParameters[]> {
    const pool = await this.getPoolInfo();

    console.log('Borrowing from pool:', pool);

    if (asset.isNative || asset.address.toLowerCase() === zeroAddress) {
      return [
        //
      ];
    }

    return [
      {
        account: opts.account,
        abi: poolAbi,
        address: pool.data.pool,
        functionName: 'borrow',
        value: 0n,
        chain: this.ctx.publicClient.chain,
        args: [
          asset.address,
          amount.toBigInt(),
          rateMode,
          0, // referralCode
          String(opts.account).toLowerCase(),
        ],
      },
    ];
  }
}
