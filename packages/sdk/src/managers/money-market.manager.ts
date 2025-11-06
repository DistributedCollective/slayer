import { Decimal } from '@sovryn/slayer-shared';
import { Account, zeroAddress, type Chain } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../lib/context.js';
import { buildQuery, toAddress } from '../lib/helpers.js';
import {
  makeMessageRequest,
  makeTransactionRequest,
  makeTypedDataRequest,
  SdkTransactionRequest,
} from '../lib/transaction.js';
import {
  BorrowRateMode,
  MoneyMarketPool,
  MoneyMarketPoolReserve,
  SdkPaginatedResponse,
  SdkResponse,
  Token,
  TransactionOpts,
} from '../types.js';

// const poolAbi = [
//   {
//     type: 'function',
//     name: 'borrow',
//     stateMutability: 'nonpayable',
//     inputs: [
//       { type: 'address', name: 'asset' },
//       { type: 'uint256', name: 'amount' },
//       { type: 'uint256', name: 'interestRateMode' },
//       { type: 'uint16', name: 'referralCode' },
//       { type: 'address', name: 'onBehalfOf' },
//     ],
//     outputs: [],
//   },
//   {
//     type: 'function',
//     name: 'swapBorrowRateMode',
//     stateMutability: 'nonpayable',
//     inputs: [
//       { type: 'address', name: 'asset' },
//       { type: 'uint256', name: 'rateMode' },
//     ],
//     outputs: [],
//   },
// ] as const;

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

  async borrow<account extends Account>(
    asset: Token,
    amount: Decimal,
    rateMode: BorrowRateMode,
    opts: TransactionOpts<account>,
  ): Promise<SdkTransactionRequest<chain, account>[]> {
    // const pool = await this.getPoolInfo();

    if (asset.isNative || asset.address.toLowerCase() === zeroAddress) {
      return [
        //
      ];
    }

    return [
      // testing purpose signatures
      {
        id: 'sign-message',
        title: 'Agree to Terms',
        description: `Agree to the money market borrowing terms and conditions`,
        request: makeMessageRequest({
          message: `I agree to borrow ${amount.toString()} ${asset.symbol} from the Money Market according to the terms and conditions.`,
          account: opts.account,
        }),
      },
      // testing purpose signatures
      {
        id: 'sign-typed-data',
        title: 'Accept Interest Rate',
        description: `Accept the current interest rate for borrowing ${asset.symbol}`,
        request: makeTypedDataRequest({
          domain: {
            name: 'Ether Mail',
            version: '1',
            chainId: this.ctx.publicClient.chain.id,
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          },
          types: {
            Person: [
              { name: 'name', type: 'string' },
              { name: 'wallet', type: 'address' },
            ],
            Mail: [
              { name: 'from', type: 'Person' },
              { name: 'to', type: 'Person' },
              { name: 'contents', type: 'string' },
            ],
          },
          primaryType: 'Mail',
          message: {
            from: {
              name: 'Cow',
              wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            },
            to: {
              name: 'Bob',
              wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            },
            contents: 'Hello, Bob!',
          },
          account: opts.account,
        }),
      },
      // todo: test tx
      {
        id: 'borrow-1',
        title: 'TEST: send 1 wei',
        description: `Sending 1 wei to self as a test transaction`,
        request: makeTransactionRequest({
          to: toAddress(opts.account),
          value: 1n,
          chain: this.ctx.publicClient.chain,
          account: opts.account,
        }),
      },
      // {
      //   id: 'borrow-2',
      //   title: 'Borrow Asset',
      //   description: `Borrowing ${amount.toString()} ${asset.symbol} from Money Market`,
      //   request: makeTransactionRequest({
      //     to: pool.data.pool,
      //     value: 0n,
      //     chain: this.ctx.publicClient.chain,
      //     account: opts.account,
      //     data: encodeFunctionData({
      //       abi: poolAbi,
      //       functionName: 'borrow',
      //       args: [
      //         asset.address,
      //         amount.toBigInt(),
      //         rateMode,
      //         0, // referralCode
      //         toAddress(opts.account),
      //       ],
      //     }),
      //   }),
      // },
    ];
  }
}
