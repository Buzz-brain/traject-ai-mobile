/**
 * Tabs Layout
 * Tab navigation structure (Sessions, Tracker, Settings)
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/store/themeContext';

/**
 * Tabs navigation layout
 */
export default function TabsLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#10b981' : '#059669',
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: 5,
        },
      }}
    >
      {/* Home/Sessions Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />

      {/* Tracker Tab */}
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="navigate" size={size} color={color} />
          ),
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
