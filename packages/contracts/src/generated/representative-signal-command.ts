/* Generated from representative-signal-command.schema.json. Do not edit directly. */

/**
 * Disabled future human-intent command contract. No API operation accepts it in issue #60.
 */
export interface RepresentativeSignalCommand {
  schemaVersion: 'representative-signal-command.v1';
  kind: 'representative_signal_command';
  officeTermId: string;
  judgment: 'support' | 'concern';
  confirmation: 'human-confirmed';
}
