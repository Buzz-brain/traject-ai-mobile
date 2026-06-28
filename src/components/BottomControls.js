import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  isDark = true,
}) {
  const bgColor = isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)';
  const borderC = isDark ? 'rgba(51,65,85,0.4)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor: borderC }]}>
      {!isTracking && status === 'idle' && (
        <PillButton icon="play" label="Start" color="#10b981" onPress={onStart} />
      )}

      {isTracking && status === 'recording' && (
        <View style={styles.row}>
          <PillButton icon="pause" label="Pause" color="#f59e0b" onPress={onPause} />
          <PillButton icon="stop" label="Stop" color="#ef4444" onPress={onStop} />
        </View>
      )}

      {!isTracking && status === 'paused' && (
        <View style={styles.row}>
          <PillButton icon="play" label="Resume" color="#10b981" onPress={onResume} />
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
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  pillLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
