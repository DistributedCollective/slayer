import { Decimal, Decimalish } from '@sovryn/slayer-shared';
import { Account, encodeFunctionData, type Chain } from 'viem';
import { bobSepolia } from 'viem/chains';
import { BaseClient, type SdkRequestOptions } from '../lib/context.js';
import { buildQuery, toAddress } from '../lib/helpers.js';
import {
  makeTransactionRequest,
  SdkTransactionRequest,
} from '../lib/transaction.js';
import {
  BorrowRateMode,
  MoneyMarketPool,
  MoneyMarketPoolReserve,
  SdkPaginatedResponse,
  SdkResponse,
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

const addresses = {
  [bobSepolia.id]: {
    weth: '0x327E7E4A9e054ecC67dFa9E3Af158347116321Bf',
    wethGateway: '0x247074C89f5559c18ba34552D0C6C8995c763a0F',
    variableDebtEth: '0xd83f668055d983B2dD5B0338b713bc51dD4a55fF',
    pool: '0xd7308f0626a8e35b645Af0b7fA26Aba9CbD7e6A7',
  },
} as const;

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
    reserve: MoneyMarketPoolReserve,
    amount: Decimalish,
    rateMode: BorrowRateMode,
    opts: TransactionOpts<account>,
  ): Promise<SdkTransactionRequest<chain, account>[]> {
    if (this.ctx.chainId !== bobSepolia.id || !addresses[this.ctx.chainId]) {
      throw new Error(
        `Money Market addresses not configured for chain ${this.ctx.chainId}`,
      );
    }

    const asset = reserve.token;
    const pool = addresses[this.ctx.chainId];
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
              args: [pool.pool, value.toBigInt(), rateMode, 0],
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
          to: pool.pool,
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
