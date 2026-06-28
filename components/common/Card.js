/**
 * Card Component
 * Reusable card for displaying content sections
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../lib/store/themeContext';

/**
 * @typedef {Object} CardProps
 * @property {React.ReactNode} children
 * @property {import('react-native').StyleProp<import('react-native').ViewStyle>} [style]
 * @property {() => void} [onPress]
 * @property {number} [activeOpacity]
 */

/**
 * Card - Generic card container
 * @param {CardProps} props
 */
export function Card({ 
  children, 
  style = {},
  onPress,
  activeOpacity = 0.7,
}) {
  const { isDark } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#2d3748' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 3,
      elevation: 3,
      ...style,
    },
  });

  if (onPress) {
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}

export default Card;
