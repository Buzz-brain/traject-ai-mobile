/**
 * Primary Button Component
 * Reusable button with theming support
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../lib/store/themeContext';

/**
 * PrimaryButton - Main action button
 */
export function PrimaryButton({ 
  label, 
  onPress, 
  disabled = false, 
  style = {},
  variant = 'primary' // 'primary' | 'success' | 'danger' | 'warning'
}) {
  const { isDark } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return isDark ? '#4b5563' : '#d1d5db';
    
    switch (variant) {
      case 'success':
        return isDark ? '#059669' : '#10b981';
      case 'danger':
        return isDark ? '#dc2626' : '#ef4444';
      case 'warning':
        return isDark ? '#d97706' : '#f59e0b';
      default:
        return isDark ? '#3b82f6' : '#2563eb';
    }
  };

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: getBackgroundColor(),
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    },
    label: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * SecondaryButton - Secondary action button
 */
export function SecondaryButton({ 
  label, 
  onPress, 
  disabled = false,
  style = {},
}) {
  const { isDark } = useTheme();

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#d1d5db',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    },
    label: {
      color: isDark ? '#e5e7eb' : '#1f2937',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

export default PrimaryButton;
