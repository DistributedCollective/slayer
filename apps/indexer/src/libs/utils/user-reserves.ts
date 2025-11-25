import { areAddressesEqual } from '@sovryn/slayer-shared';
import { and, eq, inArray } from 'drizzle-orm';
import { client } from '../../database/client';
import { tTokens } from '../../database/schema';
import { tTokensSelectors } from '../../database/selectors';
import { PoolDefinition } from '../loaders/money-market';

export async function transformUserReservesData({
  chainId,
  userAddress,
  pool,
  reserves,
}: {
  chainId: number;
  userAddress: string;
  pool: PoolDefinition;
  reserves: Array<{
    underlyingAsset: string;
    scaledATokenBalance: bigint;
    usageAsCollateralEnabledOnUser: boolean;
    stableBorrowRate: bigint;
    scaledVariableDebt: bigint;
    principalStableDebt: bigint;
    stableBorrowLastUpdateTimestamp: bigint;
  }>;
}) {
  if (!reserves.length) {
    return { data: [], count: 0 };
  }

  const tokens = await client.query.tTokens.findMany({
    columns: tTokensSelectors.columns,
    where: and(
      eq(tTokens.chainId, chainId),
      inArray(
        tTokens.address,
        reserves.map((i) => i.underlyingAsset.toLowerCase()),
      ),
    ),
  });

  const data = reserves.map((pos) => ({
    id: `${chainId}-${pos.underlyingAsset}-${pool.address}-${userAddress}`.toLowerCase(),
    user: userAddress,
    pool,
    token: tokens.find((t) =>
      areAddressesEqual(t.address, pos.underlyingAsset),
    ),
    scaledVariableDebt: pos?.scaledVariableDebt.toString(),
    principalStableDebt: pos?.principalStableDebt.toString(),
    stableBorrowRate: pos?.stableBorrowRate.toString(),
    stableBorrowLastUpdateTimestamp: pos.stableBorrowLastUpdateTimestamp,
    usageAsCollateralEnabledOnUser: pos.usageAsCollateralEnabledOnUser,
  }));

  return { data, count: data.length };
}
