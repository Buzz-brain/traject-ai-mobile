/**
 * Screen Header Component
 * Used at the top of each screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../lib/store/themeContext';

/**
 * ScreenHeader - Header for screens
 */
export function ScreenHeader({ 
  title, 
  subtitle = null,
  style = {},
}) {
  const { isDark } = useTheme();

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
      ...style,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#f3f4f6' : '#1f2937',
      marginBottom: subtitle ? 4 : 0,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
  });

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

export default ScreenHeader;
