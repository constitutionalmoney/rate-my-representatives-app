export * from './audit-outbox.js';
export * from './jurisdiction-registry.js';

export const databaseFoundation = Object.freeze({
  canonicalStore: 'PostgreSQL',
  implementationIssue: 19,
  migrationDirectory: 'packages/db/migrations',
  seedDirectory: 'packages/db/seeds/local',
  status: 'jurisdiction-registry-ready',
});
