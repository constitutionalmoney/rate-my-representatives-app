import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { RepresentationCapabilities, RepresentationResolution } from '@rmr/contracts';
import { mobileFoundationTokens } from '@rmr/mobile-ui';

import {
  continueMobileRepresentationAmbiguity,
  readMobileRepresentationCapabilities,
  resolveMobileRepresentation,
} from './api';
export { locationResolverAccessibility } from './location-resolver-accessibility';

type CountryCode = 'CA' | 'US';

export function LocationResolverScreen(props: {
  readonly apiOrigin: string;
  readonly onBrowseCountry: (countryCode: CountryCode) => void;
}) {
  const [capabilities, setCapabilities] = useState<RepresentationCapabilities | null>(null);
  const [countryCode, setCountryCode] = useState<CountryCode>('CA');
  const [value, setValue] = useState('');
  const [resolution, setResolution] = useState<RepresentationResolution | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCapabilities = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setCapabilities(await readMobileRepresentationCapabilities(props.apiOrigin));
    } catch {
      setError('Location capability discovery is unavailable. Browse by country or retry.');
    } finally {
      setBusy(false);
    }
  }, [props.apiOrigin]);

  useEffect(() => void loadCapabilities(), [loadCapabilities]);
  const capability = useMemo(
    () => capabilities?.items.find((item) => item.countryCode === countryCode) ?? null,
    [capabilities, countryCode],
  );

  const resolveOnce = async () => {
    if (capability === null || capability.featureState !== 'operational') return;
    const preciseValue = value;
    setValue('');
    setBusy(true);
    setError(null);
    setResolution(null);
    try {
      setResolution(
        await resolveMobileRepresentation(props.apiOrigin, {
          schemaVersion: 'representation-resolution-request.v1',
          asOf: new Date().toISOString(),
          countryCode,
          input: { kind: capability.input.kind, value: preciseValue },
        }),
      );
    } catch {
      setError('Lookup failed. The entry was discarded; retry or browse by country.');
    } finally {
      setBusy(false);
    }
  };

  const selectAmbiguity = async (optionId: string) => {
    if (resolution?.ambiguity === null || resolution?.ambiguity === undefined) return;
    setBusy(true);
    setError(null);
    try {
      setResolution(
        await continueMobileRepresentationAmbiguity(props.apiOrigin, {
          schemaVersion: 'representation-ambiguity-selection.v1',
          asOf: resolution.asOf,
          optionId,
          selectionToken: resolution.ambiguity.selectionToken,
        }),
      );
    } catch {
      setError('That one-time choice expired. Start a new lookup; the entry is not retained.');
      setResolution(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" allowFontScaling style={styles.heading}>
        Find representation
      </Text>
      <Text allowFontScaling style={styles.body}>
        Enter the minimum synthetic location detail once. It is cleared immediately and never saved,
        logged, queued, sent to AI, or sent to Verus. This does not determine residence,
        citizenship, or voter eligibility.
      </Text>
      <View accessibilityRole="radiogroup" style={styles.countryRow}>
        {(['CA', 'US'] as const).map((country) => (
          <Pressable
            accessibilityLabel={country === 'CA' ? 'Canada' : 'United States'}
            accessibilityRole="radio"
            accessibilityState={{ checked: countryCode === country }}
            key={country}
            onPress={() => {
              setCountryCode(country);
              setResolution(null);
              setValue('');
            }}
            style={[styles.countryButton, countryCode === country && styles.countryButtonSelected]}
          >
            <Text allowFontScaling style={styles.buttonText}>
              {country === 'CA' ? 'Canada' : 'United States'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text allowFontScaling nativeID="location-input-label" style={styles.label}>
        {capability?.input.label ?? 'Location input'}
      </Text>
      <TextInput
        accessibilityLabelledBy="location-input-label"
        accessibilityHint="Used once for a synthetic boundary lookup, then cleared"
        autoCapitalize={countryCode === 'CA' ? 'characters' : 'words'}
        autoComplete={capability?.input.autocomplete ?? 'off'}
        editable={!busy && capability?.featureState === 'operational'}
        maxLength={capability?.input.maxLength ?? 240}
        onChangeText={setValue}
        placeholder={countryCode === 'CA' ? 'A1A 1A1 (synthetic)' : 'Synthetic street address'}
        style={styles.input}
        value={value}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: busy || capability?.featureState !== 'operational' }}
        disabled={busy || value.length === 0 || capability?.featureState !== 'operational'}
        onPress={() => void resolveOnce()}
        style={styles.primaryButton}
      >
        <Text allowFontScaling style={styles.buttonText}>
          Resolve once
        </Text>
      </Pressable>

      {capability?.featureState === 'disabled' ? (
        <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.notice}>
          Precise lookup is disabled by default. Country browsing remains available without it.
        </Text>
      ) : null}
      {busy ? (
        <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.notice}>
          Processing without retaining the entry…
        </Text>
      ) : null}
      {error ? (
        <View accessibilityLiveRegion="assertive" style={styles.error}>
          <Text allowFontScaling style={styles.body}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadCapabilities()}
            style={styles.secondaryButton}
          >
            <Text allowFontScaling style={styles.buttonText}>
              Retry capability check
            </Text>
          </Pressable>
        </View>
      ) : null}
      {resolution ? (
        <View accessibilityLiveRegion="polite" style={styles.result}>
          <Text accessibilityRole="header" allowFontScaling style={styles.subheading}>
            {resolution.state.replace('_', ' ')}
          </Text>
          <Text allowFontScaling style={styles.body}>
            Geometry {resolution.provider.geometry.version}; source{' '}
            {resolution.provider.source.version}.
          </Text>
          {resolution.ambiguity
            ? resolution.ambiguity.options.map((option) => (
                <Pressable
                  accessibilityRole="button"
                  key={option.candidateId}
                  onPress={() => void selectAmbiguity(option.candidateId)}
                  style={styles.secondaryButton}
                >
                  <Text allowFontScaling style={styles.buttonText}>
                    {option.label}
                  </Text>
                </Pressable>
              ))
            : resolution.matches.map((match) => (
                <View key={match.scope} style={styles.match}>
                  <Text allowFontScaling style={styles.label}>
                    {match.scope.replace('_', ' ')}
                  </Text>
                  <Text allowFontScaling style={styles.body}>
                    {match.district?.label ?? match.jurisdiction.label} ·{' '}
                    {match.matchState.replace('_', ' ')}
                  </Text>
                </View>
              ))}
          {resolution.state === 'resolved' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => props.onBrowseCountry(resolution.countryCode)}
              style={styles.primaryButton}
            >
              <Text allowFontScaling style={styles.buttonText}>
                Continue to reviewed cards
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => props.onBrowseCountry(countryCode)}
        style={styles.secondaryButton}
      >
        <Text allowFontScaling style={styles.buttonText}>
          Browse by country instead
        </Text>
      </Pressable>
      <Text allowFontScaling style={styles.notice}>
        An optional saved region can only be a country, province, state, or territory and requires
        an authenticated account. It can never store an address, district, municipality, or
        coordinate.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { color: mobileFoundationTokens.color.muted, fontSize: 18, lineHeight: 27 },
  buttonText: { color: mobileFoundationTokens.color.foreground, fontSize: 17, fontWeight: '700' },
  content: { gap: 16, padding: 20, paddingBottom: 48 },
  countryButton: {
    borderColor: '#527082',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
    padding: 12,
  },
  countryButtonSelected: { backgroundColor: '#234b5c', borderColor: '#7fc8a8' },
  countryRow: { flexDirection: 'row', gap: 12 },
  error: { backgroundColor: '#4a2626', borderRadius: 12, gap: 12, padding: 16 },
  heading: {
    color: mobileFoundationTokens.color.foreground,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 42,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#527082',
    borderRadius: 12,
    borderWidth: 1,
    color: '#12212b',
    fontSize: 18,
    minHeight: 48,
    padding: 12,
  },
  label: { color: mobileFoundationTokens.color.foreground, fontSize: 18, fontWeight: '700' },
  match: { borderTopColor: '#527082', borderTopWidth: 1, gap: 4, paddingTop: 10 },
  notice: { color: '#b9cad4', fontSize: 16, lineHeight: 24 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#286f58',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    padding: 12,
  },
  result: { backgroundColor: '#152c38', borderRadius: 12, gap: 12, padding: 16 },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#527082',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    padding: 12,
  },
  subheading: { color: mobileFoundationTokens.color.foreground, fontSize: 24, fontWeight: '700' },
});
