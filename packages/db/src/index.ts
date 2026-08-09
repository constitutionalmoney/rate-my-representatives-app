export * from './audit-outbox.js';
export * from './jurisdiction-registry.js';
export * from './location-resolution.js';
export * from './public-role-registry.js';
export * from './public-profile.js';
export * from './source-ingestion.js';

export const databaseFoundation = Object.freeze({
  canonicalStore: 'PostgreSQL',
  implementationIssue: 19,
  migrationDirectory: 'packages/db/migrations',
  seedDirectory: 'packages/db/seeds/local',
  status: 'privacy-minimized-location-preference-ready',
});
