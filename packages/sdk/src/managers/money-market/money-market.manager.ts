import { Decimal, Decimalish } from '@sovryn/slayer-shared';
import { Account, encodeFunctionData, type Chain } from 'viem';
import { BaseClient, type SdkRequestOptions } from '../../lib/context.js';
import { buildQuery, toAddress } from '../../lib/helpers.js';
import { makeTransactionRequest } from '../../lib/transaction.js';
import {
  BorrowRateMode,
  MoneyMarketPool,
  MoneyMarketPoolReserve,
  SdkPaginatedResponse,
  TransactionOpts,
} from '../../types.js';

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

const debtWethApi = [
  {
    type: 'function',
    name: 'approveDelegation',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'delegatee' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [],
  },
] as const;

const wethGatewayAbi = [
  {
    type: 'function',
    name: 'borrowETH',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'pool' },
      { type: 'uint256', name: 'amount' },
      { type: 'uint256', name: 'interestRateMode' },
      { type: 'uint16', name: 'referralCode' },
    ],
    outputs: [],
  },
] as const;

export class MoneyMarketManager<chain extends Chain> extends BaseClient<chain> {
  async listPools(opts: SdkRequestOptions = {}) {
    return this.ctx.http.request<SdkPaginatedResponse<MoneyMarketPool>>(
      `/${this.ctx.chainId}/money-market`,
      { ...opts, query: buildQuery(opts.query) },
    );
  }

  async listReserves(
    pool: MoneyMarketPool['id'],
    opts: SdkRequestOptions = {},
  ) {
    const response = await this.ctx.http.request<{
      data: { reservesData: MoneyMarketPoolReserve[] };
    }>(`/${this.ctx.chainId}/money-market/${pool}/reserves`, {
      ...opts,
      query: buildQuery(opts.query),
    });
    return {
      ...response,
      data: response.data.reservesData,
    };
  }

  async borrow<account extends Account>(
    reserve: MoneyMarketPoolReserve,
    amount: Decimalish,
    rateMode: BorrowRateMode,
    opts: TransactionOpts<account>,
  ) {
    const asset = reserve.token;
    const pool = reserve.pool;
    const value = Decimal.from(amount);

    if (
      asset.isNative ||
      asset.address.toLowerCase() === pool.weth.toLowerCase()
    ) {
      return [
        {
          id: 'approve_borrow_native_delegation',
          title: `Approve ${asset.symbol}`,
          description: `Approve borrow delegation for ${value.toString()} ${asset.symbol}`,
          request: makeTransactionRequest({
            to: pool.variableDebtEth,
            value: 0n,
            chain: this.ctx.publicClient.chain,
            account: opts.account,
            data: encodeFunctionData({
              abi: debtWethApi,
              functionName: 'approveDelegation',
              args: [pool.wethGateway, value.toBigInt()],
            }),
          }),
        },
        {
          id: 'borrow_native',
          title: `Borrow ${asset.symbol}`,
          description: `Borrow ${value.toString()} ${asset.symbol}`,
          request: makeTransactionRequest({
            to: pool.wethGateway,
            value: 0n,
            chain: this.ctx.publicClient.chain,
            account: opts.account,
            data: encodeFunctionData({
              abi: wethGatewayAbi,
              functionName: 'borrowETH',
              args: [pool.address, value.toBigInt(), rateMode, 0],
            }),
          }),
        },
      ];
    }

    return [
      {
        id: 'borrow_asset',
        title: `Borrow ${asset.symbol}`,
        description: `Borrow ${value.toString()} ${asset.symbol}`,
        request: makeTransactionRequest({
          to: pool.address,
          value: 0n,
          chain: this.ctx.publicClient.chain,
          account: opts.account,
          data: encodeFunctionData({
            abi: poolAbi,
            functionName: 'borrow',
            args: [
              toAddress(asset.address),
              value.toBigInt(),
              rateMode,
              0,
              toAddress(opts.account),
            ],
          }),
        }),
      },
    ];
  }
}
