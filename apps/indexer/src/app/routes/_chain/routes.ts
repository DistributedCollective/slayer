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

      const tokens = await client.query.tTokens.findMany({
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

      const netWorth = Decimal.from(summary.netWorthUSD);
      const borrowBalance = Decimal.from(summary.totalBorrowsUSD);
      const supplyBalance = summary.userReservesData.reduce(
        (s, r) => s.add(r.underlyingBalanceUSD),
        Decimal.from(0),
      );

      const collateralBalance = summary.userReservesData.reduce(
        (s, r) =>
          r.usageAsCollateralEnabledOnUser ? s.add(r.underlyingBalanceUSD) : s,
        Decimal.from(0),
      );

      const computeWeightedSupplyApy = () => {
        let totalSuppliedUsd = Decimal.from(0);
        let weightedSupplyAPYSum = Decimal.from(0);

        summary.userReservesData.forEach((reserve) => {
          const suppliedAmountUsd = Decimal.from(reserve.underlyingBalanceUSD);
          const supplyAPY = Decimal.from(reserve.reserve.supplyAPY);

          weightedSupplyAPYSum = weightedSupplyAPYSum.add(
            supplyAPY.mul(suppliedAmountUsd),
          );
          totalSuppliedUsd = totalSuppliedUsd.add(suppliedAmountUsd);
        });

        if (totalSuppliedUsd.eq(0) || weightedSupplyAPYSum.eq(0)) {
          return Decimal.from(0);
        }
        return weightedSupplyAPYSum.div(totalSuppliedUsd).mul(100);
      };

      const computeWeightedBorrowApy = () => {
        let totalBorrowedUsd = Decimal.from(0);
        let weightedBorrowAPYSum = Decimal.from(0);

        summary.userReservesData.forEach((reserve) => {
          const borrowedAmountUsd = Decimal.from(reserve.totalBorrowsUSD);
          const borrowAPY = Decimal.from(reserve.reserve.variableBorrowAPY);

          weightedBorrowAPYSum = weightedBorrowAPYSum.add(
            borrowAPY.mul(borrowedAmountUsd),
          );
          totalBorrowedUsd = totalBorrowedUsd.add(borrowedAmountUsd);
        });

        if (totalBorrowedUsd.eq(0) || weightedBorrowAPYSum.eq(0)) {
          return Decimal.from(0);
        }
        return weightedBorrowAPYSum.div(totalBorrowedUsd).mul(100);
      };

      const supplyWeightedApy = computeWeightedSupplyApy();
      const borrowWeightedApy = computeWeightedBorrowApy();

      const netApy = netWorth.eq(0)
        ? Decimal.from(0)
        : supplyWeightedApy
            .mul(supplyBalance)
            .div(netWorth)
            .sub(borrowWeightedApy.mul(borrowBalance).div(netWorth));

      const currentLiquidationThreshold = Decimal.from(
        summary.currentLiquidationThreshold,
      );
      const borrowPower = collateralBalance
        .mul(currentLiquidationThreshold)
        .div(1.1);
      const borrowPowerUsed = borrowPower.eq(0)
        ? Decimal.from(100)
        : Decimal.from(borrowBalance).div(borrowPower).mul(100);

      const healthFactor = borrowBalance.eq(0)
        ? Decimal.INFINITY
        : collateralBalance.mul(currentLiquidationThreshold).div(borrowBalance);

      const collateralRatio = borrowBalance.eq(0)
        ? Decimal.INFINITY
        : Decimal.from(summary.healthFactor);

      const userPositions = summary.userReservesData.map((item) => {
        const token = tokens.find((t) =>
          areAddressesEqual(t.address, item.underlyingAsset),
        );

        const availableLiquidity = Decimal.from(
          item.reserve.availableLiquidity,
          item.reserve.decimals,
        );
        // how much the user can borrow if there is no limit of supply
        const canBorrow = Decimal.max(
          borrowPower.sub(borrowBalance).div(item.reserve.priceInUSD),
          Decimal.ZERO,
        );

        // available to borrow for user including liquidity limitation
        const availableToBorrow = availableLiquidity.lt(canBorrow)
          ? availableLiquidity
          : canBorrow;
        const availableToBorrowUsd = availableToBorrow.mul(
          item.reserve.priceInUSD,
        );

        const borrowRateMode = Decimal.from(item.variableBorrows).gt(0) ? 2 : 1;

        const canToggleCollateral =
          !item.usageAsCollateralEnabledOnUser ||
          (borrowBalance.eq(0)
            ? Decimal.INFINITY
            : collateralBalance
                .sub(item.underlyingBalanceUSD)
                .div(borrowBalance)
          ).gt(1.5);

        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (item as any).id,
          pool,
          token,
          reserve: {
            id: item.reserve.id,
            priceUsd: Decimal.from(item.reserve.priceInUSD).toFixed(
              USD_DECIMALS,
            ),
            liquidity: Decimal.from(item.reserve.totalLiquidity).toString(),
            liquidityUsd: Decimal.from(item.reserve.totalLiquidity)
              .mul(Decimal.from(item.reserve.priceInUSD))
              .toFixed(USD_DECIMALS),
            borrowApy: Decimal.from(item.reserve.variableBorrowAPY)
              .mul(100)
              .toFixed(USD_DECIMALS),
            canBeBorrowed: item.reserve.borrowingEnabled,
            supplyApy: Decimal.from(item.reserve.supplyAPY)
              .mul(100)
              .toFixed(USD_DECIMALS),
            canBeCollateral: item.reserve.usageAsCollateralEnabled,
            isActive: item.reserve.isActive,
            isFroze: item.reserve.isFrozen,
            eModes: item.reserve.eModes,
          },
          supplied: item.underlyingBalance,
          suppliedUsd: item.underlyingBalanceUSD,

          supplyApy: Decimal.from(item.reserve.supplyAPY).mul(100).toString(),
          canToggleCollateral,

          borrowed: item.variableBorrows,
          borrowedUsd: item.variableBorrowsUSD,

          collateral: item.usageAsCollateralEnabledOnUser,

          availableToBorrow: availableToBorrow.toString(),
          availableToBorrowUsd: availableToBorrowUsd.toFixed(USD_DECIMALS),

          borrowRateMode,
          borrowApy: Decimal.from(
            borrowRateMode === 1
              ? // @ts-expect-error stableBorrowAPY exists
                (item.reserve.stableBorrowAPY ?? 0)
              : item.reserve.variableBorrowAPY,
          )
            .mul(100)
            .toString(),
          // @ts-expect-error stableBorrowAPY exists
          stableApy: Decimal.from(item.reserve.stableBorrowAPY ?? 0)
            .mul(100)
            .toString(),
          variableApy: Decimal.from(item.reserve.variableBorrowAPY ?? 0)
            .mul(100)
            .toString(),
        };
      });

      return {
        data: {
          positions: userPositions,
          summary: {
            netApy: netApy.toFixed(USD_DECIMALS),
            healthFactor: healthFactor.toFixed(USD_DECIMALS),
            collateralRatio: collateralRatio.toFixed(USD_DECIMALS),
            borrowPower: borrowPower.toFixed(USD_DECIMALS),
            borrowPowerUsed: borrowPowerUsed.toFixed(USD_DECIMALS),

            borrowWeightedApy: borrowWeightedApy.toFixed(USD_DECIMALS),
            supplyWeightedApy: supplyWeightedApy.toFixed(USD_DECIMALS),

            totalLiquidityUsd: supplyBalance.toFixed(USD_DECIMALS),
            totalCollateralUsd: collateralBalance.toFixed(USD_DECIMALS),
            totalBorrowsUsd: borrowBalance.toFixed(USD_DECIMALS),
            availableBorrowsUsd: summary.availableBorrowsUSD,

            currentLoanToValue: summary.currentLoanToValue,
            currentLiquidationThreshold: summary.currentLiquidationThreshold,

            supplyBalanceUsd: supplyBalance.toFixed(USD_DECIMALS),
            collateralBalanceUsd: collateralBalance.toFixed(USD_DECIMALS),

            netWorthUsd: summary.netWorthUSD,
            userEmodeCategoryId: summary.userEmodeCategoryId,
            isInIsolationMode: summary.isInIsolationMode,
          },
        },
      };
    },
  );
}
