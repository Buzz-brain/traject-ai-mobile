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
      backgroundColor: isDark ? '#151d2b' : '#ffffff',
      borderRadius: 22,
      padding: 18,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#243041' : '#f0edff',
      shadowColor: '#4738c9',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 16,
      elevation: 4,
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
