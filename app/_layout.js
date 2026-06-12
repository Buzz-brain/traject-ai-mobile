/**
 * Root Layout (Stack Navigation)
 * Phase 1: Stub with provider setup
 * Phase 3: Implement navigation structure
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../lib/store/themeContext';
import { SessionProvider } from '../lib/store/sessionContext';
import { SensorFusionProvider } from '../lib/store/sensorFusionContext';

/**
 * Root layout component
 * Wraps entire app with Context providers and gesture handling
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SessionProvider>
          <SensorFusionProvider>
            {/* Phase 3: Stack navigation and screens */}
          </SensorFusionProvider>
        </SessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
