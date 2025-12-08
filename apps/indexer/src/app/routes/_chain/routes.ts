import {
  formatReserves,
  formatUserSummary,
  USD_DECIMALS,
} from '@aave/math-utils';
import { areAddressesEqual, Decimal } from '@sovryn/slayer-shared';
import { and, asc, eq, gte, inArray } from 'drizzle-orm';
import { FastifyRequest } from 'fastify';
import z from 'zod';
import { client } from '../../../database/client';
import { tTokens } from '../../../database/schema';
import { tTokensSelectors } from '../../../database/selectors';
import {
  fetchPoolList,
  fetchPoolReserves,
  fetchUserReserves,
  selectPoolById,
} from '../../../libs/loaders/money-market';
import { paginationResponse, paginationSchema } from '../../../libs/pagination';
import { ZodFastifyInstance } from '../../../libs/server';
import { ze } from '../../../libs/validators/validators';

export default async function (fastify: ZodFastifyInstance) {
  fastify.get('/', async (req) => {
    return { data: req.chain };
  });

  fastify.get(
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

  fastify.get(
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

  fastify.get(
    '/money-market/:pool/reserves',
    {
      schema: {
        querystring: paginationSchema,
        params: z.object({
          pool: z.string(),
        }),
      },
      config: {
        cache: false,
      },
    },
    async (req: FastifyRequest<{ Params: { pool: string } }>, reply) => {
      const pools = await fetchPoolList(req.chain.chainId);
      const pool = selectPoolById(req.params.pool, pools);

      if (!pool) {
        return reply.notFound('Pool not found');
      }

      const { reservesData, baseCurrencyData } = await fetchPoolReserves(
        req.chain.chainId,
        pool,
      );

      const tokens = await client.query.tTokens.findMany({
        columns: tTokensSelectors.columns,
        where: and(
          eq(tTokens.chainId, req.chain.chainId),
          inArray(
            tTokens.address,
            reservesData.map((i) => i.underlyingAsset.toLowerCase()),
          ),
        ),
      });

      const data = formatReserves({
        reserves: reservesData,
        currentTimestamp: Math.floor(Date.now() / 1000),
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
      });

      // const reservesData: Partial<ReserveDataHumanized>[] = reservesRaw.map(
      //   (reserveRaw, index) => {
      //     // const virtualUnderlyingBalance =
      //     //   reserveRaw.virtualUnderlyingBalance.toString();
      //     // const { virtualAccActive } = reserveRaw;

      //     // const { totalDebt, totalVariableDebt, totalLiquidity } =
      //     //   calculateReserveDebt(reserveRaw, currentTimestamp);

      //     //   formatRe

      //     return {
      //       originalId: index,
      //       id: `${req.chain.chainId}-${reserveRaw.underlyingAsset}-${pool.address}`.toLowerCase(),
      //       // underlyingAsset: reserveRaw.underlyingAsset.toLowerCase(),

      //       token: tokens.find((t) =>
      //         areAddressesEqual(t.address, reserveRaw.underlyingAsset),
      //       ),
      //       pool,

      //       // name: reserveRaw.name,
      //       // symbol: ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
      //       //   ? ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
      //       //   : reserveRaw.symbol,
      //       // decimals: reserveRaw.decimals.toNumber(),
      //       baseLTVasCollateral: reserveRaw.baseLTVasCollateral.toString(),
      //       reserveLiquidationThreshold:
      //         reserveRaw.reserveLiquidationThreshold.toString(),
      //       reserveLiquidationBonus:
      //         reserveRaw.reserveLiquidationBonus.toString(),
      //       reserveFactor: reserveRaw.reserveFactor.toString(),
      //       usageAsCollateralEnabled: reserveRaw.usageAsCollateralEnabled,
      //       borrowingEnabled: reserveRaw.borrowingEnabled,
      //       isActive: reserveRaw.isActive,
      //       isFrozen: reserveRaw.isFrozen,
      //       liquidityIndex: reserveRaw.liquidityIndex.toString(),
      //       variableBorrowIndex: reserveRaw.variableBorrowIndex.toString(),
      //       liquidityRate: reserveRaw.liquidityRate.toString(),
      //       variableBorrowRate: reserveRaw.variableBorrowRate.toString(),
      //       lastUpdateTimestamp: reserveRaw.lastUpdateTimestamp,
      //       aTokenAddress: reserveRaw.aTokenAddress.toString(),
      //       variableDebtTokenAddress:
      //         reserveRaw.variableDebtTokenAddress.toString(),
      //       interestRateStrategyAddress:
      //         reserveRaw.interestRateStrategyAddress.toString(),
      //       availableLiquidity: Decimal.from(
      //         reserveRaw.availableLiquidity,
      //         reserveRaw.decimals.toNumber(),
      //       ).toString(),
      //       // availableLiquidity: reserveRaw.availableLiquidity.toString(),
      //       totalScaledVariableDebt:
      //         reserveRaw.totalScaledVariableDebt.toString(),
      //       priceInMarketReferenceCurrency:
      //         reserveRaw.priceInMarketReferenceCurrency.toString(),
      //       // priceOracle: reserveRaw.priceOracle,
      //       variableRateSlope1: reserveRaw.variableRateSlope1.toString(),
      //       variableRateSlope2: reserveRaw.variableRateSlope2.toString(),
      //       // baseVariableBorrowRate:
      //       //   reserveRaw.baseVariableBorrowRate.toString(),
      //       // optimalUsageRatio: reserveRaw.optimalUsageRatio.toString(),
      //       // new fields
      //       // isPaused: reserveRaw.isPaused,
      //       // debtCeiling: reserveRaw.debtCeiling.toString(),
      //       // borrowCap: reserveRaw.borrowCap.toString(),
      //       // supplyCap: reserveRaw.supplyCap.toString(),
      //       // borrowableInIsolation: reserveRaw.borrowableInIsolation,
      //       // accruedToTreasury: reserveRaw.accruedToTreasury.toString(),
      //       // unbacked: reserveRaw.unbacked.toString(),
      //       // isolationModeTotalDebt:
      //       //   reserveRaw.isolationModeTotalDebt.toString(),
      //       // debtCeilingDecimals: reserveRaw.debtCeilingDecimals.toNumber(),
      //       // isSiloedBorrowing: reserveRaw.isSiloedBorrowing,
      //       // flashLoanEnabled: reserveRaw.flashLoanEnabled,
      //       // virtualAccActive,
      //       // virtualUnderlyingBalance,
      //     };
      //   },
      // );

      const items = data.map((item) => {
        const token = tokens.find((t) =>
          areAddressesEqual(t.address, item.underlyingAsset),
        );

        return {
          id: item.id,
          pool,
          token,
          priceUsd: Decimal.from(item.priceInUSD).toFixed(USD_DECIMALS),
          liquidity: Decimal.from(item.totalLiquidity).toString(),
          liquidityUsd: Decimal.from(item.totalLiquidity)
            .mul(Decimal.from(item.priceInUSD))
            .toFixed(USD_DECIMALS),
          borrowApy: Decimal.from(item.variableBorrowAPY)
            .mul(100)
            .toFixed(USD_DECIMALS),
          canBeBorrowed: item.borrowingEnabled,
          supplyApy: Decimal.from(item.supplyAPY)
            .mul(100)
            .toFixed(USD_DECIMALS),
          canBeCollateral: item.usageAsCollateralEnabled,
          isActive: item.isActive,
          isFroze: item.isFrozen,
          eModes: item.eModes,
        };
      });

      return { data: { reservesData: items, baseCurrencyData } };

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

  fastify.get(
    '/money-market/:pool/user/:address/positions',
    {
      schema: {
        querystring: paginationSchema,
        params: z.object({
          pool: z.string(),
          address: ze.address,
        }),
      },
      config: {
        cache: {
          enabled: false,
          ttlSeconds: 10,
          staleTtlSeconds: 15,
        },
      },
    },
    async (
      req: FastifyRequest<{ Params: { pool: string; address: string } }>,
      reply,
    ) => {
      const pools = await fetchPoolList(req.chain.chainId);
      const pool = selectPoolById(req.params.pool, pools);

      if (!pool) return reply.notFound('Pool not found');

      const currentTimestamp = Math.floor(Date.now() / 1000);

      const { reservesData, baseCurrencyData } = await fetchPoolReserves(
        req.chain.chainId,
        pool,
      );

      const { userReserves, userEmodeCategoryId } = await fetchUserReserves(
        req.chain.chainId,
        pool,
        req.params.address,
      );

      await client.query.tTokens.findMany({
        columns: tTokensSelectors.columns,
        where: and(
          eq(tTokens.chainId, req.chain.chainId),
          inArray(
            tTokens.address,
            userReserves.map((i) => i.underlyingAsset.toLowerCase()),
          ),
        ),
      });

      const summary = formatUserSummary({
        currentTimestamp,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves,
        userEmodeCategoryId,
        formattedReserves: formatReserves({
          reserves: reservesData,
          currentTimestamp,
          marketReferencePriceInUsd:
            baseCurrencyData.marketReferenceCurrencyPriceInUsd,
          marketReferenceCurrencyDecimals:
            baseCurrencyData.marketReferenceCurrencyDecimals,
        }),
      });

      // const userReserves = userReservesRaw
      //   .filter(
      //     (item) =>
      //       item.scaledATokenBalance > 0n || item.scaledVariableDebt > 0n,
      //   )
      //   .map((userReserveRaw) => {
      //     const token = tokens.find((t) =>
      //       areAddressesEqual(t.address, userReserveRaw.underlyingAsset),
      //     );
      //     const reserve = reserves.find((r) =>
      //       areAddressesEqual(
      //         r.underlyingAsset,
      //         userReserveRaw.underlyingAsset,
      //       ),
      //     );

      //     const usdPrice = Decimal.from(
      //       reserve?.priceInMarketReferenceCurrency.toString() || '0',
      //     ).div(Decimal.pow(baseCurrencyData.marketReferenceCurrencyDecimals));

      //     const suppliedBalance = Decimal.from(
      //       userReserveRaw.scaledATokenBalance,
      //       token?.decimals ?? 18,
      //     );

      //     const borrowedBalance = Decimal.from(
      //       userReserveRaw.scaledVariableDebt,
      //       token?.decimals ?? 18,
      //     );

      //     return {
      //       id: `${req.chain.chainId}-${req.params.address}-${userReserveRaw.underlyingAsset}-${pool.address}`.toLowerCase(),
      //       // pool,
      //       // token,
      //       // reserve,

      //       usdPrice: usdPrice.toString(),
      //       priceInMarketReferenceCurrency:
      //         reserve?.priceInMarketReferenceCurrency,
      //       decimalsD: baseCurrencyData.marketReferenceCurrencyDecimals,
      //       raw: baseCurrencyData,

      //       suppliedBalance: suppliedBalance.toString(),
      //       suppliedBalanceUsd: suppliedBalance
      //         .mul(usdPrice)
      //         .toFixed(USD_DECIMALS),

      //       borrowedBalance: borrowedBalance.toString(),
      //       borrowedBalanceUsd: borrowedBalance
      //         .mul(usdPrice)
      //         .toFixed(USD_DECIMALS),

      //       underlyingAsset: userReserveRaw.underlyingAsset.toLowerCase(),
      //       scaledATokenBalance: userReserveRaw.scaledATokenBalance.toString(),
      //       usageAsCollateralEnabledOnUser:
      //         userReserveRaw.usageAsCollateralEnabledOnUser,
      //       stableBorrowRate: userReserveRaw.stableBorrowRate.toString(),
      //       scaledVariableDebt: userReserveRaw.scaledVariableDebt.toString(),
      //       principalStableDebt: userReserveRaw.principalStableDebt.toString(),
      //       stableBorrowLastUpdateTimestamp:
      //         userReserveRaw.stableBorrowLastUpdateTimestamp.toNumber(),
      //     };
      //   });

      return {
        data: summary,
      };
    },
  );
}
