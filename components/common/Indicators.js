/**
 * Indicator Components
 * Display status indicators for GPS, mode, confidence, etc.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/store/themeContext';

/**
 * GPSSignalIndicator - Show GPS signal quality
 */
export function GPSSignalIndicator({ signal = 'good' }) {
  const { isDark } = useTheme();

  const getColor = () => {
    switch (signal) {
      case 'good':
        return '#10b981';
      case 'weak':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      case 'lost':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getIcon = () => {
    switch (signal) {
      case 'good':
        return 'cellular';
      case 'weak':
        return 'cellular';
      case 'poor':
        return 'cellular';
      case 'lost':
        return 'ban';
      default:
        return 'ban';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: isDark ? '#2d3748' : '#f3f4f6',
      borderWidth: 1,
      borderColor: getColor(),
    },
    icon: {
      marginRight: 6,
    },
    text: {
      fontSize: 12,
      fontWeight: '600',
      color: getColor(),
      textTransform: 'capitalize',
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons 
        name={getIcon()} 
        size={14} 
        color={getColor()}
        style={styles.icon}
      />
      <Text style={styles.text}>{signal}</Text>
    </View>
  );
}

/**
 * ModeIndicator - Show tracking mode
 */
export function ModeIndicator({ mode = 'gps_only' }) {
  const { isDark } = useTheme();

  const getColor = () => {
    switch (mode) {
      case 'gps_only':
        return '#10b981';
      case 'ai_only':
        return '#a855f7';
      case 'hybrid':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getLabel = () => {
    switch (mode) {
      case 'gps_only':
        return 'GPS';
      case 'ai_only':
        return 'AI';
      case 'hybrid':
        return 'Hybrid';
      default:
        return 'Unknown';
    }
  };

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: isDark ? '#2d3748' : '#f3f4f6',
      borderWidth: 2,
      borderColor: getColor(),
    },
    text: {
      fontSize: 12,
      fontWeight: '700',
      color: getColor(),
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{getLabel()}</Text>
    </View>
  );
}

/**
 * ConfidenceIndicator - Show AI confidence level
 */
export function ConfidenceIndicator({ confidence = 0, size = 'small' }) {
  const { isDark } = useTheme();

  const getColor = () => {
    if (confidence >= 0.75) return '#10b981';
    if (confidence >= 0.5) return '#f59e0b';
    if (confidence > 0) return '#ef4444';
    return '#6b7280';
  };

  const getPercentage = () => Math.round(confidence * 100);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: isDark ? '#2d3748' : '#f3f4f6',
    },
    bar: {
      width: size === 'small' ? 40 : 60,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? '#4b5563' : '#d1d5db',
      marginRight: 8,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: getColor(),
      borderRadius: 2,
    },
    text: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? '#d1d5db' : '#4b5563',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View 
          style={[
            styles.fill, 
            { width: `${getPercentage()}%` }
          ]} 
        />
      </View>
      <Text style={styles.text}>{getPercentage()}%</Text>
    </View>
  );
}

export default {
  GPSSignalIndicator,
  ModeIndicator,
  ConfidenceIndicator,
};
