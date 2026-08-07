export * from './audit-outbox.js';
export * from './jurisdiction-registry.js';
export * from './public-role-registry.js';
export * from './synthetic-jurisdiction-registry.js';
export * from './synthetic-public-role-registry.js';

export const domainFoundation = Object.freeze({
  civicBehaviorImplemented: false,
  status: 'synthetic-public-role-registry',
});
