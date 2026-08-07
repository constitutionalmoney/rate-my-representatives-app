export * from './pipeline.js';
export * from './security.js';
export * from './synthetic-pilots.js';

export const connectorFoundation = Object.freeze({
  candidatePublication: 'human-review-only',
  dataMode: 'synthetic',
  implementationIssue: 55,
  sourceIngestionImplemented: true,
  status: 'candidate-pipeline-ready',
  verusRequired: false,
});
