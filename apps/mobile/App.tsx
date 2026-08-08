import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { AppState, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { mobileFoundationCopy, mobileFoundationTokens } from '@rmr/mobile-ui';

import { resolveMobileEnvironment, type MobileEnvironmentName } from './mobile-environments';
import { readMobileCompatibilityPolicy, readMobileHealth } from './src/api';
import { evaluateMobileCompatibility } from './src/compatibility';
import { parseNativeLink } from './src/links';
import { parseMobileRuntimeConfig } from './src/runtime-config';
import {
  acceptWalletReturn,
  launchWalletHarness,
  recoverWalletResult,
  type WalletHarnessRequest,
  type WalletHarnessStatus,
} from './src/wallet-harness';

type FoundationStatus = 'checking' | 'compatible' | 'degraded' | 'update_required';

const syntheticWalletChallengeReference = 'challenge:synthetic:device:0001';
const syntheticWalletEnvelope = 'synthetic-public-envelope';

export default function App() {
  const runtime = useMemo(() => parseMobileRuntimeConfig(Constants.expoConfig?.extra), []);
  const environment = mobileEnvironmentsForRuntime(runtime.mobileEnvironment);
  const [foundationStatus, setFoundationStatus] = useState<FoundationStatus>('checking');
  const [linkStatus, setLinkStatus] = useState('No app link handled in this session.');
  const [walletRequest, setWalletRequest] = useState<WalletHarnessRequest | null>(null);
  const [walletStatus, setWalletStatus] = useState(
    'Synthetic wallet transport test has not been started.',
  );

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
    const handleUrl = async (url: string) => {
      const decision = parseNativeLink(url, environment);
      setLinkStatus(
        decision.accepted
          ? `Accepted ${decision.route.kind.replace('_', ' ')} route; current state will be fetched from the API.`
          : 'Rejected an invalid, unsafe, or environment-mismatched link.',
      );
      if (
        walletRequest !== null &&
        acceptWalletReturn({
          challengeReference: walletRequest.challengeReference,
          environment,
          url,
        })
      ) {
        setWalletStatus('Exact synthetic return accepted; bounded polling is running.');
        let pollAttempt = 0;
        const result = await recoverWalletResult({
          challengeReference: walletRequest.challengeReference,
          expiresAt: walletRequest.expiresAt,
          maxAttempts: 2,
          now: () => new Date().toISOString(),
          pollIntervalMilliseconds: 250,
          port: {
            openHttpsFallback: async () => undefined,
            openWallet: async () => false,
            pollResult: async (): Promise<WalletHarnessStatus> => {
              pollAttempt += 1;
              return pollAttempt === 1 ? 'pending' : 'declined';
            },
            wait: async (milliseconds) =>
              new Promise((resolve) => setTimeout(resolve, milliseconds)),
          },
        });
        setWalletStatus(
          `Synthetic bounded polling completed with ${result}; no wallet response was created or trusted.`,
        );
        setWalletRequest(null);
      }
    };
    void Linking.getInitialURL().then((url) => {
      if (url !== null) void handleUrl(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });
    return () => subscription.remove();
  }, [environment, walletRequest]);

  const openSyntheticWalletTest = async () => {
    if (!runtime.verusWallet.enabled) return;
    const request: WalletHarnessRequest = {
      challengeReference: syntheticWalletChallengeReference,
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      rmrOrigin: `https://${runtime.appLinkHost}`,
      walletUrl: `verus://request/${syntheticWalletEnvelope}`,
    };
    setWalletRequest(request);
    setWalletStatus('Opening the pinned Verus Mobile transport with a synthetic envelope.');
    try {
      const result = await launchWalletHarness({
        environment,
        explicitUserGesture: true,
        featureEnabled: runtime.verusWallet.enabled,
        now: new Date().toISOString(),
        port: {
          openHttpsFallback: async (url) => Linking.openURL(url),
          openWallet: async (url) => {
            try {
              await Linking.openURL(url);
              return true;
            } catch {
              return false;
            }
          },
          pollResult: async () => 'failed',
          wait: async (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
        },
        request,
      });
      setWalletStatus(
        result.transport === 'wallet'
          ? 'Pinned wallet transport opened; waiting for the exact synthetic return.'
          : 'Pinned wallet was unavailable; opened the RMR-controlled help fallback.',
      );
    } catch {
      setWalletStatus('Synthetic wallet transport failed closed; no private action was attempted.');
    }
  };

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
        {runtime.verusWallet.enabled ? (
          <View style={styles.walletPanel}>
            <Text accessibilityRole="header" allowFontScaling style={styles.walletHeading}>
              Synthetic VRSCTEST transport test
            </Text>
            <Text allowFontScaling style={styles.notice}>
              Expected RMR origin: https://{runtime.appLinkHost}. This test contains no request
              signature, identity, key, address, or transaction.
            </Text>
            <Pressable
              accessibilityLabel="Open synthetic Verus Mobile transport test"
              accessibilityRole="button"
              onPress={() => void openSyntheticWalletTest()}
              style={styles.walletAction}
            >
              <Text allowFontScaling style={styles.walletActionText}>
                Open synthetic Verus Mobile test
              </Text>
            </Pressable>
            <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.notice}>
              {walletStatus}
            </Text>
          </View>
        ) : null}
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
  walletAction: {
    alignItems: 'center',
    backgroundColor: mobileFoundationTokens.color.foreground,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: mobileFoundationTokens.spacing.medium,
    paddingVertical: mobileFoundationTokens.spacing.small,
  },
  walletActionText: {
    color: mobileFoundationTokens.color.background,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  walletHeading: {
    color: mobileFoundationTokens.color.foreground,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  walletPanel: {
    borderColor: mobileFoundationTokens.color.muted,
    borderRadius: 16,
    borderWidth: 1,
    gap: mobileFoundationTokens.spacing.small,
    padding: mobileFoundationTokens.spacing.medium,
  },
});

function mobileEnvironmentsForRuntime(name: MobileEnvironmentName) {
  return resolveMobileEnvironment(name);
}

function parseNativeBuildNumber(value: string | null): number {
  if (value === null || !/^[1-9]\d*$/u.test(value)) return 1;
  return Number(value);
}
