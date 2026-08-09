import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementRef,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  findNodeHandle,
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import type { PublicRoleProfile } from '@rmr/contracts';
import {
  DISCOVERY_COUNTRY_LABELS,
  cancelRepresentativeIntent,
  classifyDeckGesture,
  continueWithoutRepresentativeSignal,
  createPublicDiscoveryRepository,
  createRepresentativeDeck,
  currentRepresentativeCard,
  representativeCardAccessibilityLabel,
  representativeInitials,
  selectRepresentativeIntent,
  skipRepresentative,
  type DiscoveryCountry,
  type DiscoveryRead,
  type RepresentativeCard,
  type RepresentativeDeckState,
  type RepresentativeIntent,
} from '@rmr/discovery';
import { mobileFoundationTokens } from '@rmr/mobile-ui';

import { readMobilePublicProfile, readMobilePublicProfiles } from './api';
import { mobilePublicDiscoveryCache } from './public-cache';

type LoadingState = 'deck' | 'profile' | null;
type RetryState =
  | Readonly<{ country: DiscoveryCountry; kind: 'deck' }>
  | Readonly<{ kind: 'profile'; profileId: string }>
  | null;
type NativeText = ElementRef<typeof Text>;

export type DiscoveryScreenProps = Readonly<{
  apiOrigin: string;
  initialCountry?: DiscoveryCountry | null;
  onProfileRequestHandled: () => void;
  requestedProfileId: string | null;
}>;

function titleCase(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null): string {
  if (value === null) return 'Not available';
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' }).format(parsed)
    : 'Invalid source date';
}

function cacheNotice(cachedAt: string | null): string | null {
  return cachedAt === null
    ? null
    : `Offline public copy saved ${formatDate(cachedAt)}. Choices remain local and unsaved.`;
}

function ActionButton(
  props: Readonly<{
    label: string;
    onPress: () => void;
    tone?: 'primary' | 'secondary' | 'support' | 'concern';
  }>,
) {
  const tone = props.tone ?? 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [styles.action, styles[`action_${tone}`], pressed && styles.pressed]}
    >
      <Text allowFontScaling maxFontSizeMultiplier={2.4} style={styles.actionText}>
        {props.label}
      </Text>
    </Pressable>
  );
}

function PageHeading(
  props: Readonly<{ children: string; focusRef?: RefObject<NativeText | null> }>,
) {
  return (
    <Text
      accessibilityRole="header"
      allowFontScaling
      maxFontSizeMultiplier={2.4}
      ref={props.focusRef}
      style={styles.heading}
    >
      {props.children}
    </Text>
  );
}

function CountryPicker(props: Readonly<{ onSelect: (country: DiscoveryCountry) => void }>) {
  return (
    <View style={styles.panel}>
      <Text allowFontScaling style={styles.kicker}>
        READ-ONLY PUBLIC DISCOVERY
      </Text>
      <PageHeading>Choose a country, not an address.</PageHeading>
      <Text allowFontScaling style={styles.body}>
        This synthetic pilot uses country-only filters. It does not request precise location, infer
        a jurisdiction, rank people, or build a political profile.
      </Text>
      <ActionButton label="Browse Canada" onPress={() => props.onSelect('CA')} tone="primary" />
      <ActionButton label="Browse United States" onPress={() => props.onSelect('US')} />
      <Text allowFontScaling style={styles.notice}>
        Reviewed source coverage is incomplete. A missing card is a coverage gap, not misconduct.
      </Text>
    </View>
  );
}

function CardFact(props: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.fact}>
      <Text allowFontScaling style={styles.factLabel}>
        {props.label}
      </Text>
      <Text allowFontScaling selectable style={styles.factValue}>
        {props.value}
      </Text>
    </View>
  );
}

