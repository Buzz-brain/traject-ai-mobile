/**
 * Root Layout - Navigation Structure
 * Sets up Expo Router with providers, error boundary and stack navigation
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../../lib/store/themeContext';
import { SessionProvider } from '../../lib/store/sessionContext';
import { SensorFusionProvider } from '../../lib/store/sensorFusionContext';
import { DiagnosticsProvider } from '../../lib/store/diagnosticsContext';

type ErrorBoundaryProps = { children: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading App</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SessionProvider>
          <SensorFusionProvider>
            <DiagnosticsProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="session-detail"
                  options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                  name="diagnostics"
                  options={{
                    presentation: 'modal',
                    headerShown: true,
                    headerTitle: 'AI Diagnostics',
                  }}
                />
              </Stack>
            </DiagnosticsProvider>
          </SensorFusionProvider>
        </SessionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
});
