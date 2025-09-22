import { CronJob } from 'cron';
import { ENV } from './env';
import { networks } from './libs/chain';
import { onReady } from './libs/startup';
import { ingestSources } from './workers/ingest/sources';
import { ingestQueue } from './workers/queues';

if (!ENV.READ_ONLY_MODE) {
  onReady(() => {
    CronJob.from({
      cronTime: '*/10 * * * * *',
      onTick: async () => {
        // const chains = networks.list()
        const items = ingestSources.flatMap((item) =>
          item.chains
            .filter((chainId) => networks.find((c) => c.chainId === chainId))
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
