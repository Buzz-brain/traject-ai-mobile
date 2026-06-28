import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  Animated,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/store/themeContext';
import { useSessionContext } from '../../lib/store/sessionContext';
import { useLocationTracking } from '../../lib/hooks/useLocationTracking';
import { useHybridTracking } from '../../lib/hooks/useHybridTracking';
import OSMMapView from '../../src/components/OSMMapView';
import MapOverlay from '../../src/components/MapOverlay';
import BottomControls from '../../src/components/BottomControls';
import { formatDistance, formatDuration } from '../../lib/utils/calculations';

export default function TrackerScreen() {
  const { isDark } = useTheme();
  const { createSession } = useSessionContext();
  const locationTracking = useLocationTracking();
  const hybridTracking = useHybridTracking();

  const [isTracking, setIsTracking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    locationTracking.requestPermission();
  }, []);

  useEffect(() => {
    if (isTracking) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    }
    }, [isTracking, pulseAnim]);

  const handleStartTracking = async () => {
    try {
      if (!locationTracking.permissionGranted) {
        const granted = await locationTracking.requestPermission();
        if (!granted) {
          Alert.alert('Permission', 'Location permission is required to track');
          return;
        }
      }

      const newSession = await createSession(
        `Track ${new Date().toLocaleTimeString()}`,
        'hybrid',
      );

      if (newSession?.sessionId) {
        locationTracking.setSession(newSession.sessionId);
        hybridTracking.setTrackingMode('gps_only');
        await locationTracking.startRecording();
        setIsTracking(true);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to start tracking: ${error.message}`);
    }
  };

  const handlePauseTracking = async () => {
    try {
      await locationTracking.pauseTracking();
      setIsTracking(false);
    } catch (error) {
      Alert.alert('Error', `Failed to pause tracking: ${error.message}`);
    }
  };

  const handleResumeTracking = async () => {
    try {
      await locationTracking.resumeTracking();
      setIsTracking(true);
    } catch (error) {
      Alert.alert('Error', `Failed to resume tracking: ${error.message}`);
    }
  };

  const handleStopTracking = async () => {
    try {
      await locationTracking.stopTracking();
      setIsTracking(false);
      const savedCount = gpsCount;
      Alert.alert(
        'Session Saved',
        `${savedCount} GPS points recorded`,
        [{ text: 'OK', onPress: () => locationTracking.reset() }],
      );
    } catch (error) {
      Alert.alert('Error', `Failed to stop tracking: ${error.message}`);
    }
  };

  const speed = locationTracking.currentSpeed || 0;
  const distFormatted = formatDistance(locationTracking.totalDistance);
  const durFormatted = formatDuration(locationTracking.duration);
  const accuracy = locationTracking.currentAccuracy;
  const gpsCount = locationTracking.points.length;
  const aiCount = hybridTracking.state.aiPointsCount;
  const confidence = hybridTracking.state.avgAiConfidence || 0;
  const mode = hybridTracking.state.mode;
  const gpsSignal = !isTracking
    ? (locationTracking.gpsReady || 'inactive')
    : accuracy != null
      ? accuracy <= 20 ? 'good' : accuracy <= 50 ? 'weak' : 'poor'
      : 'lost';

  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const statColor = isDark ? '#f1f5f9' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const surfaceColor = isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.9)';
  const borderColor = isDark ? 'rgba(51,65,85,0.5)' : 'rgba(0,0,0,0.06)';
  const speedColor = speed > 0 ? '#10b981' : mutedColor;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <OSMMapView
          points={locationTracking.points}
          currentPos={locationTracking.currentPos}
          predictedPoints={hybridTracking.state.predictedPoints}
          showPredicted={hybridTracking.state.predictedPoints.length > 0}
        />
        <MapOverlay
          mode={mode}
          signal={gpsSignal}
          gpsPoints={gpsCount}
          aiPoints={aiCount}
          accuracy={accuracy}
          isTracking={isTracking}
          isDark={isDark}
        />
      </View>

      {/* Stats Panel */}
      <ScrollView
        style={[styles.statsPanel, { backgroundColor: bgColor }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Speed Gauge */}
        <View style={styles.speedSection}>
          <Text style={[styles.speedValue, { color: speedColor }]}>
            {speed.toFixed(1)}
          </Text>
          <Text style={[styles.speedUnit, { color: mutedColor }]}>meters per second</Text>
        </View>

        {/* Distance & Duration */}
        <View style={[styles.metricRow, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: statColor }]}>{distFormatted}</Text>
            <Text style={[styles.metricLabel, { color: mutedColor }]}>Distance</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: borderColor }]} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: statColor }]}>{durFormatted}</Text>
            <Text style={[styles.metricLabel, { color: mutedColor }]}>Duration</Text>
          </View>
        </View>

        {/* Detail Toggle */}
        <TouchableOpacity
          style={[styles.detailsToggle, { borderColor }]}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.7}
        >
          <Text style={[styles.detailsToggleText, { color: mutedColor }]}>
            {showDetails ? 'Hide details' : 'Show details'}
          </Text>
          <Ionicons
            name={showDetails ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={mutedColor}
          />
        </TouchableOpacity>

        {showDetails && (
          <View style={styles.detailGrid}>
            {[
              { icon: 'navigate' , iconColor: '#3b82f6', value: accuracy ? `${accuracy.toFixed(1)} m` : '—', label: 'Accuracy' },
              { icon: 'locate'  , iconColor: '#10b981', value: `${gpsCount}`, label: 'GPS Points' },
              { icon: 'analytics', iconColor: '#a855f7', value: `${aiCount}`, label: 'AI Points' },
              { icon: 'shield-checkmark', iconColor: '#f59e0b', value: `${Math.round(confidence * 100)}%`, label: 'Confidence' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.detailCard, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name={item.icon} size={14} color={item.iconColor} />
                <Text style={[styles.detailValue, { color: statColor }]}>{item.value}</Text>
                <Text style={[styles.detailLabel, { color: mutedColor }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* GPS activation prompt */}
        {!isTracking && locationTracking.gpsReady === 'unavailable' && (
          <View style={[styles.gpsPrompt, { backgroundColor: surfaceColor, borderColor }]}>
            <Ionicons name="locate-outline" size={22} color="#ef4444" />
            <Text style={[styles.gpsPromptTitle, { color: statColor }]}>GPS not available</Text>
            <Text style={[styles.gpsPromptDesc, { color: mutedColor }]}>
              Location services are off. Enable GPS to use this app.
            </Text>
            <View style={styles.gpsPromptRow}>
              <TouchableOpacity
                style={[styles.gpsBtn, { backgroundColor: '#3b82f6' }]}
                onPress={() => {
                  if (Platform.OS === 'android') {
                    Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() =>
                      Linking.openSettings()
                    );
                  } else {
                    Linking.openSettings();
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="settings-outline" size={16} color="#fff" />
                <Text style={styles.gpsBtnLabel}>Open Location Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gpsBtn, { backgroundColor: '#334155' }]}
                onPress={locationTracking.warmupGps}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.gpsBtnLabel}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status */}
        <View style={styles.statusRow}>
          {isTracking && (
            <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
          )}
          <Text style={[styles.statusText, { color: mutedColor }]}>
            {isTracking
              ? `Recording ${gpsCount} GPS · ${aiCount} AI`
              : locationTracking.gpsReady === 'warming'
                ? 'Acquiring GPS…'
                : locationTracking.permissionGranted
                  ? 'Ready to track'
                  : 'Location access required'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Controls */}
      <BottomControls
        isTracking={isTracking}
        status={locationTracking.status}
        onStart={handleStartTracking}
        onPause={handlePauseTracking}
        onResume={handleResumeTracking}
        onStop={handleStopTracking}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: '50%',
  },
  statsPanel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  speedSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  speedValue: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  speedUnit: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: -6,
  },
  metricRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricDivider: {
    width: 1,
    height: 32,
    alignSelf: 'center',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
    borderBottomWidth: 1,
    gap: 6,
  },
  detailsToggleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  detailCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  gpsPrompt: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 14,
    alignItems: 'center',
    gap: 6,
  },
  gpsPromptTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  gpsPromptDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  gpsPromptRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  gpsBtnLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
