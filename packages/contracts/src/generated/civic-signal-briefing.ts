/* Generated from civic-signal-briefing.schema.json. Do not edit directly. */

/**
 * Proposed monitoring/briefing envelope. It contains no human judgment operation.
 */
export interface CivicSignalBriefing {
  schemaVersion: 'civic-signal-briefing.v1';
  kind: 'civic_signal_briefing';
  briefingId: string;
  generatedAt: string;
  status: 'proposed';
}
