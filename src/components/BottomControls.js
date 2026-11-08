import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function PillButton({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.pill, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={18} color="#ffffff" />
      <Text style={styles.pillLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function BottomControls({
  isTracking,
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  gpsSimulated = false,
  onToggleGps,
  gpsPointsCount = 0,
  isDark = true,
}) {
  const bgColor = isDark ? 'rgba(11,17,29,0.9)' : 'rgba(255,255,255,0.92)';
  const borderC = isDark ? 'rgba(122,140,255,0.22)' : 'rgba(108,99,255,0.12)';

  const canUseAI = gpsPointsCount >= 10;
  const toggleLabel = canUseAI
    ? (gpsSimulated ? 'AI ON' : 'GPS')
    : 'AI needs 10 pts';
  const toggleIcon = canUseAI
    ? (gpsSimulated ? 'analytics' : 'navigate')
    : 'lock-closed';
  const toggleColor = canUseAI
    ? (gpsSimulated ? '#7c6cff' : '#5b647a')
    : '#334155';

  const handleTogglePress = () => {
    if (!canUseAI && !gpsSimulated) {
      Alert.alert(
        'AI Predictions',
        'AI needs at least 10 GPS points to start predicting. Keep walking to collect more points.'
      );
      return;
    }
    onToggleGps();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor: borderC }]}>
      {!isTracking && status === 'idle' && (
        <PillButton icon="play" label="Start" color="#6c63ff" onPress={onStart} />
      )}

      {isTracking && status === 'recording' && (
        <View style={styles.row}>
          <PillButton icon="pause" label="Pause" color="#f59e0b" onPress={onPause} />
          <PillButton
            icon={toggleIcon}
            label={toggleLabel}
            color={toggleColor}
            onPress={handleTogglePress}
          />
          <PillButton icon="stop" label="Stop" color="#ef4444" onPress={onStop} />
        </View>
      )}

      {!isTracking && status === 'paused' && (
        <View style={styles.row}>
          <PillButton icon="play" label="Resume" color="#6c63ff" onPress={onResume} />
          <PillButton icon="stop" label="Stop" color="#ef4444" onPress={onStop} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    zIndex: 50,
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    shadowColor: '#4738c9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    shadowColor: '#5d51ee',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  pillLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
