import type { PublicRoleProfileList } from '@rmr/contracts';

export type DiscoveryCountry = 'CA' | 'US';
export type RepresentativeIntent = 'support' | 'concern';
export type RepresentativeCard = PublicRoleProfileList['items'][number];

export interface RepresentativeDeckState {
  readonly country: DiscoveryCountry;
  readonly currentIndex: number;
  readonly intent: RepresentativeIntent | null;
  readonly items: readonly RepresentativeCard[];
}

export type DeckGesture = RepresentativeIntent | 'skip' | null;

export const DISCOVERY_COUNTRY_LABELS = Object.freeze({
  CA: 'Canada',
  US: 'United States',
} satisfies Record<DiscoveryCountry, string>);

export const DISCOVERY_PRIVACY_BOUNDARY = Object.freeze({
  analyticsFields: ['deck_load_latency', 'deck_error', 'accessibility_error', 'deck_completion'],
  cardChoiceAnalyticsAllowed: false,
  compositeScoreEnabled: false,
  preciseLocationAccepted: false,
  representativeSignalWritesEnabled: false,
  sessionReplayAllowed: false,
});

export function createRepresentativeDeck(
  list: PublicRoleProfileList,
  country: DiscoveryCountry,
): RepresentativeDeckState {
  const items = list.items.filter((item) => item.countryCode === country).slice(0, list.page.limit);
  return Object.freeze({
    country,
    currentIndex: 0,
    intent: null,
    items: Object.freeze(items),
  });
}

export function currentRepresentativeCard(
  deck: RepresentativeDeckState,
): RepresentativeCard | null {
  return deck.items[deck.currentIndex] ?? null;
}

export function selectRepresentativeIntent(
  deck: RepresentativeDeckState,
  intent: RepresentativeIntent,
): RepresentativeDeckState {
  if (currentRepresentativeCard(deck) === null) return deck;
  return Object.freeze({ ...deck, intent });
}

export function cancelRepresentativeIntent(deck: RepresentativeDeckState): RepresentativeDeckState {
  if (deck.intent === null) return deck;
  return Object.freeze({ ...deck, intent: null });
}

function advance(deck: RepresentativeDeckState): RepresentativeDeckState {
  return Object.freeze({
    ...deck,
    currentIndex: Math.min(deck.currentIndex + 1, deck.items.length),
    intent: null,
  });
}

/** Advances without retaining an action, identifier, event, or aggregate input. */
export function skipRepresentative(deck: RepresentativeDeckState): RepresentativeDeckState {
  return advance(deck);
}

/** Clears an unsubmitted preview and advances without creating a representative signal. */
export function continueWithoutRepresentativeSignal(
  deck: RepresentativeDeckState,
): RepresentativeDeckState {
  return advance(deck);
}

export function restartRepresentativeDeck(deck: RepresentativeDeckState): RepresentativeDeckState {
  return Object.freeze({ ...deck, currentIndex: 0, intent: null });
}

export function classifyDeckGesture(input: {
  readonly deltaX: number;
  readonly deltaY: number;
  readonly enabled: boolean;
  readonly threshold?: number;
}): DeckGesture {
  if (!input.enabled) return null;
  const threshold = input.threshold ?? 80;
  const horizontal = Math.abs(input.deltaX);
  const vertical = Math.abs(input.deltaY);
  if (horizontal < threshold && vertical < threshold) return null;
  if (vertical > horizontal) return input.deltaY < -threshold ? 'skip' : null;
  if (input.deltaX > threshold) return 'support';
  if (input.deltaX < -threshold) return 'concern';
  return null;
}

export function representativeCardAccessibilityLabel(
  card: RepresentativeCard,
  position: number,
  total: number,
): string {
  const context = card.context.kind === 'office_term' ? 'office term' : 'candidacy';
  const district = card.districtLabel ?? 'district not available';
  return [
    `Card ${position} of ${total}.`,
    card.displayName,
    `${card.officeTitle}, ${district}.`,
    `${card.governmentLevel} ${context}, status ${card.roleStatus}.`,
    `Source coverage ${card.availability}; record updated ${card.updatedAt}.`,
    'Available actions are Support preview, Concern preview, Skip, and Open sourced record.',
  ].join(' ');
}

export function representativeInitials(displayName: string): string {
  const initials = displayName
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || 'RMR';
}
