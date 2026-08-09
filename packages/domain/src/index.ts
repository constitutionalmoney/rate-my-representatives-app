export * from './audit-outbox.js';
export * from './jurisdiction-registry.js';
export * from './public-role-registry.js';
export * from './public-profile.js';
export * from './source-ingestion.js';
export * from './security-domains.js';
export * from './synthetic-jurisdiction-registry.js';
export * from './synthetic-public-role-registry.js';

export const domainFoundation = Object.freeze({
  civicBehaviorImplemented: false,
  status: 'synthetic-source-backed-public-profile-read-api',
});
