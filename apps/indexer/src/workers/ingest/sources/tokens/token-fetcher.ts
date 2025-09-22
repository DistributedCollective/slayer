import { and, eq, inArray, sql } from 'drizzle-orm';
import { uniqBy } from 'lodash';

import { client } from '../../../../database/client';
import { TNewToken, tTokens } from '../../../../database/schema';
import { encode } from '../../../../libs/encode';
import { logger } from '../../../../libs/logger';
import { SourceAdapter } from '../../types';

export const GIT_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/DistributedCollective/token-list/main';

const log = logger.child({ module: 'token_fetcher_source' });

type TokenData = {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export const tokenFetcherSource: SourceAdapter<TokenData> = {
  name: 'token_fetcher',
  chains: [
    // rsk mainnet
    30,
    // rsk testnet
    31,
    // bob mainnet
    60808,
    // bob testnet
    808813,
  ],

  // update once per 5 minutes
  throttle: async () => 300,

  async fetchBackfill(_cursor, { chain }) {
    const items = await fetchTokensByChain(chain.chainId);
    return { items, nextCursor: undefined, atLiveEdge: true };
  },
  async fetchIncremental(_watermark, _cursor, { chain }) {
    const items = await fetchTokensByChain(chain.chainId);
    return { items, nextCursor: undefined };
  },
  ingest: async (fetchedTokens, { chain }) => {
    let dbTokens: TNewToken[] = [];
    try {
      dbTokens = await client
        .select()
        .from(tTokens)
        .where(eq(tTokens.chainId, chain.chainId))
        .execute();
    } catch (error) {
      log.error(
        error,
        `Error fetching tokens from the database for chainId ${chain.chainId}:`,
      );
      throw error;
    }

    const dbTokenMap = new Map(
      dbTokens.map((token) => [token.address.toLowerCase(), token]),
    );

    const tokensToUpsert: TNewToken[] = [];
    const tokensToIgnore = new Set<string>();

    // Process tokens fetched from GitHub
    for (const token of fetchedTokens) {
      const address = token.address.toLowerCase();
      const dbToken = dbTokenMap.get(address);

      const tokenData: TNewToken = {
        identifier: encode.tokenId(chain.chainId, token.address),
        chainId: chain.chainId,
        address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoUrl: token.logoURI,
        processed: true,
      };

      if (!dbToken) {
        // Token exists in GitHub but not in DB - add it
        tokensToUpsert.push({ ...tokenData, ignored: false });
      } else {
        // Token exists in both - check for updates
        if (
          dbToken.ignored ||
          dbToken.symbol !== token.symbol ||
          dbToken.name !== token.name ||
          dbToken.decimals !== token.decimals ||
          dbToken.logoUrl !== token.logoURI ||
          dbToken.processed === false ||
          !dbToken.identifier
        ) {
          tokensToUpsert.push({ ...tokenData, ignored: false });
        }
        // Remove from dbTokenMap to track remaining tokens not in GitHub
        dbTokenMap.delete(address);
      }
    }

    // Mark remaining tokens in dbTokenMap as ignored
    for (const [address] of dbTokenMap) {
      tokensToIgnore.add(address);
    }

    // Upsert new or updated tokens
    if (tokensToUpsert.length > 0) {
      await client
        .insert(tTokens)
        .values(tokensToUpsert)
        .onConflictDoUpdate({
          target: [tTokens.chainId, tTokens.address],
          set: {
            identifier: sql`EXCLUDED.identifier`,
            symbol: sql`EXCLUDED.symbol`,
            name: sql`EXCLUDED.name`,
            decimals: sql`EXCLUDED.decimals`,
            logoUrl: sql`EXCLUDED.logo_url`,
            ignored: sql`EXCLUDED.ignored`,
            processed: sql`EXCLUDED.processed`,
          },
        })
        .execute();
    }

    // Set ignored = true for tokens not in GitHub
    if (tokensToIgnore.size > 0) {
      const ignoreList = Array.from(tokensToIgnore);
      await client
        .update(tTokens)
        .set({ ignored: true })
        .where(
          and(
            eq(tTokens.chainId, chain.chainId),
            eq(tTokens.ignored, false),
            inArray(tTokens.address, ignoreList),
          ),
        )
        .execute();
    }

    return { highWater: undefined };
  },
};

async function fetchTokensByChain(chainId: number) {
  const tokensUrl = `${GIT_TOKEN_LIST_URL}/${chainId}/tokens.json`;
  try {
    const response = await fetch(tokensUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tokens for chainId ${chainId}: ${response.statusText}`,
      );
    }

    return await response.json().then((data) =>
      uniqBy(
        (data as TokenData[]).map((item) => ({
          ...item,
          address: item.address.toLowerCase(),
        })),
        'address',
      ),
    );
  } catch (err) {
    log.error({ err, chainId }, `error: fetchTokensByChain`);
    return [];
  }
}