function RepresentativeCardPanel(
  props: Readonly<{
    card: RepresentativeCard;
    gesturesEnabled: boolean;
    onConcern: () => void;
    onOpenRecord: () => void;
    onSkip: () => void;
    onSupport: () => void;
    position: number;
    setGesturesEnabled: (enabled: boolean) => void;
    total: number;
  }>,
) {
  const headingRef = useRef<NativeText>(null);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          props.gesturesEnabled && Math.max(Math.abs(gesture.dx), Math.abs(gesture.dy)) > 12,
        onPanResponderRelease: (_event, gesture) => {
          const action = classifyDeckGesture({
            deltaX: gesture.dx,
            deltaY: gesture.dy,
            enabled: props.gesturesEnabled,
          });
          if (action === 'support') props.onSupport();
          if (action === 'concern') props.onConcern();
          if (action === 'skip') props.onSkip();
        },
      }),
    [props.gesturesEnabled, props.onConcern, props.onSkip, props.onSupport],
  );

  useEffect(() => {
    const node = findNodeHandle(headingRef.current);
    if (node !== null) AccessibilityInfo.setAccessibilityFocus(node);
  }, [props.card.profileId]);

  return (
    <View style={styles.stack}>
      <View style={styles.deckIntro}>
        <Text allowFontScaling style={styles.kicker}>
          {DISCOVERY_COUNTRY_LABELS[props.card.countryCode].toUpperCase()} · FINITE DECK
        </Text>
        <PageHeading focusRef={headingRef}>
          Meet the public role, then inspect the record.
        </PageHeading>
        <Text allowFontScaling style={styles.body}>
          Previewing support or concern never submits a signal. Skip is navigation only.
        </Text>
      </View>
      <View
        accessibilityLabel={representativeCardAccessibilityLabel(
          props.card,
          props.position,
          props.total,
        )}
        style={styles.profileCard}
        {...panResponder.panHandlers}
      >
        <View style={styles.rowBetween}>
          <Text allowFontScaling style={styles.progress}>
            Card {props.position} of {props.total}
          </Text>
          <Text allowFontScaling style={styles.coverageBadge}>
            {titleCase(props.card.availability)} coverage
          </Text>
        </View>
        <View style={styles.identityRow}>
          <View
            accessibilityLabel={`Approved image not available for ${props.card.displayName}; initials placeholder shown.`}
            accessible
            style={styles.avatar}
          >
            <Text allowFontScaling style={styles.avatarText}>
              {representativeInitials(props.card.displayName)}
            </Text>
          </View>
          <View style={styles.identityText}>
            <Text allowFontScaling style={styles.kicker}>
              {titleCase(props.card.governmentLevel)} · {titleCase(props.card.context.kind)}
            </Text>
            <Text accessibilityRole="header" allowFontScaling style={styles.name}>
              {props.card.displayName}
            </Text>
            <Text allowFontScaling style={styles.status}>
              {titleCase(props.card.roleStatus)}
            </Text>
          </View>
        </View>
        <View style={styles.factGrid}>
          <CardFact label="Person" value={props.card.displayName} />
          <CardFact label="Office" value={props.card.officeTitle} />
          <CardFact
            label="District"
            value={props.card.districtLabel ?? 'Not available in reviewed sources'}
          />
          <CardFact
            label={props.card.context.kind === 'office_term' ? 'Office term' : 'Candidacy'}
            value={
              props.card.context.officeTermId ?? props.card.context.candidacyId ?? 'Not available'
            }
          />
          <CardFact label="Approved image" value="Not available" />
          <CardFact label="Party / affiliation" value="Not available in reviewed sources" />
          <CardFact
            label="Record freshness"
            value={`Updated ${formatDate(props.card.updatedAt)}`}
          />
        </View>
        <View style={styles.gestureRow}>
          <View style={styles.gestureText}>
            <Text allowFontScaling style={styles.factLabel}>
              Swipe shortcuts
            </Text>
            <Text allowFontScaling style={styles.notice}>
              Optional. Every action has a visible button.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Enable swipe shortcuts"
            onValueChange={props.setGesturesEnabled}
            value={props.gesturesEnabled}
          />
        </View>
        <Text allowFontScaling style={styles.previewNote}>
          Support and Concern open an unsubmitted local preview. Confirmation is unavailable until
          issue #37 is implemented.
        </Text>
        <View style={styles.actions}>
          <ActionButton label="Support preview" onPress={props.onSupport} tone="support" />
          <ActionButton label="Concern preview" onPress={props.onConcern} tone="concern" />
          <ActionButton label="Skip — no judgment" onPress={props.onSkip} />
          <ActionButton label="Open sourced record" onPress={props.onOpenRecord} tone="primary" />
        </View>
      </View>
    </View>
  );
}

