import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type TrackingMode = 'gps_only' | 'ai_only' | 'hybrid';
export type GpsSignalQuality = 'good' | 'weak' | 'poor' | 'lost';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';

interface Props {
  mode: TrackingMode;
  gpsSignal: GpsSignalQuality;
  confidence: ConfidenceLevel;
  isTracking: boolean;
  gpsPoints: number;
  predictionActive: boolean;
  accuracy?: number | null;
}

export function SystemIndicators({ mode, gpsSignal, confidence, isTracking, gpsPoints, predictionActive, accuracy }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.badge}><Text style={styles.badgeText}>{mode.replace('_', ' ').toUpperCase()}</Text></View>
        <View style={styles.badge}><Text style={styles.badgeText}>{gpsSignal.toUpperCase()}</Text></View>
      </View>

      <View style={styles.rowSpace}>
        <Text style={styles.small}>{isTracking ? 'Tracking Active' : 'Tracking Inactive'}</Text>
        <Text style={styles.small}>{gpsPoints} points</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.metric}><Text style={styles.metricLabel}>Accuracy</Text><Text style={styles.metricValue}>{accuracy != null ? `${accuracy.toFixed(1)}m` : 'N/A'}</Text></View>
        <View style={styles.metric}><Text style={styles.metricLabel}>Confidence</Text><Text style={styles.metricValue}>{confidence.toUpperCase()}</Text></View>
      </View>

      {predictionActive && <View style={styles.pred}><Text style={styles.predText}>AI Prediction Active</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#e6eef8' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  small: { fontSize: 12, color: '#cbd5e1' },
  metric: { flex: 1 },
  metricLabel: { fontSize: 11, color: '#94a3b8' },
  metricValue: { fontSize: 14, fontWeight: '700' },
  pred: { marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: '#f3e8ff' },
  predText: { color: '#6b21a8', fontWeight: '700' }
});

export default SystemIndicators;
