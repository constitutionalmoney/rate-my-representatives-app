import { describe, expect, it } from 'vitest';

import { createContractMockFetch, createWebClient, readPublicProfiles } from '@rmr/contracts';

import {
  cancelRepresentativeIntent,
  classifyDeckGesture,
  continueWithoutRepresentativeSignal,
  createRepresentativeDeck,
  currentRepresentativeCard,
  representativeCardAccessibilityLabel,
  selectRepresentativeIntent,
  skipRepresentative,
} from './deck.js';

describe('finite representative discovery deck', () => {
  it('preserves API order and keeps person, office term, and candidacy context distinct', async () => {
    const list = await readPublicProfiles(
      createWebClient('http://127.0.0.1:3000', createContractMockFetch()),
      { countryCode: 'CA' },
    );
    const deck = createRepresentativeDeck(list, 'CA');
    expect(deck.items.map(({ profileId }) => profileId)).toEqual(
      list.items.map(({ profileId }) => profileId),
    );
    expect(currentRepresentativeCard(deck)).toMatchObject({
      personId: 'person:ca:avery-quill',
      context: { kind: 'office_term', candidacyId: null },
    });
  });

  it('never retains skip or an abandoned intended action as a signal-domain value', async () => {
    const list = await readPublicProfiles(
      createWebClient('http://127.0.0.1:3000', createContractMockFetch()),
      { countryCode: 'CA' },
    );
    const selected = selectRepresentativeIntent(createRepresentativeDeck(list, 'CA'), 'support');
    expect(selected.intent).toBe('support');
    expect(cancelRepresentativeIntent(selected).intent).toBeNull();
    const continued = continueWithoutRepresentativeSignal(selected);
    expect(continued.intent).toBeNull();
    expect(continued.currentIndex).toBe(1);
    expect(JSON.stringify(continued)).not.toMatch(/skip|support|concern|signal/i);

    const skipped = skipRepresentative(createRepresentativeDeck(list, 'CA'));
    expect(skipped.currentIndex).toBe(1);
    expect(JSON.stringify(skipped)).not.toMatch(/skip|support|concern|signal/i);
  });

  it('treats gestures as optional shortcuts with a visible-control accessibility label', async () => {
    expect(classifyDeckGesture({ deltaX: 100, deltaY: 5, enabled: true })).toBe('support');
    expect(classifyDeckGesture({ deltaX: -100, deltaY: 5, enabled: true })).toBe('concern');
    expect(classifyDeckGesture({ deltaX: 0, deltaY: -100, enabled: true })).toBe('skip');
    expect(classifyDeckGesture({ deltaX: 100, deltaY: 5, enabled: false })).toBeNull();
    expect(classifyDeckGesture({ deltaX: 20, deltaY: 10, enabled: true })).toBeNull();

    const list = await readPublicProfiles(
      createWebClient('http://127.0.0.1:3000', createContractMockFetch()),
      { countryCode: 'CA' },
    );
    const card = createRepresentativeDeck(list, 'CA').items[0];
    if (card === undefined) throw new Error('Expected a synthetic discovery card.');
    expect(representativeCardAccessibilityLabel(card, 1, 1)).toContain(
      'Support preview, Concern preview, Skip, and Open sourced record',
    );
  });
});