function IntentPreview(
  props: Readonly<{
    card: RepresentativeCard;
    intent: RepresentativeIntent;
    onCancel: () => void;
    onContinue: () => void;
  }>,
) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.panel}>
      <Text allowFontScaling style={styles.kicker}>
        UNSUBMITTED LOCAL PREVIEW
      </Text>
      <PageHeading>{`${titleCase(props.intent)} · ${props.card.displayName}`}</PageHeading>
      <CardFact label="Office" value={props.card.officeTitle} />
      <CardFact label="District" value={props.card.districtLabel ?? 'Not available'} />
      <View style={styles.noWrite}>
        <Text allowFontScaling style={styles.noWriteTitle}>
          Nothing has been submitted.
        </Text>
        <Text allowFontScaling style={styles.body}>
          This preview exists only in memory. There is no confirmation command, account lookup,
          analytics event, aggregate input, or signal-domain write.
        </Text>
      </View>
      <ActionButton label="Return to card" onPress={props.onCancel} />
      <ActionButton label="Continue without saving" onPress={props.onContinue} tone="primary" />
    </View>
  );
}

function StatePanel(
  props: Readonly<{
    children: string;
    heading: string;
    primary: Readonly<{ label: string; onPress: () => void }>;
    secondary?: Readonly<{ label: string; onPress: () => void }>;
  }>,
) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.panel}>
      <PageHeading>{props.heading}</PageHeading>
      <Text allowFontScaling style={styles.body}>
        {props.children}
      </Text>
      <ActionButton label={props.primary.label} onPress={props.primary.onPress} tone="primary" />
      {props.secondary ? (
        <ActionButton label={props.secondary.label} onPress={props.secondary.onPress} />
      ) : null}
    </View>
  );
}

function Section(props: Readonly<{ children: ReactNode; heading: string; kicker: string }>) {
  return (
    <View style={styles.recordSection}>
      <Text allowFontScaling style={styles.kicker}>
        {props.kicker}
      </Text>
      <Text accessibilityRole="header" allowFontScaling style={styles.sectionHeading}>
        {props.heading}
      </Text>
      {props.children}
    </View>
  );
}

function EmptySection(props: Readonly<{ availability?: string; label: string }>) {
  return (
    <Text allowFontScaling style={styles.empty}>
      {props.label}
      {props.availability ? ` · ${titleCase(props.availability)}` : ''}
    </Text>
  );
}

