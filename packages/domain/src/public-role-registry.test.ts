import { describe, expect, it } from 'vitest';

import {
  assertPublicRoleRegistry,
  assertPublicRoleSubject,
  queryPublicRoleRegistry,
  type PublicRoleRegistrySnapshot,
} from './public-role-registry.js';
import { SYNTHETIC_JURISDICTION_REGISTRY } from './synthetic-jurisdiction-registry.js';
import { SYNTHETIC_PUBLIC_ROLE_REGISTRY } from './synthetic-public-role-registry.js';

const asOf = SYNTHETIC_PUBLIC_ROLE_REGISTRY.generatedAt;

function mutableSnapshot(): PublicRoleRegistrySnapshot {
  return structuredClone(SYNTHETIC_PUBLIC_ROLE_REGISTRY) as unknown as PublicRoleRegistrySnapshot;
}

describe('public-role registry', () => {
  it('keeps people, offices, terms, elections, and candidacies separate', () => {
    expect(() =>
      assertPublicRoleRegistry(SYNTHETIC_PUBLIC_ROLE_REGISTRY, SYNTHETIC_JURISDICTION_REGISTRY),
    ).not.toThrow();

    const personIds = new Set(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY.people.map(({ personId }) => personId),
    );
    const termIds = new Set(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY.officeTerms.map(({ officeTermId }) => officeTermId),
    );
    const electionIds = new Set(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY.elections.map(({ electionId }) => electionId),
    );
    const candidacyIds = new Set(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY.candidacies.map(({ candidacyId }) => candidacyId),
    );
    expect([...personIds].some((id) => termIds.has(id as never))).toBe(false);
    expect([...termIds].some((id) => electionIds.has(id as never))).toBe(false);
    expect([...electionIds].some((id) => candidacyIds.has(id as never))).toBe(false);
  });

  it('models current, former, acting, interim, appointed, elected, vacant, and historical states', () => {
    const read = queryPublicRoleRegistry(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY,
      SYNTHETIC_JURISDICTION_REGISTRY,
      { asOf, includeHistorical: true },
    );
    expect(read.officeTerms.map(({ tenureClassification }) => tenureClassification)).toEqual(
      expect.arrayContaining(['current', 'former']),
    );
    expect(read.officeTerms.map(({ serviceCapacity }) => serviceCapacity)).toEqual(
      expect.arrayContaining(['regular', 'acting', 'interim']),
    );
    expect(read.officeTerms.map(({ selectionMethod }) => selectionMethod)).toEqual(
      expect.arrayContaining(['appointed', 'elected']),
    );
    expect(
      SYNTHETIC_JURISDICTION_REGISTRY.offices.flatMap(({ versions }) =>
        versions.map(({ operationalState }) => operationalState),
      ),
    ).toContain('vacant');
    expect(read.people.map(({ recordState }) => recordState)).toContain('superseded');
  });

  it('distinguishes every required public candidacy status and never creates a term from a win', () => {
    const states = SYNTHETIC_PUBLIC_ROLE_REGISTRY.candidacies.flatMap(({ transitions }) =>
      transitions.map(({ toState }) => toState),
    );
    expect(states).toEqual(
      expect.arrayContaining([
        'declared',
        'registered',
        'qualified',
        'withdrawn',
        'disqualified',
        'active',
        'won',
        'defeated',
      ]),
    );
    const winner = SYNTHETIC_PUBLIC_ROLE_REGISTRY.candidacies.find(({ transitions }) =>
      transitions.some(({ toState }) => toState === 'won'),
    );
    expect(winner).toBeDefined();
    expect(winner).not.toHaveProperty('officeTermId');
    expect(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY.officeTerms.some(
        ({ officeId, personId }) => officeId === winner?.officeId && personId === winner.personId,
      ),
    ).toBe(false);
  });

  it('requires reviewed non-name context for merge, split, and distinct decisions', () => {
    const snapshot = mutableSnapshot();
    const [first] = snapshot.personResolutions;
    if (!first) throw new Error('Synthetic person-resolution fixture is missing.');
    const [firstEvidence] = first.evidence;
    if (!firstEvidence) throw new Error('Synthetic resolution evidence is missing.');
    const invalid = {
      ...snapshot,
      personResolutions: [
        {
          ...first,
          evidence: [firstEvidence, { ...firstEvidence, evidenceId: 'name-only:2' }],
        },
        ...snapshot.personResolutions.slice(1),
      ],
    } as PublicRoleRegistrySnapshot;
    expect(() => assertPublicRoleRegistry(invalid, SYNTHETIC_JURISDICTION_REGISTRY)).toThrow(
      /name-only context/,
    );
  });

  it('rejects illegal or discontinuous lifecycle transitions', () => {
    const snapshot = mutableSnapshot();
    const [first, ...remaining] = snapshot.officeTerms;
    if (!first) throw new Error('Synthetic office-term fixture is missing.');
    const [pending, active] = first.transitions;
    if (!pending || !active) throw new Error('Synthetic term lifecycle fixture is incomplete.');
    const invalid = {
      ...snapshot,
      officeTerms: [
        {
          ...first,
          transitions: [pending, { ...active, fromState: 'cancelled', toState: 'active' }],
        },
        ...remaining,
      ],
    } as PublicRoleRegistrySnapshot;
    expect(() => assertPublicRoleRegistry(invalid, SYNTHETIC_JURISDICTION_REGISTRY)).toThrow(
      /discontinuous lifecycle history/,
    );
  });

  it('rejects cross-country civic context', () => {
    const snapshot = mutableSnapshot();
    const [first, ...remaining] = snapshot.officeTerms;
    const invalid = {
      ...snapshot,
      officeTerms: [{ ...first, officeId: 'office:us:state-senator' }, ...remaining],
    } as PublicRoleRegistrySnapshot;
    expect(() => assertPublicRoleRegistry(invalid, SYNTHETIC_JURISDICTION_REGISTRY)).toThrow(
      /cross-country civic structure/,
    );
  });

  it('publishes an allowlisted read model without reviewer identity or private notes', () => {
    const read = queryPublicRoleRegistry(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY,
      SYNTHETIC_JURISDICTION_REGISTRY,
      { asOf, includeHistorical: true },
    );
    const publicJson = JSON.stringify(read);
    expect(publicJson).not.toMatch(/actorReference|privateNotes|Synthetic internal/);
    expect(publicJson).not.toMatch(/accountId|preciseLocation|identityEvidence|moderatorNotes/i);
    expect(read.externalIdentityReferences).toEqual([]);
    expect(read.deferredFamilies).toContain('identity_proof');
    expect(read.deferredFamilies).toContain('representative_scoring');
  });

  it('returns relational projections without treating election results as terms', () => {
    const winner = SYNTHETIC_PUBLIC_ROLE_REGISTRY.candidacies.find(({ transitions }) =>
      transitions.some(({ toState }) => toState === 'won'),
    );
    if (!winner) throw new Error('Synthetic winning candidacy fixture is missing.');
    const read = queryPublicRoleRegistry(
      SYNTHETIC_PUBLIC_ROLE_REGISTRY,
      SYNTHETIC_JURISDICTION_REGISTRY,
      {
        asOf,
        selection: { id: winner.candidacyId, kind: 'candidacy' },
      },
    );
    expect(read.candidacies).toHaveLength(1);
    expect(read.elections).toHaveLength(1);
    expect(read.people.map(({ personId }) => personId)).toContain(winner.personId);
    expect(read.officeTerms).toEqual([]);
  });

  it('requires future public conduct to target a term or candidacy', () => {
    expect(() =>
      assertPublicRoleSubject({
        kind: 'office_term',
        officeTermId: 'term:synthetic:future-attachment' as never,
      }),
    ).not.toThrow();
    expect(() => assertPublicRoleSubject({ kind: 'candidacy', candidacyId: '' as never })).toThrow(
      /stable opaque identifier/,
    );
  });
});
