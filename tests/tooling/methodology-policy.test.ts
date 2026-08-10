import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), 'utf8');

const websiteFactors = [
  'Identity and office integrity',
  'Voting and policy records',
  'Promises and stated-position alignment',
  'Attendance and public-duty performance',
  'Spending and financial accountability',
  'Integrity, ethics, and conflicts',
  'Transparency and responsiveness',
  'Outcomes, corrections, and follow-through',
  'Community input',
  'Evidence quality and confidence',
] as const;

const betaCategories = [
  'Policy and voting alignment',
  'Integrity and accountability',
  'Financial influence and disclosure',
  'Constituent engagement',
  'Performance and effectiveness',
  'Verified civic sentiment',
  'Verification and source coverage',
] as const;

const releaseGates = [
  'publicMethodologyReview',
  'sourceAndFactorAudit',
  'biasAndDisparateImpactReview',
  'adversarialAndManipulationTesting',
  'stabilityAndSmallDataTesting',
  'correctionAndSupersessionTesting',
  'privacyAndNoSocialCreditReview',
  'legalReview',
  'representativeResponseAndAppealBehavior',
  'publicConsultation',
  'reservedGovernanceApproval',
] as const;

describe('issue #4 Light Mathematics methodology policy', () => {
  it('publishes one explicit website, preview, and beta taxonomy crosswalk', async () => {
    const document = await read('docs/METHODOLOGY.md');

    for (const factor of websiteFactors) expect(document, factor).toContain(factor);
    for (const category of betaCategories) expect(document, category).toContain(category);
    for (let index = 1; index <= 10; index += 1) {
      const id = `W${String(index).padStart(2, '0')}`;
      expect(document.match(new RegExp(`\\| ${id} \\|`, 'g')), id).toHaveLength(1);
    }

    expect(document).toContain('current illustrative phone preview consolidates');
    expect(document).toContain('The other website families were not silently deleted');
    expect(document).toContain('display taxonomy, not seven values to average');
  });

  it('separates records, coverage, human input, AI, and due process', async () => {
    const document = await read('docs/METHODOLOGY.md');

    for (const layer of [
      'Evidence-derived record indicators',
      'Coverage and freshness',
      'Authenticated representative-signal aggregate',
      'Unverified participation',
      'Anonymous public input',
      'Category-rating aggregate',
      'Community context',
      'AI-assisted analysis',
      'Response, dispute, correction, appeal',
    ]) {
      expect(document, layer).toContain(layer);
    }

    expect(document).toContain('These populations are never silently combined');
    expect(document).toContain('Identity status affects attribution');
    expect(document).toContain('it does not make a claim true');
    expect(document).toContain('Generative model confidence is not methodology confidence');
  });

  it('requires complete method, source, coverage, confidence, time, and correction metadata', async () => {
    const schema = JSON.parse(
      await read('packages/contracts/schemas/methodology-indicator-result.schema.json'),
    ) as {
      required: string[];
      properties: Record<string, { const?: unknown }>;
      $defs: Record<string, { required?: string[]; properties?: Record<string, unknown> }>;
    };

    expect(schema.required).toEqual(
      expect.arrayContaining([
        'method',
        'sourceSet',
        'coverage',
        'freshness',
        'missingData',
        'confidence',
        'ai',
        'correction',
        'calculatedAt',
        'provenance',
      ]),
    );
    expect(schema.$defs.method.required).toEqual(
      expect.arrayContaining(['version', 'specificationSha256', 'codeRevision', 'approvalState']),
    );
    expect(schema.$defs.sourceSet.required).toEqual(
      expect.arrayContaining(['sourceIds', 'recordVersionIds', 'digest', 'inputCutoffAt']),
    );
    expect(schema.$defs.correction.required).toEqual(
      expect.arrayContaining(['state', 'supersedesResultId']),
    );
    expect(schema.properties.participationIncluded?.const).toBe(false);
  });

  it('makes missing data non-adverse and keeps examples synthetic and reproducible', async () => {
    const [document, fixtureText] = await Promise.all([
      read('docs/METHODOLOGY.md'),
      read('packages/contracts/fixtures/methodology-indicator.synthetic.json'),
    ]);
    const fixture = JSON.parse(fixtureText) as {
      dataMode: string;
      result: { value: number; calculationInputs: { name: string; value: number }[] };
      coverage: { percentage: number };
      missingData: { treatment: string };
      publicationState: string;
    };
    const inputs = Object.fromEntries(
      fixture.result.calculationInputs.map((input) => [input.name, input.value]),
    );

    expect(document).toContain('Missing data is not zero, failure, opposition, misconduct');
    expect(document).toContain('the indicator is `unavailable`');
    expect(document).toContain('its value is `null`');
    expect(fixture).toMatchObject({
      dataMode: 'synthetic',
      coverage: { percentage: 100 },
      missingData: { treatment: 'no_adverse_inference' },
      publicationState: 'test_only',
    });
    expect((100 * (inputs.published_within_threshold ?? 0)) / (inputs.eligible_events ?? 1)).toBe(
      fixture.result.value,
    );
  });

  it('makes all eleven composite prerequisites machine-enforceable and false by default', async () => {
    const [schemaText, fixtureText, envExample, featureSchemaText, methodologySource] =
      await Promise.all([
        read('packages/contracts/schemas/methodology-release-gate.schema.json'),
        read('packages/contracts/fixtures/methodology-release-gate.synthetic.json'),
        read('.env.example'),
        read('packages/contracts/schemas/feature-gates.schema.json'),
        read('packages/methodology/src/index.ts'),
      ]);
    const schema = JSON.parse(schemaText) as {
      $defs: { gates: { required: string[] } };
    };
    const fixture = JSON.parse(fixtureText) as {
      runtimeFlagEnabled: boolean;
      approvedMethodologyVersion: string | null;
      gates: Record<string, { status: string }>;
      decision: string;
    };
    const featureSchema = JSON.parse(featureSchemaText) as {
      properties: Record<string, { default?: boolean }>;
    };

    expect(schema.$defs.gates.required).toEqual(releaseGates);
    expect(Object.keys(fixture.gates)).toEqual(releaseGates);
    expect(Object.values(fixture.gates).every((gate) => gate.status === 'pending')).toBe(true);
    expect(fixture).toMatchObject({
      runtimeFlagEnabled: false,
      approvedMethodologyVersion: null,
      decision: 'disabled',
    });
    expect(envExample).toContain('COMPOSITE_SCORE_ENABLED=false');
    expect(featureSchema.properties.COMPOSITE_SCORE_ENABLED?.default).toBe(false);
    expect(methodologySource).toContain('compositeScoreEnabled: false');
    expect(methodologySource).toContain('evaluateCompositeReleaseGate');
  });

  it('defines public versioning, supersession, rollback, changelog, and provenance limits', async () => {
    const document = await read('docs/METHODOLOGY.md');

    for (const phrase of [
      'Method specifications and result versions are immutable',
      'machine-readable diff',
      'Public change log',
      'Rollback disables the affected version',
      'supersedesResultId',
      'commitment_not_truth',
      'It cannot prove that the sources were complete',
    ]) {
      expect(document, phrase).toContain(phrase);
    }
    expect(document).toMatch(/valid governance\s+outcome is to never publish/);
  });

  it('links the accepted ADR and canonical policy without claiming execution', async () => {
    const [adr, readme, architecture, roadmap, dataModel, alignment] = await Promise.all([
      read('docs/adr/0015-light-mathematics-policy-and-composite-gate.md'),
      read('README.md'),
      read('docs/ARCHITECTURE.md'),
      read('docs/ROADMAP.md'),
      read('docs/DATA_MODEL.md'),
      read('docs/WEBSITE_ALIGNMENT.md'),
    ]);

    expect(adr).toContain('**Status:** Accepted');
    expect(adr).toContain('Issue #4 adds policy, generated contract shapes, synthetic fixtures');
    for (const source of [readme, architecture, roadmap, dataModel, alignment]) {
      expect(source).toContain('METHODOLOGY.md');
    }
    expect(dataModel).toContain('methodology_version`, `indicator_result`');
    expect(dataModel).toContain('remain **Planned**');
  });
});
