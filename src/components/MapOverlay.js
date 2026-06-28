import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function signalColor(signal) {
  switch (signal) {
    case 'good':       return '#10b981';
    case 'weak':       return '#f59e0b';
    case 'poor':       return '#ef4444';
    case 'warming':    return '#3b82f6';
    case 'unavailable': return '#6b7280';
    case 'inactive':   return '#6b7280';
    default:           return '#6b7280';
  }
}

function signalLabel(signal) {
  switch (signal) {
    case 'inactive':   return '—';
    case 'warming':    return 'Acquiring…';
    case 'unavailable': return 'Unavailable';
    default:           return signal.charAt(0).toUpperCase() + signal.slice(1);
  }
}

function modeLabel(mode) {
  switch (mode) {
    case 'gps_only': return 'GPS';
    case 'ai_only':  return 'AI';
    case 'hybrid':   return 'HYBRID';
    default:         return 'UNKNOWN';
  }
}

function modeColor(mode) {
  switch (mode) {
    case 'gps_only': return '#10b981';
    case 'ai_only':  return '#a855f7';
    case 'hybrid':   return '#3b82f6';
    default:         return '#6b7280';
  }
}

export default function MapOverlay({
  mode = 'gps_only',
  signal = 'good',
  gpsPoints = 0,
  aiPoints = 0,
  accuracy = null,
  isTracking = false,
  isDark = true,
}) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={[styles.card, { backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)' }]}>
        {/* Row 1: Signal + Mode */}
        <View style={styles.topRow}>
          <View style={styles.signalRow}>
            <View style={[styles.signalDot, { backgroundColor: signalColor(signal) }]} />
            <Text style={[styles.signalText, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>
              {signalLabel(signal)}
            </Text>
          </View>
          <View style={[styles.modeBadge, { backgroundColor: modeColor(mode) }]}>
            <Text style={styles.modeText}>{modeLabel(mode)}</Text>
          </View>
        </View>

        {/* Row 2: Points + Accuracy */}
        <View style={styles.bottomRow}>
          <View style={styles.statItem}>
            <Ionicons name="locate" size={11} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.statText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
              {gpsPoints} pts
            </Text>
            {aiPoints > 0 && (
              <Text style={[styles.statText, { color: '#a855f7' }]}>
                · {aiPoints} AI
              </Text>
            )}
          </View>
          <View style={styles.statItem}>
            <Ionicons name="navigate" size={11} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.statText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
              {accuracy != null ? `${accuracy.toFixed(1)} m` : '—'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 20,
  },
  card: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  signalText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
