/**
 * Stat Box Component
 * Display statistics in a grid format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../lib/store/themeContext';

/**
 * StatBox - Display single statistic
 */
export function StatBox({ 
  label, 
  value, 
  unit = '',
  color = null,
}) {
  const { isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#2d3748' : '#f9fafb',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 6,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
    },
    value: {
      fontSize: 24,
      fontWeight: '700',
      color: color || (isDark ? '#10b981' : '#059669'),
      marginBottom: 4,
    },
    unit: {
      fontSize: 12,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 8,
    },
    label: {
      fontSize: 12,
      color: isDark ? '#d1d5db' : '#4b5563',
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      {unit && <Text style={styles.unit}>{unit}</Text>}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

/**
 * StatGrid - Display multiple statistics
 */
export function StatGrid({ stats = [] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
      {stats.map((stat, index) => (
        <StatBox 
          key={index}
          label={stat.label}
          value={stat.value}
          unit={stat.unit}
          color={stat.color}
        />
      ))}
    </View>
  );
}

export default StatBox;
