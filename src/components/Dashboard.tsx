import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDistance, formatSpeed, formatDuration } from '../lib/utils';
import SystemIndicators, { type TrackingMode, type GpsSignalQuality, type ConfidenceLevel } from './SystemIndicators';

interface Props {
  pointsCount: number;
  totalDistance: number;
  currentSpeed: number;
  duration: number;
  currentPos: { lat: number; lon: number } | null;
  currentAccuracy?: number | null;
  trackingMode?: TrackingMode;
  gpsSignal?: GpsSignalQuality;
  confidence?: ConfidenceLevel;
  isTracking?: boolean;
  predictionActive?: boolean;
  gpsPointsCount?: number;
  aiPointsCount?: number;
  onExplain?: () => void;
}

export function Dashboard({ pointsCount, totalDistance, currentSpeed, duration, currentPos, currentAccuracy, trackingMode = 'gps_only', gpsSignal = 'good', confidence = 'unknown', isTracking = false, predictionActive = false, gpsPointsCount = 0, aiPointsCount = 0 }: Props) {
  const renderBadge = () => {
    if (typeof currentAccuracy !== 'number') return null;
    const isPoor = currentAccuracy > 50;
    const isWeak = !isPoor && currentAccuracy > 20;
    const label = isPoor ? 'Poor GPS Signal' : isWeak ? 'Weak GPS' : 'Good GPS';
    return <Text style={styles.badge}>{label}</Text>;
  };

  return (
    <View style={styles.container}>
      <SystemIndicators mode={trackingMode} gpsSignal={gpsSignal} confidence={confidence} isTracking={isTracking} gpsPoints={pointsCount} predictionActive={predictionActive} accuracy={currentAccuracy} />
      {renderBadge()}

      <View style={styles.grid}>
        <View style={styles.card}><Text style={styles.label}>Points</Text><Text style={styles.value}>{pointsCount}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Distance</Text><Text style={styles.value}>{formatDistance(totalDistance)}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Speed</Text><Text style={styles.value}>{formatSpeed(currentSpeed)}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{formatDuration(duration)}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Latitude</Text><Text style={styles.value}>{currentPos ? currentPos.lat.toFixed(6) : '—'}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Longitude</Text><Text style={styles.value}>{currentPos ? currentPos.lon.toFixed(6) : '—'}</Text></View>
      </View>

      {(gpsPointsCount > 0 || aiPointsCount > 0) && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Hybrid System Breakdown</Text>
          <View style={styles.breakRow}>
            <View style={styles.breakCard}><Text style={styles.smallLabel}>GPS Points</Text><Text style={styles.breakValue}>{gpsPointsCount}</Text></View>
            <View style={styles.breakCard}><Text style={styles.smallLabel}>AI Points</Text><Text style={styles.breakValue}>{aiPointsCount}</Text></View>
          </View>
        </View>
      )}

      {predictionActive && <View style={styles.pred}><Text style={styles.predText}>AI model is predicting your trajectory</Text></View>}

      {confidence !== 'unknown' && <Text style={styles.center}>Prediction Confidence: {confidence.toUpperCase()}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 8 },
  badge: { marginVertical: 8, padding: 8, borderRadius: 8, backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  card: { width: '48%', padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 8 },
  label: { fontSize: 12, color: '#94a3b8' },
  value: { fontSize: 16, fontWeight: '700' },
  breakdown: { marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: 'rgba(243,244,246,0.04)' },
  breakdownTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  breakRow: { flexDirection: 'row', gap: 8 },
  breakCard: { flex: 1, padding: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.02)' },
  smallLabel: { fontSize: 11, color: '#94a3b8' },
  breakValue: { fontSize: 16, fontWeight: '700' },
  pred: { marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: '#f3e8ff' },
  predText: { color: '#6b21a8', fontWeight: '700' },
  center: { textAlign: 'center', marginTop: 8 }
});

export default Dashboard;
