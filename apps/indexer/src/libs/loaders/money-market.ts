import { Decimal } from '@sovryn/slayer-shared';
import { Address } from 'viem';
import { maybeCache } from '../../app/plugins/cache';
import { ChainId, chains, ChainSelector } from '../../configs/chains';
import { BASE_DEFINITIONS_URL } from '../../configs/constants';

// uses contract from @aave/contract-helpers (legacy uiprovider ABI)
// @see https://github.com/aave/aave-utilities/blob/%40aave/contract-helpers%401.29.1/packages/contract-helpers/
const uiPoolDataProviderAbi = [
  {
    inputs: [
      {
        internalType: 'contract IPoolAddressesProvider',
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
            internalType: 'address',
            name: 'priceOracle',
            type: 'address',
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
          {
            internalType: 'uint256',
            name: 'baseStableBorrowRate',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'baseVariableBorrowRate',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'optimalUsageRatio',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isPaused',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'isSiloedBorrowing',
            type: 'bool',
          },
          {
            internalType: 'uint128',
            name: 'accruedToTreasury',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'unbacked',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'isolationModeTotalDebt',
            type: 'uint128',
          },
          {
            internalType: 'bool',
            name: 'flashLoanEnabled',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'debtCeiling',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'debtCeilingDecimals',
            type: 'uint256',
          },
          {
            internalType: 'uint8',
            name: 'eModeCategoryId',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'borrowCap',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'supplyCap',
            type: 'uint256',
          },
          {
            internalType: 'uint16',
            name: 'eModeLtv',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'eModeLiquidationThreshold',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'eModeLiquidationBonus',
            type: 'uint16',
          },
          {
            internalType: 'address',
            name: 'eModePriceSource',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'eModeLabel',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'borrowableInIsolation',
            type: 'bool',
          },
        ],
        internalType: 'struct IUiPoolDataProviderV3.AggregatedReserveData[]',
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
        internalType: 'struct IUiPoolDataProviderV3.BaseCurrencyInfo',
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
        internalType: 'contract IPoolAddressesProvider',
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
        internalType: 'contract IPoolAddressesProvider',
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
        internalType: 'struct IUiPoolDataProviderV3.UserReserveData[]',
        name: '',
        type: 'tuple[]',
      },
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const poolAbi = [
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'id',
        type: 'uint8',
      },
    ],
    name: 'getEModeCategoryData',
    outputs: [
      {
        components: [
          {
            internalType: 'uint16',
            name: 'ltv',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'liquidationThreshold',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'liquidationBonus',
            type: 'uint16',
          },
          {
            internalType: 'address',
            name: 'priceSource',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'label',
            type: 'string',
          },
        ],
        internalType: 'struct DataTypes.EModeCategory',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type PoolDefinition = {
  id: string | 'default';
  name: string;
  logoURI: string;
  address: Address;
  wethGateway: Address;
  uiPoolDataProvider: Address;
  poolAddressesProvider: Address;
  variableDebtEth: Address;
  weth: Address;
  treasury: Address;
  subgraphURI: string;
  priceFeedURI: string;
};

export interface PoolBaseCurrencyHumanized {
  marketReferenceCurrencyDecimals: number;
  marketReferenceCurrencyPriceInUsd: string;
  networkBaseTokenPriceInUsd: string;
  networkBaseTokenPriceDecimals: number;
}

export interface ReserveDataHumanized {
  originalId: number;
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  baseLTVasCollateral: string;
  reserveLiquidationThreshold: string;
  reserveLiquidationBonus: string;
  reserveFactor: string;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
  liquidityIndex: string;
  variableBorrowIndex: string;
  liquidityRate: string;
  variableBorrowRate: string;
  lastUpdateTimestamp: number;
  aTokenAddress: string;
  variableDebtTokenAddress: string;
  interestRateStrategyAddress: string;
  availableLiquidity: string;
  totalScaledVariableDebt: string;
  priceInMarketReferenceCurrency: string;
  priceOracle: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  baseVariableBorrowRate: string;
  optimalUsageRatio: string;

  stableBorrowRateEnabled: boolean;
  stableBorrowRate: string;
  stableDebtTokenAddress: string;
  totalPrincipalStableDebt: string;
  averageStableRate: string;
  stableDebtLastUpdateTimestamp: number;

  stableRateSlope1: string;
  stableRateSlope2: string;
  baseStableBorrowRate: string;

  eModeCategoryId: number;
  eModeLtv: number;
  eModeLiquidationThreshold: number;
  eModeLiquidationBonus: number;
  eModePriceSource: string;
  eModeLabel: string;
  // v3 only
  isPaused: boolean;
  isSiloedBorrowing: boolean;
  accruedToTreasury: string;
  unbacked: string;
  isolationModeTotalDebt: string;
  flashLoanEnabled: boolean;
  debtCeiling: string;
  debtCeilingDecimals: number;
  borrowCap: string;
  supplyCap: string;
  borrowableInIsolation: boolean;
  virtualAccActive: boolean;
  virtualUnderlyingBalance: string;
}

export interface ReservesDataHumanized {
  reservesData: ReserveDataHumanized[];
  baseCurrencyData: PoolBaseCurrencyHumanized;
}

export async function fetchPoolList(chainId: ChainId) {
  return maybeCache(
    `pool:list:${chainId}`,
    async () => {
      const url = `${BASE_DEFINITIONS_URL}/chains/${chainId}/money-market.json`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch pools for chainId ${chainId}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as { items: PoolDefinition[] };

      return data.items;
    },
    {
      ttlSeconds: 60 * 5, // 5 minutes
    },
  );
}

export function selectPoolById(
  id: PoolDefinition['id'],
  pools: PoolDefinition[],
) {
  return pools.find((pool) => pool.id === id);
}

export async function fetchPoolReserves(
  chainId: ChainSelector,
  pool: PoolDefinition,
) {
  const chain = chains.get(chainId);
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  return maybeCache(
    `pool:reserves:${chainId}:${pool.address}`,
    async () => {
      const { 0: reservesRaw, 1: poolBaseCurrencyRaw } =
        await chain.rpc.readContract({
          address: pool.uiPoolDataProvider,
          abi: uiPoolDataProviderAbi,
          functionName: 'getReservesData',
          args: [pool.poolAddressesProvider],
        });

      const baseCurrencyData: PoolBaseCurrencyHumanized = {
        // this is to get the decimals from the unit so 1e18 = string length of 19 - 1 to get the number of 0
        marketReferenceCurrencyDecimals:
          poolBaseCurrencyRaw.marketReferenceCurrencyUnit.toString().length - 1,
        marketReferenceCurrencyPriceInUsd:
          poolBaseCurrencyRaw.marketReferenceCurrencyPriceInUsd.toString(),
        networkBaseTokenPriceInUsd:
          poolBaseCurrencyRaw.networkBaseTokenPriceInUsd.toString(),
        networkBaseTokenPriceDecimals:
          poolBaseCurrencyRaw.networkBaseTokenPriceDecimals,
      };

      const reserves = reservesRaw.map((reserveRaw) => {
        return {
          originalId: reserveRaw.liquidityIndex.toNumber(),
          id: `${chainId}-${reserveRaw.underlyingAsset}-${pool.poolAddressesProvider}`.toLowerCase(),
          underlyingAsset: reserveRaw.underlyingAsset.toLowerCase(),
          name: reserveRaw.name,
          symbol: 'todo', // todo
          // symbol: ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
          //   ? ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
          //   : reserveRaw.symbol,
          decimals: reserveRaw.decimals.toNumber(),
          baseLTVasCollateral: reserveRaw.baseLTVasCollateral.toString(),
          reserveLiquidationThreshold:
            reserveRaw.reserveLiquidationThreshold.toString(),
          reserveLiquidationBonus:
            reserveRaw.reserveLiquidationBonus.toString(),
          reserveFactor: reserveRaw.reserveFactor.toString(),
          usageAsCollateralEnabled: reserveRaw.usageAsCollateralEnabled,
          borrowingEnabled: reserveRaw.borrowingEnabled,
          stableBorrowRateEnabled: reserveRaw.stableBorrowRateEnabled,
          isActive: reserveRaw.isActive,
          isFrozen: reserveRaw.isFrozen,
          liquidityIndex: reserveRaw.liquidityIndex.toString(),
          variableBorrowIndex: reserveRaw.variableBorrowIndex.toString(),
          liquidityRate: reserveRaw.liquidityRate.toString(),
          variableBorrowRate: reserveRaw.variableBorrowRate.toString(),
          stableBorrowRate: reserveRaw.stableBorrowRate.toString(),
          lastUpdateTimestamp: reserveRaw.lastUpdateTimestamp,
          aTokenAddress: reserveRaw.aTokenAddress.toString(),
          stableDebtTokenAddress: reserveRaw.stableDebtTokenAddress.toString(),
          variableDebtTokenAddress:
            reserveRaw.variableDebtTokenAddress.toString(),
          interestRateStrategyAddress:
            reserveRaw.interestRateStrategyAddress.toString(),
          availableLiquidity: reserveRaw.availableLiquidity.toString(),
          totalPrincipalStableDebt:
            reserveRaw.totalPrincipalStableDebt.toString(),
          averageStableRate: reserveRaw.averageStableRate.toString(),
          stableDebtLastUpdateTimestamp:
            reserveRaw.stableDebtLastUpdateTimestamp.toNumber(),
          totalScaledVariableDebt:
            reserveRaw.totalScaledVariableDebt.toString(),
          priceInMarketReferenceCurrency:
            reserveRaw.priceInMarketReferenceCurrency.toString(),
          priceOracle: reserveRaw.priceOracle,
          variableRateSlope1: reserveRaw.variableRateSlope1.toString(),
          variableRateSlope2: reserveRaw.variableRateSlope2.toString(),
          stableRateSlope1: reserveRaw.stableRateSlope1.toString(),
          stableRateSlope2: reserveRaw.stableRateSlope2.toString(),
          baseStableBorrowRate: reserveRaw.baseStableBorrowRate.toString(),
          baseVariableBorrowRate: reserveRaw.baseVariableBorrowRate.toString(),
          optimalUsageRatio: reserveRaw.optimalUsageRatio.toString(),
          // new fields
          isPaused: reserveRaw.isPaused,
          debtCeiling: reserveRaw.debtCeiling.toString(),
          eModeCategoryId: reserveRaw.eModeCategoryId,
          borrowCap: reserveRaw.borrowCap.toString(),
          supplyCap: reserveRaw.supplyCap.toString(),
          eModeLtv: reserveRaw.eModeLtv,
          eModeLiquidationThreshold: reserveRaw.eModeLiquidationThreshold,
          eModeLiquidationBonus: reserveRaw.eModeLiquidationBonus,
          eModePriceSource: reserveRaw.eModePriceSource.toString(),
          eModeLabel: reserveRaw.eModeLabel.toString(),
          borrowableInIsolation: reserveRaw.borrowableInIsolation,
          accruedToTreasury: reserveRaw.accruedToTreasury.toString(),
          unbacked: reserveRaw.unbacked.toString(),
          isolationModeTotalDebt: reserveRaw.isolationModeTotalDebt.toString(),
          debtCeilingDecimals: reserveRaw.debtCeilingDecimals.toNumber(),
          isSiloedBorrowing: reserveRaw.isSiloedBorrowing,
          flashLoanEnabled: reserveRaw.flashLoanEnabled,
          virtualAccActive: false,
          virtualUnderlyingBalance: '0',
        } satisfies ReserveDataHumanized;
      });

      return {
        reservesData: reserves,
        baseCurrencyData,
      } satisfies ReservesDataHumanized;
    },
    {
      ttlSeconds: 30,
    },
  );
}

export interface UserReserveDataHumanized {
  id: string;
  underlyingAsset: string;
  scaledATokenBalance: string;
  usageAsCollateralEnabledOnUser: boolean;
  stableBorrowRate: string;
  scaledVariableDebt: string;
  principalStableDebt: string;
  stableBorrowLastUpdateTimestamp: number;
}

export async function fetchUserReserves(
  chainId: ChainSelector,
  pool: PoolDefinition,
  user: string,
): Promise<{
  userReserves: UserReserveDataHumanized[];
  userEmodeCategoryId: number;
}> {
  const chain = chains.get(chainId);
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  const { 0: userReservesRaw, 1: userEmodeCategoryId } =
    await chain.rpc.readContract({
      address: pool.uiPoolDataProvider,
      abi: uiPoolDataProviderAbi,
      functionName: 'getUserReservesData',
      args: [pool.poolAddressesProvider, user as Address],
    });

  return {
    userReserves: userReservesRaw.map((userReserveRaw) => ({
      id: `${chainId}-${user}-${userReserveRaw.underlyingAsset}-${pool.poolAddressesProvider}`.toLowerCase(),
      underlyingAsset: userReserveRaw.underlyingAsset.toLowerCase(),
      scaledATokenBalance: userReserveRaw.scaledATokenBalance.toString(),
      usageAsCollateralEnabledOnUser:
        userReserveRaw.usageAsCollateralEnabledOnUser,
      stableBorrowRate: userReserveRaw.stableBorrowRate.toString(),
      scaledVariableDebt: userReserveRaw.scaledVariableDebt.toString(),
      principalStableDebt: userReserveRaw.principalStableDebt.toString(),
      stableBorrowLastUpdateTimestamp:
        userReserveRaw.stableBorrowLastUpdateTimestamp.toNumber(),
    })),
    userEmodeCategoryId,
  };
}

export async function fetchEmodeCategoryData(
  chainId: ChainSelector,
  pool: PoolDefinition,
  reserves: Awaited<ReturnType<typeof fetchPoolReserves>>['reservesData'],
) {
  const chain = chains.get(chainId);
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  const categoryIds = Array.from(
    new Set(reserves.map((reserve) => reserve.eModeCategoryId)),
  ).filter((id) => id !== 0);

  const results = await chain.rpc.multicall({
    contracts: categoryIds.map((id) => ({
      address: pool.address,
      abi: poolAbi,
      functionName: 'getEModeCategoryData',
      args: [id],
    })),
  });

  return results
    .map(({ result }, index) => {
      if (!result) {
        return null;
      }

      const { ltv, liquidationThreshold, liquidationBonus, label } = result;
      const categoryId = categoryIds[index];

      return {
        id: categoryId,
        ltv: Decimal.from(ltv).div(100).toString(),
        liquidationThreshold: Decimal.from(liquidationThreshold)
          .div(100)
          .toString(),
        liquidationBonus: Decimal.from(liquidationBonus).div(100).toString(),
        label,
        assets: reserves
          .filter((reserve) => reserve.eModeCategoryId === categoryId)
          .map((reserve) => reserve.underlyingAsset.toLowerCase()),
      };
    })
    .filter((item) => item != null);
}
