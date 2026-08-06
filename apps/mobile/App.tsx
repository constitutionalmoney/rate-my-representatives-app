import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { mobileFoundationCopy, mobileFoundationTokens } from '@rmr/mobile-ui';

export default function App() {
  return (
    <View accessibilityLabel="Rate My Representatives foundation" style={styles.screen}>
      <View style={styles.card}>
        <Text accessibilityRole="header" allowFontScaling style={styles.heading}>
          {mobileFoundationCopy.heading}
        </Text>
        <Text allowFontScaling style={styles.body}>
          Native {Platform.OS} development-build placeholder.
        </Text>
        <Text accessibilityLiveRegion="polite" allowFontScaling style={styles.status}>
          {mobileFoundationCopy.status}
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
});
