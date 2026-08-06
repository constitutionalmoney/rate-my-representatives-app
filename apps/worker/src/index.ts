import { loadRuntimeConfig } from '@rmr/config';
import { createStructuredEvent } from '@rmr/observability';

const config = loadRuntimeConfig(process.env);
process.stdout.write(
  `${JSON.stringify(
    createStructuredEvent('foundation.worker.ready', {
      civicJobsRegistered: 0,
      optionalVerus: config.featureFlags.VERUS_ANCHORING_ENABLED ? 'configured' : 'disabled',
    }),
  )}\n`,
);
