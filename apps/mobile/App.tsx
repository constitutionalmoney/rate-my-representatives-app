import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { mobileFoundationCopy, mobileFoundationTokens } from '@rmr/mobile-ui';

import { resolveMobileEnvironment, type MobileEnvironmentName } from './mobile-environments';
import { readMobileCompatibilityPolicy, readMobileHealth } from './src/api';
import { evaluateMobileCompatibility } from './src/compatibility';
import { parseNativeLink } from './src/links';
import { parseMobileRuntimeConfig } from './src/runtime-config';

type FoundationStatus = 'checking' | 'compatible' | 'degraded' | 'update_required';

export default function App() {
  const runtime = useMemo(() => parseMobileRuntimeConfig(Constants.expoConfig?.extra), []);
  const environment = mobileEnvironmentsForRuntime(runtime.mobileEnvironment);
  const [foundationStatus, setFoundationStatus] = useState<FoundationStatus>('checking');
  const [linkStatus, setLinkStatus] = useState('No app link handled in this session.');

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const [health, compatibility] = await Promise.all([
          readMobileHealth(runtime.apiOrigin),
          readMobileCompatibilityPolicy(runtime.apiOrigin),
        ]);
        if (cancelled) return;
        if (health.status !== 'ready') {
          setFoundationStatus('degraded');
          return;
        }
        if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
          setFoundationStatus('compatible');
          return;
        }
        const decision = evaluateMobileCompatibility({
          appVersion: Constants.nativeAppVersion ?? Constants.expoConfig?.version ?? '',
          buildNumber: parseNativeBuildNumber(Constants.nativeBuildVersion),
          contractVersion: runtime.apiContractVersion,
          platform: Platform.OS,
          policy: compatibility,
        });
        setFoundationStatus(decision.allowed ? 'compatible' : 'update_required');
      } catch {
        if (!cancelled) setFoundationStatus('degraded');
      }
    };
    void refresh();
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void refresh();
    });
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [runtime]);

  useEffect(() => {
    const handleUrl = (url: string) => {
      const decision = parseNativeLink(url, environment);
      setLinkStatus(
        decision.accepted
          ? `Accepted ${decision.route.kind.replace('_', ' ')} route; current state will be fetched from the API.`
          : 'Rejected an invalid, unsafe, or environment-mismatched link.',
      );
    };
    void Linking.getInitialURL().then((url) => {
      if (url !== null) handleUrl(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, [environment]);

  const statusCopy = {
    checking: 'Checking the versioned API contract.',
    compatible: 'Native foundation and API contract are compatible.',
    degraded: 'Public API is temporarily unavailable; no private action was attempted.',
    update_required: 'This build is below the API minimum and must be updated.',
  }[foundationStatus];

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text accessibilityRole="header" allowFontScaling style={styles.heading}>
          {mobileFoundationCopy.heading}
        </Text>
        <Text allowFontScaling style={styles.body}>
          Native {Platform.OS} development build · {runtime.mobileEnvironment} environment.
        </Text>
        <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.status}>
          {statusCopy}
        </Text>
        <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.body}>
          {linkStatus}
        </Text>
        <Text allowFontScaling style={styles.notice}>
          {mobileFoundationCopy.status} Wallet, push, participation, representative VerusID,
          provenance-write, and scoring features remain disabled.
        </Text>
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: mobileFoundationTokens.color.muted,
    fontSize: 18,
    lineHeight: 27,
  },
  card: {
    backgroundColor: mobileFoundationTokens.color.panel,
    borderRadius: 24,
    gap: mobileFoundationTokens.spacing.medium,
    maxWidth: 560,
    padding: mobileFoundationTokens.spacing.large,
    width: '100%',
  },
  heading: {
    color: mobileFoundationTokens.color.foreground,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 42,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: mobileFoundationTokens.color.background,
    flex: 1,
    justifyContent: 'center',
    padding: mobileFoundationTokens.spacing.medium,
  },
  status: {
    color: mobileFoundationTokens.color.foreground,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  notice: {
    color: mobileFoundationTokens.color.muted,
    fontSize: 14,
    lineHeight: 22,
  },
});

function mobileEnvironmentsForRuntime(name: MobileEnvironmentName) {
  return resolveMobileEnvironment(name);
}

function parseNativeBuildNumber(value: string | null): number {
  if (value === null || !/^[1-9]\d*$/u.test(value)) return 1;
  return Number(value);
}
