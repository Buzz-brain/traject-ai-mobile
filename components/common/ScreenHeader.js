/**
 * Screen Header Component
 * Used at the top of each screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../lib/store/themeContext';

/**
 * @typedef {Object} ScreenHeaderProps
 * @property {string} title
 * @property {string} [subtitle]
 * @property {import('react-native').StyleProp<import('react-native').ViewStyle>} [style]
 */

/**
 * ScreenHeader - Header for screens
 * @param {ScreenHeaderProps} props
 */
export function ScreenHeader({ 
  title, 
  subtitle,
  style = {},
}) {
  const { isDark } = useTheme();

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 18,
      paddingTop: 30,
      paddingBottom: 18,
      backgroundColor: isDark ? '#0f1522' : '#f9f8ff',
      borderBottomWidth: 0,
      ...style,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: isDark ? '#eef2ff' : '#17162a',
      letterSpacing: -0.8,
      marginBottom: subtitle ? 4 : 0,
    },
    subtitle: {
      fontSize: 13,
      color: isDark ? '#aab4c7' : '#595b75',
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
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
