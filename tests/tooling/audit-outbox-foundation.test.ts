import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

describe('issue #19 audit and transactional outbox foundation', () => {
  it('uses one PostgreSQL command boundary for state, audit, and outbox', async () => {
    const migration = await read('packages/db/migrations/0002_audit_outbox_foundation.sql');
    const commandFunction = migration.slice(
      migration.indexOf('CREATE OR REPLACE FUNCTION rmr.record_synthetic_command'),
      migration.indexOf('CREATE VIEW rmr_audit.participant_action_history'),
    );
    expect(commandFunction).toContain('INSERT INTO rmr.synthetic_command_state');
    expect(commandFunction).toContain('INSERT INTO rmr_audit.event');
    expect(commandFunction).toContain('INSERT INTO rmr_outbox.event');
  });

  it('makes audit immutable and uses safe concurrent outbox leasing', async () => {
    const migration = await read('packages/db/migrations/0002_audit_outbox_foundation.sql');
    expect(migration).toContain('BEFORE UPDATE OR DELETE ON rmr_audit.event');
    expect(migration).toContain('BEFORE TRUNCATE ON rmr_audit.event');
    expect(migration).toMatch(/FOR UPDATE(?: OF queued)? SKIP LOCKED/);
    expect(migration).toContain("state IN ('pending', 'leased', 'delivered', 'dead_letter')");
  });

  it('separates participant, moderation, security, provenance, and worker access', async () => {
    const migration = await read('packages/db/migrations/0002_audit_outbox_foundation.sql');
    for (const role of [
      'rmr_participant_audit_reader',
      'rmr_moderation_audit_reader',
      'rmr_security_audit_reader',
      'rmr_public_provenance_reader',
      'rmr_outbox_worker',
    ]) {
      expect(migration).toContain(role);
    }
    expect(migration).toContain("action NOT LIKE 'representative_signal.%'");
  });

  it('keeps provenance as an inert downstream request and does not call Verus', async () => {
    const files = await Promise.all([
      read('packages/db/migrations/0002_audit_outbox_foundation.sql'),
      read('packages/db/src/audit-outbox.ts'),
    ]);
    const implementation = files.join('\n');
    expect(implementation).toContain('provenance.anchor.requested');
    expect(implementation).not.toMatch(/verus\s+-chain|verus\.exe|sendcurrency|getidentity/i);
  });
});
