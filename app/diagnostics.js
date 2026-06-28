/**
 * AI Diagnostics Screen - Modal Route
 * Displays real-time diagnostics for debugging AI model and GPS
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../lib/store/themeContext';
import DiagnosticsScreen from '../components/diagnostics/DiagnosticsScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function DiagnosticsModalScreen() {
  const { isDark } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#f9fafb' },
      ]}
    >
      <DiagnosticsScreen />
    </SafeAreaView>
  );
}
