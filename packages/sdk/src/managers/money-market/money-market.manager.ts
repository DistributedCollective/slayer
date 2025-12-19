import { areAddressesEqual, Decimal, Decimalish } from '@sovryn/slayer-shared';
import debug from 'debug';
import { Account, Address, encodeFunctionData, type Chain } from 'viem';
import { bobSepolia } from 'viem/chains';
import { BaseClient, type SdkRequestOptions } from '../../lib/context.js';
import { buildQuery, toAddress } from '../../lib/helpers.js';
import {
  makeApprovalTransaction,
  makeTransactionRequest,
} from '../../lib/transaction.js';
import {
  BORROW_RATE_MODES,
  BorrowRateMode,
  MoneyMarketBaseCurrencyData,
  MoneyMarketPool,
  MoneyMarketPoolEmodeCategory,
  MoneyMarketPoolPosition,
  MoneyMarketPoolReserve,
  MoneyMarketUserSummary,
  SdkPaginatedResponse,
  TransactionOpts,
} from '../../types.js';

const log = debug('slayer-sdk:managers:money-market');

const aWETH = {
  [bobSepolia.id]: '0x63719589aC40057556a791FAa701264567b5b627',
} as const;

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
  {
    type: 'function',
    name: 'supply',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'asset' },
      { type: 'uint256', name: 'amount' },
      { type: 'address', name: 'onBehalfOf' },
      { type: 'uint16', name: 'referralCode' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'asset' },
      { type: 'uint256', name: 'amount' },
      { type: 'address', name: 'to' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setUserUseReserveAsCollateral',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'asset' },
      { type: 'bool', name: 'useAsCollateral' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'repay',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'asset' },
      { type: 'uint256', name: 'amount' },
      { type: 'uint256', name: 'rateMode' },
      { type: 'address', name: 'onBehalfOf' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setUserEMode',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'uint8', name: 'categoryId' }],
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
  {
    type: 'function',
    name: 'depositETH',
    stateMutability: 'payable',
    inputs: [
      { type: 'address', name: 'pool' },
      { type: 'address', name: 'onBehalfOf' },
      { type: 'uint16', name: 'referralCode' },
    ],
    outputs: [],
  },

  {
    type: 'function',
    name: 'withdrawETH',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'pool' },
      { type: 'uint256', name: 'amount' },
      { type: 'address', name: 'to' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'repayETH',
    stateMutability: 'payable',
    inputs: [
      { type: 'address', name: 'pool' },
      { type: 'uint256', name: 'amount' },
      { type: 'uint256', name: 'rateMode' },
      { type: 'address', name: 'onBehalfOf' },
    ],
    outputs: [],
  },
] as const;

const REPAY_ALL_ETH_SURPLUS = Decimal.from('0.01');

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
      data: {
        reservesData: MoneyMarketPoolReserve[];
        baseCurrencyData: MoneyMarketBaseCurrencyData;
        eModes: MoneyMarketPoolEmodeCategory[];
      };
    }>(`/${this.ctx.chainId}/money-market/${pool}/reserves`, {
      ...opts,
      query: buildQuery(opts.query),
    });
    return response;
  }

  async listUserPositions(
    pool: MoneyMarketPool['id'],
    user: Address,
    opts: SdkRequestOptions = {},
  ) {
    const response = await this.ctx.http.request<{
      data: {
        positions: MoneyMarketPoolPosition[];
        summary: MoneyMarketUserSummary;
      };
    }>(`/${this.ctx.chainId}/money-market/${pool}/user/${user}/positions`, {
      ...opts,
      query: buildQuery(opts.query),
    });

    return response;
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

    if (asset.isNative || areAddressesEqual(asset.address, pool.weth)) {
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

  async swapBorrowRateMode(
    reserve: MoneyMarketPoolReserve,
    currentRateMode: BorrowRateMode,
    opts: TransactionOpts<Account>,
  ) {
    const asset = reserve.token;
    const pool = reserve.pool;
    log(
      `Swapping borrow rate mode for ${asset.symbol} in pool ${pool.id} from ${currentRateMode}`,
      { reserve, currentRateMode, opts },
    );

    const newRateMode =
      currentRateMode === BORROW_RATE_MODES.stable ? 'Variable' : 'Stable';

    return [
      {
        id: 'swap_borrow_rate_mode',
        title: `Swap borrow rate mode for ${asset.symbol}`,
        description: `Swap borrow rate mode for ${asset.symbol} to ${newRateMode}`,
        request: makeTransactionRequest({
          to: pool.address,
          value: 0n,
          chain: this.ctx.publicClient.chain,
          account: opts.account,
          data: encodeFunctionData({
            abi: poolAbi,
            functionName: 'swapBorrowRateMode',
            args: [toAddress(asset.address), currentRateMode],
          }),
        }),
      },
    ];
  }

  async supply<account extends Account>(
    reserve: MoneyMarketPoolReserve,
    amount: Decimalish,
    opts: TransactionOpts<account>,
  ) {
    const asset = reserve.token;
    const pool = reserve.pool;
    const value = Decimal.from(amount);

    if (asset.isNative || areAddressesEqual(asset.address, pool.weth)) {
      return [
        {
          id: 'supply_native',
          title: `Supply ${asset.symbol}`,
          description: `Supply ${value.toString()} ${asset.symbol}`,
          request: makeTransactionRequest({
            to: pool.wethGateway,
            value: value.toBigInt(),
            chain: this.ctx.publicClient.chain,
            account: opts.account,
            data: encodeFunctionData({
              abi: wethGatewayAbi,
              functionName: 'depositETH',
              args: [pool.address, toAddress(opts.account), 0],
            }),
          }),
        },
      ];
    }

    const approval = await makeApprovalTransaction({
      token: asset.address,
      spender: pool.address,
      amount: value.toBigInt(),
      account: toAddress(opts.account),
      client: this.ctx.publicClient,
    });

    return [
      ...(approval
        ? [
            {
              id: 'approve_supply_asset',
              title: `Approve ${asset.symbol}`,
              description: `Approve ${value.toString()} ${asset.symbol} for supply`,
              request: approval,
            },
          ]
        : []),
      {
        id: 'supply_asset',
        title: `Supply ${asset.symbol}`,
        description: `Supply ${value.toString()} ${asset.symbol}`,
        request: makeTransactionRequest({
          to: pool.address,
          value: 0n,
          chain: this.ctx.publicClient.chain,
          account: opts.account,
          data: encodeFunctionData({
            abi: poolAbi,
            functionName: 'supply',
            args: [
              toAddress(asset.address),
              value.toBigInt(),
              toAddress(opts.account),
              0,
            ],
          }),
        }),
      },
    ];
  }

  async changeCollateralMode<account extends Account>(
    reserve: MoneyMarketPoolReserve,
    useAsCollateral: boolean,
    opts: TransactionOpts<account>,
  ) {
    const asset = reserve.token;
    const pool = reserve.pool;

    log(
      `Switching collateral for ${asset.symbol} in pool ${pool.id} to ${useAsCollateral}`,
      { reserve, useAsCollateral, opts },
    );

    const tokenAddress = toAddress(
      asset.isNative || areAddressesEqual(asset.address, pool.weth)
        ? pool.weth
        : asset.address,
    );

    return [
      {
        id: 'switch_collateral',
        title: `${useAsCollateral ? 'Enable' : 'Disable'} ${asset.symbol} as collateral`,
        description: `${useAsCollateral ? 'Enable' : 'Disable'} ${asset.symbol} as collateral in pool ${pool.id}`,
        request: makeTransactionRequest({
          to: pool.address,
          value: 0n,
          chain: this.ctx.publicClient.chain,
          account: opts.account,
          data: encodeFunctionData({
            abi: poolAbi,
            functionName: 'setUserUseReserveAsCollateral',
            args: [tokenAddress, useAsCollateral],
          }),
        }),
      },
    ];
  }

  async withdraw<account extends Account>(
    reserve: MoneyMarketPoolReserve,
    amount: Decimalish,
    isMaxAmount: boolean,
    opts: TransactionOpts<account>,
  ) {
    const asset = reserve.token;
    const pool = reserve.pool;
    const value = Decimal.from(amount);

    log(
      `Preparing withdraw of ${value.toString()} ${asset.symbol} from pool ${pool.id}`,
      { reserve, amount, isMaxAmount, opts },
    );

    if (asset.isNative || areAddressesEqual(asset.address, pool.weth)) {
      const aWethAddress = aWETH[this.ctx.chainId as keyof typeof aWETH];
      if (!aWethAddress) {
        throw new Error(
          `aWETH address not configured for chain ${this.ctx.chainId}`,
        );
      }

      const approval = await makeApprovalTransaction({
        token: aWethAddress,
        spender: pool.wethGateway,
        amount: isMaxAmount
          ? Decimal.MAX_UINT_256.toBigInt()
          : value.toBigInt(),
        account: toAddress(opts.account),
        client: this.ctx.publicClient,
      });

      return [
        ...(approval
          ? [
              {
                id: 'approve_withdraw_asset',
                title: `Approve ${asset.symbol}`,
                description: `Approve ${value.toString()} ${asset.symbol} for withdrawal`,
                request: approval,
              },
            ]
          : []),
        {
          id: 'withdraw_native_asset',
          title: `Withdraw ${asset.symbol}`,
          description: `Withdraw ${value.toString()} ${asset.symbol}`,
          request: makeTransactionRequest({
            to: pool.wethGateway,
            value: 0n,
            chain: this.ctx.publicClient.chain,
            account: opts.account,
            data: encodeFunctionData({
              abi: wethGatewayAbi,
              functionName: 'withdrawETH',
              args: [
                toAddress(pool.address),
                isMaxAmount
                  ? Decimal.MAX_UINT_256.toBigInt()
                  : value.toBigInt(),
                toAddress(opts.account),
              ],
            }),
          }),
        },
      ];
    }

    return [
      {
        id: 'withdraw_asset',
        title: `Withdraw ${asset.symbol}`,
        description: `Withdraw ${value.toString()} ${asset.symbol}`,
        request: makeTransactionRequest({
          to: pool.address,
          value: 0n,
          chain: this.ctx.publicClient.chain,
          account: opts.account,
          data: encodeFunctionData({
            abi: poolAbi,
            functionName: 'withdraw',
            args: [
              toAddress(asset.address),
              isMaxAmount ? Decimal.MAX_UINT_256.toBigInt() : value.toBigInt(),
              toAddress(opts.account),
            ],
          }),
        }),
      },
    ];
  }

  async repay<account extends Account>(
    reserve: MoneyMarketPoolReserve,
    amount: Decimalish,
    isEntireDebt: boolean,
    useCollateral: boolean,
    borrowRateMode: BorrowRateMode,
    opts: TransactionOpts<account>,
  ) {
    log(
      `Preparing repay of ${Decimal.from(amount).toString()} ${reserve.token.symbol} from pool ${reserve.pool.id}`,
      { reserve, amount, isEntireDebt, useCollateral, borrowRateMode, opts },
    );
    if (!useCollateral) {
      return this.repayWithBalance(
        reserve,
        amount,
        isEntireDebt,
        borrowRateMode,
        opts,
      );
    }

    throw new Error('Repay with collateral is not implemented yet');
  }

  async changeEfficiencyMode<account extends Account>(
    pool: MoneyMarketPool,
    categoryId: MoneyMarketPoolEmodeCategory['id'],
    opts: TransactionOpts<account>,
  ) {
    log(`Changing efficiency mode to category ${categoryId} in pool ${pool}`, {
      categoryId,
      opts,
    });

    return [
      {
        id: 'set_user_emode',
        title: !categoryId ? 'Disable E-Mode' : 'Enable E-Mode',
        description: !categoryId ? 'Disable E-Mode' : `Enable E-Mode`,
        request: makeTransactionRequest({
          to: pool.address,
          value: 0n,
          chain: this.ctx.publicClient.chain,
          account: opts.account,
          data: encodeFunctionData({
            abi: poolAbi,
            functionName: 'setUserEMode',
            args: [categoryId],
          }),
        }),
      },
    ];
  }

  private async repayWithBalance<account extends Account>(
    reserve: MoneyMarketPoolReserve,
    amount: Decimalish,
    isEntireDebt: boolean,
    borrowRateMode: BorrowRateMode,
    opts: TransactionOpts<account>,
  ) {
    const asset = reserve.token;
    const pool = reserve.pool;

    if (asset.isNative || areAddressesEqual(asset.address, pool.weth)) {
      const entry = Decimal.from(amount);

      const value = isEntireDebt ? entry.add(REPAY_ALL_ETH_SURPLUS) : entry;

      return [
        {
          id: 'repay_native_asset__balance',
          title: `Repay ${asset.symbol}`,
          description: `Repay ${entry.toString()} ${asset.symbol}`,
          request: makeTransactionRequest({
            to: pool.wethGateway,
            value: value.toBigInt(),
            chain: this.ctx.publicClient.chain,
            account: opts.account,
            data: encodeFunctionData({
              abi: wethGatewayAbi,
              functionName: 'repayETH',
              args: [
                toAddress(pool.address),
                value.toBigInt(),
                borrowRateMode,
                toAddress(opts.account),
              ],
            }),
          }),
        },
      ];
    }

    const entry = Decimal.from(amount);
    const value = isEntireDebt ? Decimal.MAX_UINT_256 : entry;
    const approval = await makeApprovalTransaction({
      spender: pool.address,
      token: asset.address,
      amount: value.toBigInt(),
      account: toAddress(opts.account),
      client: this.ctx.publicClient,
    });

    return [
      ...(approval
        ? [
            {
              id: 'approve_repay_asset__balance',
              title: `Approve ${asset.symbol}`,
              description: `Approve ${entry.toString()} ${asset.symbol} for repayment`,
              request: approval,
            },
          ]
        : []),
      {
        id: 'repay_asset__balance',
        title: `Repay ${asset.symbol}`,
        description: `Repay ${entry.toString()} ${asset.symbol}`,
        request: makeTransactionRequest({
          to: pool.address,
          value: 0n,
          chain: this.ctx.publicClient.chain,
          account: opts.account,
          data: encodeFunctionData({
            abi: poolAbi,
            functionName: 'repay',
            args: [
              toAddress(asset.address),
              value.toBigInt(),
              borrowRateMode,
              toAddress(opts.account),
            ],
          }),
        }),
      },
    ];
  }
}
