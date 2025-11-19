import { Decimal } from '@sovryn/slayer-shared';
import { and, asc, eq, gte, inArray } from 'drizzle-orm';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { client } from '../../../database/client';
import { tTokens } from '../../../database/schema';
import { TTokenSelected, tTokensSelectors } from '../../../database/selectors';
import {
  fetchPoolList,
  fetchPoolReserves,
} from '../../../libs/loaders/money-market';
import { paginationResponse, paginationSchema } from '../../../libs/pagination';
import { areAddressesEqual } from '../../../libs/utils/helpers';

interface ReserveDataHumanized {
  originalId: number;
  id: string;
  underlyingAsset: string;

  token: TTokenSelected;

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

interface PoolBaseCurrencyHumanized {
  marketReferenceCurrencyDecimals: number;
  marketReferenceCurrencyPriceInUsd: string;
  networkBaseTokenPriceInUsd: string;
  networkBaseTokenPriceDecimals: number;
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async (req) => {
    return { data: req.chain };
  });

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/tokens',
    {
      schema: {
        querystring: paginationSchema,
      },
      config: {
        cache: {
          key: (req) => `chain:${req.chain.chainId}:tokens`,
          ttlSeconds: 30,
          enabled: true,
        },
      },
    },
    async (req) => {
      const items = await client.query.tTokens.findMany({
        columns: tTokensSelectors.columns,
        orderBy: asc(tTokens.address),
        where: and(
          eq(tTokens.chainId, req.chain.chainId),
          req.query.cursor ? gte(tTokens.address, req.query.cursor) : undefined,
        ),
        limit: req.query.limit,
      });

      return paginationResponse(items, req.query.limit, 'address');
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/money-market',
    {
      config: {
        cache: true,
      },
    },
    async (req, reply) => {
      try {
        const data = await fetchPoolList(req.chain.chainId);
        return { data };
      } catch (err) {
        fastify.log.error(
          { err, chainId: req.chain.chainId },
          `error: fetchMoneyMarketByChain`,
        );
        return reply.notFound(
          'Money Market data is not available for this chain',
        );
      }
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/money-market/:pool',
    {
      schema: {
        querystring: paginationSchema,
        params: z.object({
          pool: z.string(),
        }),
      },
      // config: {
      //   cache: true,
      // },
    },
    async (req: FastifyRequest<{ Params: { pool: string } }>, reply) => {
      const pools = await fetchPoolList(req.chain.chainId);
      const pool = pools.find(
        (p) => p.address.toLowerCase() === req.params.pool.toLowerCase(),
      );

      if (!pool) {
        return reply.notFound('Pool not found');
      }

      const { 0: reservesRaw, 1: poolBaseCurrencyRaw } =
        await fetchPoolReserves(req.chain.chainId, pool);

      const tokens = await client.query.tTokens.findMany({
        columns: tTokensSelectors.columns,
        where: and(
          eq(tTokens.chainId, req.chain.chainId),
          inArray(
            tTokens.address,
            reservesRaw.map((i) => i.underlyingAsset.toLowerCase()),
          ),
        ),
      });

      const reservesData: Partial<ReserveDataHumanized>[] = reservesRaw.map(
        (reserveRaw, index) => {
          // const virtualUnderlyingBalance =
          //   reserveRaw.virtualUnderlyingBalance.toString();
          // const { virtualAccActive } = reserveRaw;
          return {
            originalId: index,
            id: `!!${req.chain.chainId}-${reserveRaw.underlyingAsset}-${pool.address}`.toLowerCase(),
            underlyingAsset: reserveRaw.underlyingAsset.toLowerCase(),

            token: tokens.find((t) =>
              areAddressesEqual(t.address, reserveRaw.underlyingAsset),
            ),

            name: reserveRaw.name,
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
            isActive: reserveRaw.isActive,
            isFrozen: reserveRaw.isFrozen,
            liquidityIndex: reserveRaw.liquidityIndex.toString(),
            variableBorrowIndex: reserveRaw.variableBorrowIndex.toString(),
            liquidityRate: reserveRaw.liquidityRate.toString(),
            variableBorrowRate: reserveRaw.variableBorrowRate.toString(),
            lastUpdateTimestamp: reserveRaw.lastUpdateTimestamp,
            aTokenAddress: reserveRaw.aTokenAddress.toString(),
            variableDebtTokenAddress:
              reserveRaw.variableDebtTokenAddress.toString(),
            interestRateStrategyAddress:
              reserveRaw.interestRateStrategyAddress.toString(),
            availableLiquidity: Decimal.from(
              reserveRaw.availableLiquidity,
              reserveRaw.decimals.toNumber(),
            ).toString(),
            // availableLiquidity: reserveRaw.availableLiquidity.toString(),
            totalScaledVariableDebt:
              reserveRaw.totalScaledVariableDebt.toString(),
            priceInMarketReferenceCurrency:
              reserveRaw.priceInMarketReferenceCurrency.toString(),
            // priceOracle: reserveRaw.priceOracle,
            variableRateSlope1: reserveRaw.variableRateSlope1.toString(),
            variableRateSlope2: reserveRaw.variableRateSlope2.toString(),
            // baseVariableBorrowRate:
            //   reserveRaw.baseVariableBorrowRate.toString(),
            // optimalUsageRatio: reserveRaw.optimalUsageRatio.toString(),
            // new fields
            // isPaused: reserveRaw.isPaused,
            // debtCeiling: reserveRaw.debtCeiling.toString(),
            // borrowCap: reserveRaw.borrowCap.toString(),
            // supplyCap: reserveRaw.supplyCap.toString(),
            // borrowableInIsolation: reserveRaw.borrowableInIsolation,
            // accruedToTreasury: reserveRaw.accruedToTreasury.toString(),
            // unbacked: reserveRaw.unbacked.toString(),
            // isolationModeTotalDebt:
            //   reserveRaw.isolationModeTotalDebt.toString(),
            // debtCeilingDecimals: reserveRaw.debtCeilingDecimals.toNumber(),
            // isSiloedBorrowing: reserveRaw.isSiloedBorrowing,
            // flashLoanEnabled: reserveRaw.flashLoanEnabled,
            // virtualAccActive,
            // virtualUnderlyingBalance,
          };
        },
      );

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

      return { data: { reservesData, baseCurrencyData } };

      // return {
      //   data: items
      //     .map((item) => ({
      //       ...item,
      //       token: tokens.find((t) => t.address === item.underlyingAsset),
      //     }))
      //     .filter((i) => i.token),
      //   nextCursor: null,
      //   count: items.length,
      // };
    },
  );
}
