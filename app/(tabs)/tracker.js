/**
 * Tracker Screen - GPS Tracking Interface
 * Main screen for recording and monitoring GPS tracks
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  SafeAreaView,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useTheme } from '../../lib/store/themeContext';
import { useSessionContext } from '../../lib/store/sessionContext';
import { useLocationTracking } from '../../lib/hooks/useLocationTracking';
import { useHybridTracking } from '../../lib/hooks/useHybridTracking';
import {
  PrimaryButton,
  GPSSignalIndicator,
  ModeIndicator,
  ConfidenceIndicator,
  StatGrid,
} from '../../components/common';
import { formatDistance, formatDuration } from '../../lib/utils/calculations';

/**
 * Tracker Screen
 */
export default function TrackerScreen() {
  const { isDark } = useTheme();
  const { createSession } = useSessionContext();
  const locationTracking = useLocationTracking();
  const hybridTracking = useHybridTracking();
  const mapRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Request location permission on mount
  useEffect(() => {
    locationTracking.requestPermission();
  }, []);

  // Center map on current position
  useEffect(() => {
    if (!mapReady || !locationTracking.currentPos) return;

    mapRef.current?.animateToRegion({
      latitude: locationTracking.currentPos.lat,
      longitude: locationTracking.currentPos.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [locationTracking.currentPos, mapReady]);

  const handleStartTracking = async () => {
    try {
      // Check permission
      if (!locationTracking.permissionGranted) {
        const granted = await locationTracking.requestPermission();
        if (!granted) {
          Alert.alert('Permission', 'Location permission is required to track');
          return;
        }
      }

      // Create new session
      const newSession = await createSession(
        `Track ${new Date().toLocaleTimeString()}`,
        'hybrid'
      );

      if (newSession?.sessionId) {
        setSessionId(newSession.sessionId);
        locationTracking.setSession(newSession.sessionId);
        hybridTracking.setTrackingMode('gps_only');

        // Start tracking
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
      Alert.alert('Success', `Tracking session saved with ${locationTracking.points.length} points`);
    } catch (error) {
      Alert.alert('Error', `Failed to stop tracking: ${error.message}`);
    }
  };

  const allPoints = [
    ...locationTracking.points,
    ...hybridTracking.state.predictedPoints,
  ];

  const mapRegion = locationTracking.currentPos ? {
    latitude: locationTracking.currentPos.lat,
    longitude: locationTracking.currentPos.lon,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  } : {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const stats = [
    {
      label: 'Distance',
      value: formatDistance(locationTracking.totalDistance),
      unit: 'km',
      color: isDark ? '#10b981' : '#059669',
    },
    {
      label: 'Duration',
      value: formatDuration(locationTracking.duration),
      unit: 'min',
      color: isDark ? '#3b82f6' : '#2563eb',
    },
    {
      label: 'Speed',
      value: locationTracking.currentSpeed.toFixed(1),
      unit: 'm/s',
      color: isDark ? '#f59e0b' : '#d97706',
    },
    {
      label: 'Accuracy',
      value: locationTracking.currentAccuracy?.toFixed(1) || '—',
      unit: 'm',
      color: isDark ? '#a855f7' : '#9333ea',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#f9fafb',
    },
    mapContainer: {
      height: '45%',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
    },
    map: {
      flex: 1,
    },
    statsContainer: {
      padding: 16,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
    },
    indicatorsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 8,
    },
    indicator: {
      flex: 1,
    },
    statGridContainer: {
      marginBottom: 16,
    },
    controlsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      gap: 8,
    },
    rowControls: {
      flexDirection: 'row',
      gap: 8,
    },
    flexButton: {
      flex: 1,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      paddingVertical: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          region={mapReady ? mapRegion : undefined}
          onMapReady={() => setMapReady(true)}
          showsUserLocation
          followsUserLocation={isTracking}
          rotateEnabled={false}
        >
          {/* GPS Points */}
          {locationTracking.points.length > 0 && (
            <Polyline
              coordinates={locationTracking.points.map(p => ({
                latitude: p.lat,
                longitude: p.lon,
              }))}
              strokeColor={isDark ? '#10b981' : '#059669'}
              strokeWidth={3}
            />
          )}

          {/* Predicted Points */}
          {hybridTracking.state.predictedPoints.length > 0 && (
            <Polyline
              coordinates={hybridTracking.state.predictedPoints.map(p => ({
                latitude: p.lat,
                longitude: p.lon,
              }))}
              strokeColor={isDark ? '#a855f7' : '#9333ea'}
              strokeWidth={2}
              lineDashPattern={[10]}
            />
          )}

          {/* Current position marker */}
          {locationTracking.currentPos && (
            <Marker
              coordinate={{
                latitude: locationTracking.currentPos.lat,
                longitude: locationTracking.currentPos.lon,
              }}
              title="Current Position"
              pinColor={isDark ? '#10b981' : '#059669'}
            />
          )}
        </MapView>
      </View>

      {/* Stats and Controls */}
      <ScrollView style={styles.statsContainer} showsVerticalScrollIndicator={false}>
        {/* Indicators */}
        <View style={styles.indicatorsRow}>
          <View style={styles.indicator}>
            <GPSSignalIndicator signal={locationTracking.currentAccuracy ? 
              (locationTracking.currentAccuracy <= 20 ? 'good' : 'weak') 
              : 'lost'} 
            />
          </View>
          <View style={styles.indicator}>
            <ModeIndicator mode={hybridTracking.state.mode} />
          </View>
          <View style={styles.indicator}>
            <ConfidenceIndicator 
              confidence={hybridTracking.state.avgAiConfidence}
              size="small"
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statGridContainer}>
          <StatGrid stats={stats} />
        </View>

        {/* Status */}
        <Text style={styles.statusText}>
          {isTracking 
            ? `Recording • ${locationTracking.points.length} GPS + ${hybridTracking.state.aiPointsCount} AI points`
            : 'Not tracking'}
        </Text>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {!isTracking && locationTracking.status === 'idle' && (
          <PrimaryButton
            label="Start Tracking"
            onPress={handleStartTracking}
            variant="success"
          />
        )}

        {isTracking && locationTracking.status === 'recording' && (
          <View style={styles.rowControls}>
            <PrimaryButton
              label="Pause"
              onPress={handlePauseTracking}
              variant="warning"
              style={styles.flexButton}
            />
            <PrimaryButton
              label="Stop"
              onPress={handleStopTracking}
              variant="danger"
              style={styles.flexButton}
            />
          </View>
        )}

        {!isTracking && locationTracking.status === 'paused' && (
          <View style={styles.rowControls}>
            <PrimaryButton
              label="Resume"
              onPress={handleResumeTracking}
              variant="success"
              style={styles.flexButton}
            />
            <PrimaryButton
              label="Stop"
              onPress={handleStopTracking}
              variant="danger"
              style={styles.flexButton}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
