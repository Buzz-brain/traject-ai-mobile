import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

interface Props {
  status: RecordingStatus;
  onStart: () => void;
  onAttemptStart?: () => void;
  onRecordAnyway?: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  startDisabled?: boolean;
  onOpenSessions?: () => void;
}

export function Controls({ status, onStart, onPause, onResume, onStop, onReset, startDisabled, onRecordAnyway, onOpenSessions }: Props) {
  return (
    <View style={styles.container}>
      {status === 'idle' && (
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.primaryButton, startDisabled ? styles.warn : undefined]}
            onPress={() => (startDisabled ? onRecordAnyway?.() : onStart())}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.buttonText}>{startDisabled ? 'Track Anyway' : 'Start Tracking'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'recording' && (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.pause]} onPress={onPause}>
            <Ionicons name="pause" size={18} color="#fff" />
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.stop]} onPress={onStop}>
            <Ionicons name="square" size={18} color="#fff" />
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'paused' && (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.resume]} onPress={onResume}>
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.stop]} onPress={onStop}>
            <Ionicons name="square" size={18} color="#fff" />
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'stopped' && (
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onReset}>
          <Ionicons name="reload" size={16} color="#fff" />
          <Text style={styles.buttonText}>New Session</Text>
        </TouchableOpacity>
      )}

      {onOpenSessions && (
        <TouchableOpacity style={styles.sessionsButton} onPress={onOpenSessions}>
          <Text style={styles.sessionsText}>Sessions</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#6b21a8',
    borderRadius: 20,
  },
  warn: { backgroundColor: '#f97316' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  pause: { backgroundColor: '#f59e0b' },
  stop: { backgroundColor: '#ef4444' },
  resume: { backgroundColor: '#10b981' },
  secondary: { backgroundColor: '#64748b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  buttonText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  sessionsButton: { position: 'absolute', right: 8, bottom: 8, backgroundColor: 'rgba(255,255,255,0.08)', padding: 8, borderRadius: 8 },
  sessionsText: { color: '#fff', fontSize: 12 }
});

export default Controls;
