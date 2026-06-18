/**
 * Root Layout - Navigation Structure
 * Sets up Expo Router with providers and stack navigation
 */

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../lib/store/themeContext';
import { SessionProvider } from '../lib/store/sessionContext';
import { SensorFusionProvider } from '../lib/store/sensorFusionContext';
import { DiagnosticsProvider } from '../lib/store/diagnosticsContext';

/**
 * Error Boundary for the entire app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#f00', marginBottom: 10 }}>
            Error Loading App
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginHorizontal: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Root layout component
 * Wraps entire app with Context providers and gesture handling
 */
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <SessionProvider>
            <SensorFusionProvider>
              <DiagnosticsProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  {/* Tabs navigation */}
                  <Stack.Group
                    screenOptions={{
                      headerShown: false,
                    }}
                  >
                    <Stack.Screen name="(tabs)" />
                  </Stack.Group>

                  {/* Modal screens */}
                  <Stack.Group
                    screenOptions={{
                      presentation: 'modal',
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: '#1f2937',
                      },
                      headerTintColor: '#fff',
                    }}
                  >
                    <Stack.Screen
                      name="session-detail"
                      options={{
                        headerTitle: 'Session Details',
                      }}
                    />
                    <Stack.Screen
                      name="export-session"
                      options={{
                        headerTitle: 'Export Session',
                      }}
                    />
                    <Stack.Screen
                      name="diagnostics"
                      options={{
                        headerTitle: 'AI Diagnostics',
                      }}
                    />
                  </Stack.Group>
                </Stack>
              </DiagnosticsProvider>
            </SensorFusionProvider>
          </SessionProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
