import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  cancelRepresentativeIntent,
  continueWithoutRepresentativeSignal,
  createPublicDiscoveryRepository,
  createRepresentativeDeck,
  currentRepresentativeCard,
  selectRepresentativeIntent,
  skipRepresentative,
  type DiscoveryCountry,
  type DiscoveryRead,
  type RepresentativeDeckState,
  type RepresentativeIntent,
} from '@rmr/discovery';
import {
  CountrySelection,
  CoverageGap,
  DeckCompletion,
  DiscoveryError,
  DiscoveryLoading,
  PublicDiscoveryFrame,
  RepresentativeCardView,
  RepresentativeIntentPreview,
  SourcedRecordView,
} from '@rmr/web-ui';
import type { PublicRoleProfile } from '@rmr/contracts';

import { readWebPublicProfile, readWebPublicProfiles } from './health';
import { createWebPublicDiscoveryCache, resolveWebPublicStorage } from './public-cache';
import { publicProfileIdFromPath, resolveWebApiOrigin } from './runtime';

type LoadingState = 'deck' | 'profile' | null;
type RetryState = Readonly<
  { kind: 'deck'; country: DiscoveryCountry } | { kind: 'profile'; profileId: string }
> | null;

function cachedNotice(cachedAt: string | null): string | undefined {
  if (cachedAt === null) return undefined;
  return `Offline public copy in use, saved ${new Date(cachedAt).toLocaleString()}. Choices remain local and unsaved.`;
}

export default function App() {
  const apiOrigin = useMemo(
    () => resolveWebApiOrigin(window.location.origin, import.meta.env.VITE_RMR_API_ORIGIN),
    [],
  );
  const repository = useMemo(
    () =>
      createPublicDiscoveryRepository({
        cache: createWebPublicDiscoveryCache(resolveWebPublicStorage(window)),
        remote: {
          readProfile: (profileId) => readWebPublicProfile(apiOrigin, profileId),
          readProfiles: (country) => readWebPublicProfiles(apiOrigin, { countryCode: country }),
        },
      }),
    [apiOrigin],
  );
  const [country, setCountry] = useState<DiscoveryCountry | null>(null);
  const [deck, setDeck] = useState<RepresentativeDeckState | null>(null);
  const [profileRead, setProfileRead] = useState<DiscoveryRead<PublicRoleProfile> | null>(null);
  const [loading, setLoading] = useState<LoadingState>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<RetryState>(null);
  const [dataNotice, setDataNotice] = useState<string | undefined>();
  const initialRouteHandled = useRef(false);

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
        setDataNotice(cachedNotice(read.cachedAt));
        setRetry(null);
      } catch {
        setDeck(null);
        setError(
          'The reviewed public profile list is unavailable online and no current public copy exists on this device.',
        );
      } finally {
        setLoading(null);
      }
    },
    [repository],
  );

  const openProfile = useCallback(
    async (profileId: string, updateHistory = true) => {
      setLoading('profile');
      setError(null);
      setRetry({ kind: 'profile', profileId });
      try {
        const read = await repository.readProfile(profileId);
        setProfileRead(read);
        setDataNotice(cachedNotice(read.cachedAt));
        setRetry(null);
        if (updateHistory) {
          window.history.pushState(
            { rmrView: 'profile' },
            '',
            `/app/profiles/${encodeURIComponent(profileId)}`,
          );
        }
        window.scrollTo({ behavior: 'smooth', top: 0 });
      } catch {
        setProfileRead(null);
        setError(
          'The reviewed sourced record is unavailable online and no current public copy exists on this device.',
        );
      } finally {
        setLoading(null);
      }
    },
    [repository],
  );

  useEffect(() => {
    if (initialRouteHandled.current) return;
    initialRouteHandled.current = true;
    const profileId = publicProfileIdFromPath(window.location.pathname);
    if (profileId !== null) void openProfile(profileId, false);
  }, [openProfile]);

  useEffect(() => {
    const handlePopState = () => {
      const profileId = publicProfileIdFromPath(window.location.pathname);
      if (profileId === null) {
        setProfileRead(null);
        setError(null);
        setRetry(null);
        setDataNotice(undefined);
      } else if (profileRead?.value.profileId !== profileId) {
        void openProfile(profileId, false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [openProfile, profileRead?.value.profileId]);

  const currentCard = deck === null ? null : currentRepresentativeCard(deck);
  const changeCountry = () => {
    setCountry(null);
    setDeck(null);
    setProfileRead(null);
    setError(null);
    setRetry(null);
    setDataNotice(undefined);
    window.history.replaceState({}, '', '/');
  };
  const closeProfile = () => {
    setProfileRead(null);
    setError(null);
    setRetry(null);
    setDataNotice(undefined);
    window.history.replaceState({}, '', '/');
  };
  const retryRead = () => {
    if (retry?.kind === 'deck') void loadDeck(retry.country);
    if (retry?.kind === 'profile') void openProfile(retry.profileId, false);
  };
  const selectIntent = (intent: RepresentativeIntent) => {
    setDeck((current) => (current === null ? null : selectRepresentativeIntent(current, intent)));
  };

  let content: ReactNode;
  if (loading !== null) {
    content = (
      <DiscoveryLoading
        label={loading === 'deck' ? 'Loading a finite reviewed deck…' : 'Opening sourced record…'}
      />
    );
  } else if (error !== null) {
    content = <DiscoveryError message={error} onRetry={retryRead} />;
  } else if (profileRead !== null) {
    content = (
      <SourcedRecordView
        cachedAt={profileRead.cachedAt}
        onBack={closeProfile}
        profile={profileRead.value}
      />
    );
  } else if (country === null || deck === null) {
    content = <CountrySelection onSelect={(selected) => void loadDeck(selected)} />;
  } else if (deck.items.length === 0) {
    content = (
      <CoverageGap
        country={country}
        onChangeCountry={changeCountry}
        onRetry={() => void loadDeck(country)}
      />
    );
  } else if (currentCard === null) {
    content = (
      <DeckCompletion
        country={country}
        onChangeCountry={changeCountry}
        onRefresh={() => void loadDeck(country)}
      />
    );
  } else if (deck.intent !== null) {
    content = (
      <RepresentativeIntentPreview
        card={currentCard}
        intent={deck.intent}
        onCancel={() => setDeck(cancelRepresentativeIntent(deck))}
        onContinueWithoutSaving={() => setDeck(continueWithoutRepresentativeSignal(deck))}
      />
    );
  } else {
    content = (
      <RepresentativeCardView
        card={currentCard}
        onConcern={() => selectIntent('concern')}
        onOpenRecord={() => void openProfile(currentCard.profileId)}
        onSkip={() => setDeck(skipRepresentative(deck))}
        onSupport={() => selectIntent('support')}
        position={deck.currentIndex + 1}
        total={deck.items.length}
      />
    );
  }

  return (
    <PublicDiscoveryFrame {...(dataNotice === undefined ? {} : { dataNotice })}>
      {content}
    </PublicDiscoveryFrame>
  );
}
