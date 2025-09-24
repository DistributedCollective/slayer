import type { Job } from 'bullmq';
import '../../env';

import { getAdapter } from './helpers';
import { Context, HighWaterMark, IngestWorkerType } from './types';

import { chains } from '../../configs/chains';
import { TIngestionSource, TIngestionSourceMode } from '../../database/schema';
import { encode } from '../../libs/encode';
import { logger } from '../../libs/logger';
import { ingestQueue } from '../queues';
import { checkpoints } from './checkpoints';

const log = logger.child({ worker: 'ingest.worker' });

Error.stackTraceLimit = Infinity;

export default async function (job: Job<IngestWorkerType>) {
  try {
    const key = encode.identity([job.data.source, job.data.chainId.toString()]);

    const adapter = getAdapter(job.data.source);
    const cp = await checkpoints.getOrCreate(
      key,
      [job.data.source, job.data.chainId.toString()],
      adapter.highWaterMark,
    );

    const chain = chains.get(job.data.chainId);
    const ctx: Context = { chain, checkpoint: cp };

    if (adapter.enabled) {
      if (!(await adapter.enabled(ctx))) {
        job.log('adapter disabled');
        return 'DISABLED';
      }
    }

    if (adapter.throttle) {
      const waitTime = await adapter.throttle(ctx);
      const timeSinceLastRun = Date.now() - (cp.lastSyncedAt?.getTime() || 0);
      if (timeSinceLastRun < waitTime * 1000) {
        job.log(`throttling ingestion for ${waitTime} seconds`);
        await enqueueNextPage(job, waitTime * 1000);
        return 'THROTTLED';
      }
    }

    // backfilling
    if (cp.mode === TIngestionSourceMode.backfill) {
      job.log('backfill mode');
      await handleBackfill(job, adapter, cp, ctx);
      return 'OK:1';
    }

    job.log('live mode');

    // LIVE mode, with 24h safety buffer
    const watermark =
      cp.highWaterMark === HighWaterMark.date
        ? new Date(
            Number(cp.liveWatermark) ?? cp.lastSyncedAt ?? new Date(),
          ).getTime() -
          (adapter.highWaterOverlapWindow ?? 172800) * 1000
        : Number(cp.liveWatermark) - (adapter.highWaterOverlapWindow ?? 1000);

    job.log('watermark: ' + watermark);

    if (adapter.fetchIncremental) {
      job.log('fetching incremental data');
      const { items, nextCursor } = await adapter.fetchIncremental(
        watermark.toString(),
        cp.liveCursor,
        ctx,
      );
      const { highWater } = await adapter.ingest(items, ctx);
      await adapter.onLiveIngested?.(items, ctx, nextCursor === null);

      await checkpoints.markIncrementalProgress(key, nextCursor, highWater);
      if (nextCursor) {
        await enqueueNextPage(job);
      }

      job.log('fetching incremental data done');
      return 'OK:2';
    } else {
      job.log('fallback to backfill');
      // Fallback: call backfill until safety lag window, then remain in live mode and rely on watermark + overlap on each poll.
      await handleBackfill(job, adapter, cp, ctx, true);
      return 'OK:3';
    }
  } catch (err) {
    log.error({ err, job }, 'Error processing ingest job');
    throw err;
  }
}

async function handleBackfill(
  job: Job<IngestWorkerType>,
  adapter: ReturnType<typeof getAdapter>,
  cp: TIngestionSource,
  ctx: Context<unknown>,
  isLiveFallback = false,
) {
  const { items, nextCursor, atLiveEdge } = await adapter.fetchBackfill(
    cp.backfillCursor ?? null,
    ctx,
  );

  const { highWater } = await adapter.ingest(items, ctx);

  if (!isLiveFallback) {
    await adapter.onBackfillIngested?.(items, ctx, nextCursor === undefined);
    await checkpoints.markBackfillProgress(cp, nextCursor, highWater);
  } else {
    await adapter.onLiveIngested?.(items, ctx, nextCursor === undefined);
    await checkpoints.markIncrementalProgress(cp.key, nextCursor, highWater);
  }

  if (nextCursor || atLiveEdge) {
    await enqueueNextPage(job);
  }

  job.log('backfill page done');
}

const enqueueNextPage = async (job: Job<IngestWorkerType>, delay?: number) => {
  job.log('scheduling next page');
  await ingestQueue.removeDeduplicationKey(
    `ingest:${job.data.source}:${job.data.chainId}`,
  );
  await ingestQueue.add(
    delay ? 'throttled' : 'page',
    { source: job.data.source, chainId: job.data.chainId },
    {
      deduplication: { id: `ingest:${job.data.source}:${job.data.chainId}` },
      delay,
    },
  );
};
