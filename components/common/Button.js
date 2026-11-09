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
        return isDark ? '#12b981' : '#3ec7a5';
      case 'danger':
        return isDark ? '#dc2626' : '#ef4444';
      case 'warning':
        return isDark ? '#d97706' : '#f59e0b';
      default:
        return '#6c63ff';
    }
  };

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 20,
      backgroundColor: getBackgroundColor(),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#5d51ee',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      ...style,
    },
    label: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
  });

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
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
      borderRadius: 16,
      backgroundColor: isDark ? '#1b2433' : '#f3f1ff',
      borderWidth: 1,
      borderColor: isDark ? '#2f3c4d' : '#e2ddff',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    },
    label: {
      color: isDark ? '#edf2ff' : '#2a234d',
      fontSize: 15,
      fontWeight: '700',
    },
  });

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

export default PrimaryButton;
