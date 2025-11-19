import { Decimal, Decimalish } from '@sovryn/slayer-shared';
import { computed, flow, makeObservable, observable } from 'mobx';
import { Account, Chain, encodeFunctionData } from 'viem';
import { bobSepolia } from 'viem/chains';
import { BaseClient, Context, SdkRequestOptions } from '../../lib/context.js';
import { toAddress } from '../../lib/helpers.js';
import { makeTransactionRequest } from '../../lib/transaction.js';
import {
  BorrowRateMode,
  MoneyMarketPool,
  MoneyMarketPoolReserve,
  SdkResponse,
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

const addresses = {
  [bobSepolia.id]: {
    weth: '0x327E7E4A9e054ecC67dFa9E3Af158347116321Bf',
    wethGateway: '0x247074C89f5559c18ba34552D0C6C8995c763a0F',
    variableDebtEth: '0xd83f668055d983B2dD5B0338b713bc51dD4a55fF',
    pool: '0xd7308f0626a8e35b645Af0b7fA26Aba9CbD7e6A7',
    uiPoolDataProvider: '0x72Bbd487e81dF47829c64B71871A6C23228dC4f9',
    poolAddressProvider: '0xe8b907899c42ae2fBa09010f18338d6634B9Ab05',
  },
} as const;

const uiPoolProviderAbi = [
  {
    inputs: [
      {
        internalType: 'contract IChainlinkAggregator',
        name: '_networkBaseTokenPriceInUsdProxyAggregator',
        type: 'address',
      },
      {
        internalType: 'contract IChainlinkAggregator',
        name: '_marketReferenceCurrencyPriceInUsdProxyAggregator',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'ETH_CURRENCY_UNIT',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ILendingPoolAddressesProvider',
        name: 'provider',
        type: 'address',
      },
    ],
    name: 'getReservesData',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'underlyingAsset',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'decimals',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'baseLTVasCollateral',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveLiquidationThreshold',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveLiquidationBonus',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveFactor',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'usageAsCollateralEnabled',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'borrowingEnabled',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'stableBorrowRateEnabled',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isActive',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isFrozen',
            type: 'bool',
          },
          {
            internalType: 'uint128',
            name: 'liquidityIndex',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'variableBorrowIndex',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'liquidityRate',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'variableBorrowRate',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'stableBorrowRate',
            type: 'uint128',
          },
          {
            internalType: 'uint40',
            name: 'lastUpdateTimestamp',
            type: 'uint40',
          },
          {
            internalType: 'address',
            name: 'aTokenAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'stableDebtTokenAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'variableDebtTokenAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'interestRateStrategyAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'availableLiquidity',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalPrincipalStableDebt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'averageStableRate',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'stableDebtLastUpdateTimestamp',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalScaledVariableDebt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'priceInMarketReferenceCurrency',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'variableRateSlope1',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'variableRateSlope2',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'stableRateSlope1',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'stableRateSlope2',
            type: 'uint256',
          },
        ],
        internalType: 'struct IUiPoolDataProvider.AggregatedReserveData[]',
        name: '',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'marketReferenceCurrencyUnit',
            type: 'uint256',
          },
          {
            internalType: 'int256',
            name: 'marketReferenceCurrencyPriceInUsd',
            type: 'int256',
          },
          {
            internalType: 'int256',
            name: 'networkBaseTokenPriceInUsd',
            type: 'int256',
          },
          {
            internalType: 'uint8',
            name: 'networkBaseTokenPriceDecimals',
            type: 'uint8',
          },
        ],
        internalType: 'struct IUiPoolDataProvider.BaseCurrencyInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ILendingPoolAddressesProvider',
        name: 'provider',
        type: 'address',
      },
    ],
    name: 'getReservesList',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ILendingPoolAddressesProvider',
        name: 'provider',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserReservesData',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'underlyingAsset',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'scaledATokenBalance',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'usageAsCollateralEnabledOnUser',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'stableBorrowRate',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'scaledVariableDebt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'principalStableDebt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'stableBorrowLastUpdateTimestamp',
            type: 'uint256',
          },
        ],
        internalType: 'struct IUiPoolDataProvider.UserReserveData[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marketReferenceCurrencyPriceInUsdProxyAggregator',
    outputs: [
      {
        internalType: 'contract IChainlinkAggregator',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'networkBaseTokenPriceInUsdProxyAggregator',
    outputs: [
      {
        internalType: 'contract IChainlinkAggregator',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class Reserve<chain extends Chain> extends BaseClient<chain> {
  data: MoneyMarketPoolReserve;

  constructor(value: MoneyMarketPoolReserve, chain: Context<chain>) {
    super(chain);

    makeObservable(this, {
      data: observable,
      token: computed,
      update: flow,
    });

    this.data = value;

    // this.update();
  }

  get token() {
    return this.data.token;
  }

  *update(
    opts: SdkRequestOptions = {},
  ): Generator<
    Promise<SdkResponse<MoneyMarketPool>>,
    void,
    SdkResponse<MoneyMarketPoolReserve>
  > {
    // const response = yield this.ctx.http.request<SdkResponse<MoneyMarketPoolReserve>>(
    //   `/${this.ctx.chainId}/money-market`,
    //   { ...opts, query: buildQuery(opts.query) },
    // );
    // this.data = response.data;
  }

  async borrow<account extends Account>(
    amount: Decimalish,
    rateMode: BorrowRateMode,
    opts: TransactionOpts<account>,
  ) {
    if (this.ctx.chainId !== bobSepolia.id || !addresses[this.ctx.chainId]) {
      throw new Error(
        `Money Market addresses not configured for chain ${this.ctx.chainId}`,
      );
    }

    const asset = this.data.token;
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

  async getReservesData() {
    if (this.ctx.chainId !== bobSepolia.id || !addresses[this.ctx.chainId]) {
      throw new Error(
        `Money Market addresses not configured for chain ${this.ctx.chainId}`,
      );
    }

    return this.ctx.publicClient.readContract({
      address: addresses[this.ctx.chainId].uiPoolDataProvider,
      abi: uiPoolProviderAbi,
      functionName: 'getReservesData',
      args: [addresses[this.ctx.chainId].poolAddressProvider],
    });
  }
}