function PublicRecord(
  props: Readonly<{
    cachedAt: string | null;
    onBack: () => void;
    profile: PublicRoleProfile;
  }>,
) {
  const { profile } = props;
  const openSafeUrl = (value: string) => {
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' || url.protocol === 'http:')
        void Linking.openURL(url.toString());
    } catch {
      // Synthetic and malformed source references are labels, not launch targets.
    }
  };
  return (
    <View style={styles.stack}>
      <ActionButton label="Back to discovery" onPress={props.onBack} />
      {props.cachedAt === null ? null : (
        <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.offlineNotice}>
          Offline public copy saved {formatDate(props.cachedAt)}. Source freshness below is
          preserved.
        </Text>
      )}
      <View style={styles.recordHeader}>
        <View
          accessibilityLabel={`Approved image not available for ${profile.person.displayName}; initials placeholder shown.`}
          accessible
          style={styles.avatar}
        >
          <Text allowFontScaling style={styles.avatarText}>
            {representativeInitials(profile.person.displayName)}
          </Text>
        </View>
        <Text allowFontScaling style={styles.kicker}>
          HUMAN-REVIEWED · SYNTHETIC SOURCE RECORD
        </Text>
        <PageHeading>{profile.person.displayName}</PageHeading>
        <Text allowFontScaling style={styles.body}>
          {profile.office.title} · {profile.district?.label ?? 'District not available'}
        </Text>
        <Text allowFontScaling style={styles.notice}>
          {titleCase(profile.office.governmentLevel)} · {titleCase(profile.summary.roleStatus)} ·
          Version {profile.recordVersion}
        </Text>
      </View>

      <Section
        heading="Person, office, district, and service context"
        kicker="DISTINCT CIVIC ENTITIES"
      >
        <CardFact
          label="Person"
          value={`${profile.person.displayName} · ${profile.person.personId}`}
        />
        <CardFact label="Office" value={`${profile.office.title} · ${profile.office.officeId}`} />
        <CardFact
          label="District"
          value={`${profile.district?.label ?? 'Not available'} · ${profile.district?.districtId ?? 'No identifier'}`}
        />
        <CardFact
          label={profile.officeTerm === null ? 'Candidacy' : 'Office term'}
          value={`${titleCase(profile.officeTerm?.state ?? profile.candidacy?.state ?? 'not available')} · ${profile.officeTerm?.officeTermId ?? profile.candidacy?.candidacyId ?? 'No identifier'}`}
        />
        {profile.election === null ? null : (
          <CardFact
            label="Election"
            value={`${profile.election.name} · ${titleCase(profile.election.state)} · ${formatDate(profile.election.scheduledAt)}`}
          />
        )}
      </Section>

      <Section heading="Published identifiers and contact routes" kicker="OFFICIAL PUBLIC DATA">
        {profile.person.officialIdentifiers.length === 0 ? (
          <EmptySection label="No reviewed official identifier is available." />
        ) : (
          profile.person.officialIdentifiers.map((item) => (
            <CardFact
              key={item.identifierId}
              label={`${item.issuer} · ${titleCase(item.freshness)}`}
              value={item.value}
            />
          ))
        )}
        {profile.officialContactRoutes.length === 0 ? (
          <EmptySection label="No reviewed official contact route is available." />
        ) : (
          profile.officialContactRoutes.map((route) => (
            <View key={route.contactRouteId} style={styles.listItem}>
              <CardFact label={titleCase(route.kind)} value={route.value} />
              {route.kind === 'office_url' ? (
                <ActionButton
                  label="Open official route"
                  onPress={() => openSafeUrl(route.value)}
                />
              ) : null}
            </View>
          ))
        )}
      </Section>

      <Section heading="Claims and evidence state" kicker="SOURCED PUBLIC ACTIVITY">
        {profile.claims.length === 0 ? (
          <EmptySection label="No reviewed activity claims are available." />
        ) : (
          profile.claims.map((claim) => (
            <View key={claim.claimId} style={styles.listItem}>
              <Text accessibilityRole="header" allowFontScaling style={styles.itemHeading}>
                {claim.label}
              </Text>
              <Text allowFontScaling style={styles.body}>
                {claim.value}
              </Text>
              <Text allowFontScaling style={styles.notice}>
                {titleCase(claim.category)} · {titleCase(claim.status)} ·
                {titleCase(claim.conflictState)} · observed {formatDate(claim.observedAt)}
              </Text>
              <Text allowFontScaling selectable style={styles.notice}>
                Supporting sources: {claim.evidence.supportingSourceIds.join(', ')}. Challenging
                sources: {claim.evidence.challengingSourceIds.join(', ') || 'none published'}.
              </Text>
            </View>
          ))
        )}
      </Section>

      <Section heading="Coverage, freshness, conflicts, and gaps" kicker="COVERAGE IS NOT CONDUCT">
        <Text allowFontScaling style={styles.previewNote}>
          Missing data means coverage gap, not misconduct. Method: {profile.coverage.methodVersion}.
        </Text>
        {profile.coverage.items.map((item) => (
          <View key={item.category} style={styles.listItem}>
            <Text accessibilityRole="header" allowFontScaling style={styles.itemHeading}>
              {titleCase(item.category)} · {titleCase(item.state)}
            </Text>
            <Text allowFontScaling style={styles.body}>
              {item.explanation}
            </Text>
            <Text allowFontScaling style={styles.notice}>
              Last reviewed {formatDate(item.lastReviewedAt)} · {item.sourceIds.length} linked
              sources
            </Text>
          </View>
        ))}
        {profile.coverage.conflicts.length === 0 ? (
          <EmptySection label="No visible source conflict is published for this version." />
        ) : (
          profile.coverage.conflicts.map((conflict) => (
            <CardFact
              key={conflict.conflictId}
              label={`${conflict.field} · ${titleCase(conflict.state)}`}
              value={conflict.explanation}
            />
          ))
        )}
      </Section>

      <Section heading="Sources and reproducibility metadata" kicker="REVIEWED SOURCE VERSIONS">
        {profile.sources.items.map((source) => {
          const launchable = /^https?:\/\//u.test(source.originalUrl);
          return (
            <View key={source.sourceId} style={styles.listItem}>
              <Text accessibilityRole="header" allowFontScaling style={styles.itemHeading}>
                {source.publisher}
              </Text>
              <Text allowFontScaling style={styles.body}>
                {titleCase(source.sourceType)} · {titleCase(source.freshness)} · retrieved{' '}
                {formatDate(source.retrievedAt)}
              </Text>
              <Text allowFontScaling selectable style={styles.hash}>
                Source ID: {source.sourceId}
                {'\n'}Reviewed version: {source.reviewedRecordVersionId}
                {'\n'}
                SHA-256: {source.contentSha256}
                {'\n'}Licence / terms: {source.licenceNote}
              </Text>
              {launchable ? (
                <ActionButton label="Open source" onPress={() => openSafeUrl(source.originalUrl)} />
              ) : (
                <Text allowFontScaling style={styles.notice}>
                  Synthetic fixture URI — not opened
                </Text>
              )}
            </View>
          );
        })}
      </Section>

      <Section
        heading="Responses, disputes, corrections, and appeals"
        kicker="ACCOUNTABILITY ROUTES"
      >
        <EmptySection
          availability={profile.responses.availability}
          label={`${profile.responses.items.length} published responses`}
        />
        <EmptySection
          availability={profile.disputes.availability}
          label={`${profile.disputes.items.length} published disputes`}
        />
        <EmptySection
          availability={profile.corrections.availability}
          label={`${profile.corrections.items.length} published corrections`}
        />
        <EmptySection
          availability={profile.appeals.availability}
          label={`${profile.appeals.items.length} published appeals`}
        />
      </Section>

      <Section
        heading="What this record does and does not calculate"
        kicker="METHODS AND BOUNDARIES"
      >
        <CardFact
          label="Publication"
          value={`${titleCase(profile.publication.method)} · ${formatDate(profile.publication.decidedAt)}`}
        />
        <CardFact label="Profile method" value={profile.method.profileMethodVersion} />
        <CardFact label="Coverage method" value={profile.method.coverageMethodVersion} />
        <CardFact label="Composite score" value="Not included or calculated" />
        <CardFact label="Representative signal aggregate" value="Not included" />
        <CardFact label="AI content" value="None — synthetic, human-reviewed fixture only" />
        <CardFact
          label="Blockchain provenance"
          value={
            profile.provenance === null
              ? 'Not published; public browsing has no Verus dependency'
              : titleCase(profile.provenance.state)
          }
        />
      </Section>
    </View>
  );
}

