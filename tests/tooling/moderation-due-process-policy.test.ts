import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

const workflows = [
  'Evidence submission',
  'Representative response',
  'Correction request',
  'Dispute',
  'Appeal',
  'Community-context moderation',
  'Source retraction or loss',
] as const;

const submitterClasses = [
  'Representative or candidate',
  'Authorized staff',
  'Journalist',
  'Researcher',
  'Basic account',
  'Verified participant',
  'Organization',
  'Public contributor without an account',
] as const;

describe('issue #5 moderation and due-process policy', () => {
  it('defines every required state and seven separately connected workflows', async () => {
    const document = await read('docs/MODERATION_AND_DUE_PROCESS.md');

    for (const workflow of workflows) expect(document, workflow).toContain(workflow);
    for (const state of [
      'draft',
      'submitted',
      'validated',
      'under_review',
      'published',
      'disputed',
      'rejected',
      'needs_more_information',
      'corrected',
      'withdrawn',
      'archived',
      'appealed',
      'appeal_upheld',
      'appeal_denied',
      'missing',
    ]) {
      expect(document, state).toContain(state);
    }

    expect(document).toContain('There are no implicit, scheduled, or wildcard transitions.');
    expect(document).toContain('No elapsed time');
    expect(document).toContain('can cause publication');
    expect(document).toContain('validation never auto-rejects');
    expect(document).toContain('Queue age');
    expect(document).toContain('never publishes, rejects, archives, or upholds a record.');
  });

  it('keeps evidence eligibility independent from identity, signals, ratings, and truth', async () => {
    const document = await read('docs/MODERATION_AND_DUE_PROCESS.md');

    for (const submitterClass of submitterClasses) {
      expect(document, submitterClass).toContain(submitterClass);
    }
    expect(document).toContain(
      'Evidence eligibility is evaluated independently from representative-signal and',
    );
    expect(document).toContain('Verified-human status is not a universal');
    expect(document).toContain('identity tier,');
    expect(document).toContain('none proves that a claim is true');
  });

  it('requires human reasoned decisions, conflicts, recusal, and independent appeals', async () => {
    const [document, schemaText] = await Promise.all([
      read('docs/MODERATION_AND_DUE_PROCESS.md'),
      read('packages/contracts/schemas/moderation-decision.schema.json'),
    ]);
    const schema = JSON.parse(schemaText) as {
      required: string[];
      $defs: {
        review: { required: string[]; properties: Record<string, { const?: unknown }> };
        basis: { required: string[] };
      };
    };

    expect(schema.required).toEqual(
      expect.arrayContaining(['policyVersion', 'review', 'basis', 'history', 'publication']),
    );
    expect(schema.$defs.review.required).toEqual(
      expect.arrayContaining([
        'reviewerRole',
        'assignmentReference',
        'conflictDisclosure',
        'recusalOutcome',
        'independentOfOriginalDecision',
        'humanDecider',
      ]),
    );
    expect(schema.$defs.review.properties.humanDecider?.const).toBe(true);
    expect(schema.$defs.basis.required).toEqual(
      expect.arrayContaining([
        'methodVersion',
        'sourceRecordVersionIds',
        'rightsReview',
        'reasonCode',
        'publicReason',
      ]),
    );
    expect(document).toContain('A conflicted reviewer cannot decide the matter.');
    expect(document).toContain('Appeal reviewers cannot be the original decider.');
    expect(document).toContain('append');
    expect(document).toContain('never replace, the original decision');
  });

  it('preserves response, correction, withdrawal, archive, and supersession history', async () => {
    const document = await read('docs/MODERATION_AND_DUE_PROCESS.md');

    for (const phrase of [
      'Representatives, candidates, and authorized staff have routes',
      'Correction',
      'Withdrawal',
      'Archival',
      'Silent permanent erasure is prohibited',
      'link the original and replacement versions',
      'supersedes',
    ]) {
      expect(document, phrase).toContain(phrase);
    }
    expect(document).toContain('Emergency restriction');
    expect(document).toContain('confirm,');
    expect(document).toContain('modify, or lift');
  });

  it('blocks a pilot on safe retrieval, upload controls, staffing, escalation, and legal review', async () => {
    const document = await read('docs/MODERATION_AND_DUE_PROCESS.md');

    for (const phrase of [
      'SSRF-safe connector boundary',
      'Arbitrary file uploads remain disabled',
      'malware scanning',
      'Doxxing, credible threats',
      'coordinated submissions',
      'legal-review route',
      'A pilot is blocked until staffing capacity',
      'service **targets**, not automatic state transitions',
    ]) {
      expect(document, phrase).toContain(phrase);
    }
  });

  it('keeps private review material out of public projection and provenance', async () => {
    const [document, fixtureText] = await Promise.all([
      read('docs/MODERATION_AND_DUE_PROCESS.md'),
      read('packages/contracts/fixtures/moderation-decision.synthetic.json'),
    ]);
    const fixture = JSON.parse(fixtureText) as {
      dataMode: string;
      publication: {
        automaticPublication: boolean;
        allowedPublicFields: string[];
        rawPrivateMaterialIncluded: boolean;
        provenanceEligible: boolean;
      };
    };

    expect(fixture).toMatchObject({
      dataMode: 'synthetic',
      publication: {
        automaticPublication: false,
        allowedPublicFields: [],
        rawPrivateMaterialIncluded: false,
        provenanceEligible: false,
      },
    });
    for (const excluded of [
      'Raw submissions',
      'private identity evidence',
      'reviewer identity',
      'review notes',
      'quarantine contents',
      'legal communications',
    ]) {
      expect(document, excluded).toContain(excluded);
    }
    expect(document).toContain('does not prove truth, completeness, fairness');
  });

  it('keeps every high-risk runtime path false and links the accepted policy baseline', async () => {
    const [
      envExample,
      moderationSource,
      readme,
      architecture,
      roadmap,
      dataModel,
      sourcePolicy,
      adr,
    ] = await Promise.all([
      read('.env.example'),
      read('packages/moderation/src/index.ts'),
      read('README.md'),
      read('docs/ARCHITECTURE.md'),
      read('docs/ROADMAP.md'),
      read('docs/DATA_MODEL.md'),
      read('docs/SOURCE_INGESTION.md'),
      read('docs/adr/0016-moderation-and-due-process-policy.md'),
    ]);

    for (const flag of [
      'PRIVILEGED_ACCESS_ENABLED=false',
      'COMMUNITY_CONTEXT_ENABLED=false',
      'EVIDENCE_SUBMISSION_ENABLED=false',
      'AI_RESEARCH_ENABLED=false',
      'PROVENANCE_WRITES_ENABLED=false',
      'VERUS_ANCHORING_ENABLED=false',
    ]) {
      expect(envExample, flag).toContain(flag);
    }
    expect(moderationSource).toContain('automaticPublicationAllowed: false');
    expect(moderationSource).toContain('evidenceWorkflowImplemented: false');
    expect(moderationSource).toContain('provenanceWritesEnabled: false');
    for (const source of [readme, architecture, roadmap, dataModel, sourcePolicy]) {
      expect(source).toContain('MODERATION_AND_DUE_PROCESS.md');
    }
    expect(adr).toContain('**Status:** Accepted');
    expect(adr).toContain('Issue #5 adds no evidence upload');
  });
});
