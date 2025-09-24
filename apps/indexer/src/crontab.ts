import { CronJob } from 'cron';
import { chains } from './configs/chains';
import { ENV } from './env';
import { onReady } from './libs/startup';
import { ingestSources } from './workers/ingest/sources';
import { ingestQueue } from './workers/queues';

if (!ENV.READ_ONLY_MODE) {
  onReady(() => {
    CronJob.from({
      cronTime: '*/10 * * * * *',
      onTick: async () => {
        const items = ingestSources.flatMap((item) =>
          item.chains
            .filter((chainId) => chains.get(chainId))
            .map((chainId) => ({ source: item.name, chainId })),
        );

        await Promise.allSettled(
          items.map((s) =>
            ingestQueue.add('poll', s, {
              deduplication: { id: `ingest:${s.source}:${s.chainId}` },
            }),
          ),
        );
      },
    }).start();
  });
}