export function DiscoveryScreen(props: DiscoveryScreenProps) {
  const repository = useMemo(
    () =>
      createPublicDiscoveryRepository({
        cache: mobilePublicDiscoveryCache,
        remote: {
          readProfile: (profileId) => readMobilePublicProfile(props.apiOrigin, profileId),
          readProfiles: (country) =>
            readMobilePublicProfiles(props.apiOrigin, { countryCode: country }),
        },
      }),
    [props.apiOrigin],
  );
  const [country, setCountry] = useState<DiscoveryCountry | null>(null);
  const initialCountryHandled = useRef(false);
  const [deck, setDeck] = useState<RepresentativeDeckState | null>(null);
  const [profileRead, setProfileRead] = useState<DiscoveryRead<PublicRoleProfile> | null>(null);
  const [loading, setLoading] = useState<LoadingState>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<RetryState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [gesturesEnabled, setGesturesEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (active && enabled) setGesturesEnabled(false);
    });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      if (enabled) setGesturesEnabled(false);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const loadDeck = useCallback(
    async (nextCountry: DiscoveryCountry) => {
      setCountry(nextCountry);
      setLoading('deck');
      setError(null);
      setRetry({ country: nextCountry, kind: 'deck' });
      setProfileRead(null);
      try {
        const read = await repository.readProfiles(nextCountry);
        setDeck(createRepresentativeDeck(read.value, nextCountry));
        setNotice(cacheNotice(read.cachedAt));
        setRetry(null);
      } catch {
        setDeck(null);
        setError(
          'The reviewed public deck is unavailable online and no current public copy exists on this device.',
        );
      } finally {
        setLoading(null);
      }
    },
    [repository],
  );

  useEffect(() => {
    if (initialCountryHandled.current || props.initialCountry == null) return;
    initialCountryHandled.current = true;
    void loadDeck(props.initialCountry);
  }, [loadDeck, props.initialCountry]);

  const openProfile = useCallback(
    async (profileId: string) => {
      setLoading('profile');
      setError(null);
      setRetry({ kind: 'profile', profileId });
      try {
        const read = await repository.readProfile(profileId);
        setProfileRead(read);
        setNotice(cacheNotice(read.cachedAt));
        setRetry(null);
      } catch {
        setProfileRead(null);
        setError(
          'The sourced record is unavailable online and no current public copy exists on this device.',
        );
      } finally {
        setLoading(null);
      }
    },
    [repository],
  );

  useEffect(() => {
    if (props.requestedProfileId === null) return;
    const profileId = props.requestedProfileId;
    props.onProfileRequestHandled();
    void openProfile(profileId);
  }, [openProfile, props.onProfileRequestHandled, props.requestedProfileId]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (profileRead !== null) {
        setProfileRead(null);
        setError(null);
        return true;
      }
      if (deck?.intent !== null && deck !== null) {
        setDeck(cancelRepresentativeIntent(deck));
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [deck, profileRead]);

  const currentCard = deck === null ? null : currentRepresentativeCard(deck);
  const reset = () => {
    setCountry(null);
    setDeck(null);
    setProfileRead(null);
    setError(null);
    setRetry(null);
    setNotice(null);
  };
  const retryRead = () => {
    if (retry?.kind === 'deck') void loadDeck(retry.country);
    if (retry?.kind === 'profile') void openProfile(retry.profileId);
  };
  const selectIntent = (intent: RepresentativeIntent) => {
    setDeck((value) => (value === null ? null : selectRepresentativeIntent(value, intent)));
  };

  let content: ReactNode;
  if (loading !== null) {
    content = (
      <StatePanel
        heading={loading === 'deck' ? 'Loading reviewed public cards…' : 'Opening sourced record…'}
        primary={{ label: 'Return to country selection', onPress: reset }}
      >
        Public reads have an eight-second budget and fall back only to a validated, current public
        cache.
      </StatePanel>
    );
  } else if (error !== null) {
    content = (
      <StatePanel
        heading="Public record unavailable"
        primary={{ label: 'Try again', onPress: retryRead }}
        secondary={{ label: 'Choose country', onPress: reset }}
      >
        {error}
      </StatePanel>
    );
  } else if (profileRead !== null) {
    content = (
      <PublicRecord
        cachedAt={profileRead.cachedAt}
        onBack={() => setProfileRead(null)}
        profile={profileRead.value}
      />
    );
  } else if (country === null || deck === null) {
    content = <CountryPicker onSelect={(selected) => void loadDeck(selected)} />;
  } else if (deck.items.length === 0) {
    content = (
      <StatePanel
        heading={`No reviewed ${DISCOVERY_COUNTRY_LABELS[country]} cards are available.`}
        primary={{ label: 'Retry public records', onPress: () => void loadDeck(country) }}
        secondary={{ label: 'Change country', onPress: reset }}
      >
        This is a coverage gap, not misconduct. The app will not invent a substitute record.
      </StatePanel>
    );
  } else if (currentCard === null) {
    content = (
      <StatePanel
        heading="You reached the end of this finite synthetic deck."
        primary={{ label: 'Refresh this deck', onPress: () => void loadDeck(country) }}
        secondary={{ label: 'Change country', onPress: reset }}
      >
        No hidden judgment was inferred from completion, skipped cards, or abandoned previews.
      </StatePanel>
    );
  } else if (deck.intent !== null) {
    content = (
      <IntentPreview
        card={currentCard}
        intent={deck.intent}
        onCancel={() => setDeck(cancelRepresentativeIntent(deck))}
        onContinue={() => setDeck(continueWithoutRepresentativeSignal(deck))}
      />
    );
  } else {
    content = (
      <RepresentativeCardPanel
        card={currentCard}
        gesturesEnabled={gesturesEnabled}
        onConcern={() => selectIntent('concern')}
        onOpenRecord={() => void openProfile(currentCard.profileId)}
        onSkip={() => setDeck(skipRepresentative(deck))}
        onSupport={() => selectIntent('support')}
        position={deck.currentIndex + 1}
        setGesturesEnabled={setGesturesEnabled}
        total={deck.items.length}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
    >
      {notice === null ? null : (
        <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.offlineNotice}>
          {notice}
        </Text>
      )}
      {content}
      <Text allowFontScaling style={styles.footerBoundary}>
        Public browsing works without Verus, AI, notifications, participation, precise location, or
        representative scoring.
      </Text>
    </ScrollView>
  );
}

const colors = {
  background: '#08131d',
  border: '#345064',
  concern: '#7a362f',
  foreground: '#f7f4e9',
  gold: '#d6b25e',
  muted: '#c3d0d8',
  panel: '#122432',
  panelRaised: '#193144',
  support: '#22634e',
};

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  action_concern: { backgroundColor: colors.concern },
  action_primary: { backgroundColor: colors.gold, borderColor: colors.gold },
  action_secondary: { backgroundColor: colors.panelRaised },
  action_support: { backgroundColor: colors.support },
  actionText: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    textAlign: 'center',
  },
  actions: { gap: 10 },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#27465a',
    borderColor: colors.gold,
    borderRadius: 42,
    borderWidth: 2,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  avatarText: { color: colors.foreground, fontSize: 26, fontWeight: '800' },
  body: { color: colors.muted, fontSize: 17, lineHeight: 26 },
  coverageBadge: {
    color: colors.gold,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  deckIntro: { gap: 10, paddingHorizontal: 4 },
  empty: {
    backgroundColor: '#0d1c27',
    borderRadius: 12,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    padding: 14,
  },
  fact: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingVertical: 10,
  },
  factGrid: { gap: 2 },
  factLabel: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 19,
  },
  factValue: { color: colors.foreground, fontSize: 16, lineHeight: 24 },
  footerBoundary: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  gestureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  gestureText: { flex: 1 },
  hash: { color: colors.muted, fontFamily: 'monospace', fontSize: 12, lineHeight: 19 },
  heading: { color: colors.foreground, fontSize: 30, fontWeight: '800', lineHeight: 37 },
  identityRow: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  identityText: { flex: 1, gap: 4 },
  itemHeading: { color: colors.foreground, fontSize: 18, fontWeight: '700', lineHeight: 25 },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    lineHeight: 18,
  },
  listItem: { backgroundColor: '#0d1c27', borderRadius: 14, gap: 8, padding: 14 },
  name: { color: colors.foreground, fontSize: 25, fontWeight: '800', lineHeight: 31 },
  notice: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  noWrite: {
    backgroundColor: '#0d1c27',
    borderColor: colors.support,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  noWriteTitle: { color: colors.foreground, fontSize: 18, fontWeight: '800', lineHeight: 25 },
  offlineNotice: {
    backgroundColor: '#4a3c1c',
    borderRadius: 12,
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 21,
    padding: 13,
  },
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  pressed: { opacity: 0.72 },
  previewNote: {
    backgroundColor: '#0d1c27',
    borderLeftColor: colors.gold,
    borderLeftWidth: 4,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    padding: 14,
  },
  profileCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 17,
    padding: 18,
  },
  progress: { color: colors.foreground, fontSize: 14, fontWeight: '700' },
  recordHeader: {
    alignItems: 'flex-start',
    backgroundColor: colors.panel,
    borderRadius: 22,
    gap: 10,
    padding: 20,
  },
  recordSection: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: 13,
    padding: 18,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  screen: { backgroundColor: colors.background, flex: 1 },
  scrollContent: {
    alignSelf: 'center',
    gap: 16,
    maxWidth: 720,
    padding: mobileFoundationTokens.spacing.medium,
    paddingBottom: 48,
    width: '100%',
  },
  sectionHeading: { color: colors.foreground, fontSize: 22, fontWeight: '800', lineHeight: 29 },
  stack: { gap: 16 },
  status: { color: colors.muted, fontSize: 14, fontWeight: '700', lineHeight: 20 },
});
