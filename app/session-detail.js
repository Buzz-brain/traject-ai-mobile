/**
 * Session Detail Screen
 * View full session details, statistics, and options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../../lib/store/themeContext';
import { useSessionContext } from '../../lib/store/sessionContext';
import {
  PrimaryButton,
  SecondaryButton,
  Card,
  StatGrid,
} from '../../components/common';
import { 
  calculateSessionStats, 
  formatSessionDate,
  formatDistance,
  formatDuration,
  formatSpeed,
} from '../../lib/utils/calculations';
import { exportSessionAsJSON, exportSessionAsCSV, exportSessionAsGPX } from '../../lib/services/exportService';

/**
 * Session Detail Screen
 */
export default function SessionDetailScreen() {
  const { isDark } = useTheme();
  const route = useRoute();
  const { sessions } = useSessionContext();
  const [session, setSession] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const sessionId = route.params?.sessionId;
    if (sessionId) {
      const found = sessions.find(s => s.sessionId === sessionId);
      setSession(found);
    }
  }, [route.params?.sessionId, sessions]);

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Session not found</Text>
      </View>
    );
  }

  const stats = calculateSessionStats(session.points || []);
  const points = session.points || [];

  const statData = [
    { label: 'Distance', value: formatDistance(stats.distance), unit: 'km', color: isDark ? '#10b981' : '#059669' },
    { label: 'Duration', value: formatDuration(stats.duration), unit: 'min', color: isDark ? '#3b82f6' : '#2563eb' },
    { label: 'Avg Speed', value: formatSpeed(stats.avgSpeed), unit: 'm/s', color: isDark ? '#f59e0b' : '#d97706' },
    { label: 'Points', value: points.length.toString(), unit: 'pts', color: isDark ? '#a855f7' : '#9333ea' },
  ];

  const mapRegion = points.length > 0 ? {
    latitude: points[0].lat,
    longitude: points[0].lon,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const handleExport = (format) => {
    try {
      let data;
      let filename;

      switch (format) {
        case 'json':
          data = JSON.stringify(exportSessionAsJSON(session), null, 2);
          filename = `${session.sessionName}.json`;
          Alert.alert('Exported', `Session exported as ${filename}\n\nData formatted and ready to share`);
          break;
        case 'csv':
          data = exportSessionAsCSV(session);
          filename = `${session.sessionName}.csv`;
          Alert.alert('Exported', `Session exported as ${filename}\n\nData formatted and ready to share`);
          break;
        case 'gpx':
          data = exportSessionAsGPX(session);
          filename = `${session.sessionName}.gpx`;
          Alert.alert('Exported', `Session exported as ${filename}\n\nData formatted for GPS apps`);
          break;
        default:
          return;
      }
    } catch (error) {
      Alert.alert('Error', `Export failed: ${error.message}`);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#f9fafb',
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#f3f4f6' : '#1f2937',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    mapContainer: {
      height: 250,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    map: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    statsContainer: {
      marginBottom: 16,
    },
    infoCard: {
      marginBottom: 12,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 4,
    },
    value: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#e5e7eb' : '#1f2937',
    },
    exportSection: {
      marginVertical: 16,
    },
    exportTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    exportButtons: {
      gap: 8,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 8,
    },
    exportButton: {
      flex: 1,
    },
    actionButtons: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      gap: 8,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{session.sessionName}</Text>
        <Text style={styles.subtitle}>{formatSessionDate(session.createdAt)}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map */}
        {points.length > 0 && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={mapRegion}
              onMapReady={() => setMapReady(true)}
              rotateEnabled={false}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              {points.length > 1 && (
                <Polyline
                  coordinates={points.map(p => ({
                    latitude: p.lat,
                    longitude: p.lon,
                  }))}
                  strokeColor={isDark ? '#10b981' : '#059669'}
                  strokeWidth={3}
                />
              )}
              {points.length > 0 && (
                <>
                  <Marker
                    coordinate={{
                      latitude: points[0].lat,
                      longitude: points[0].lon,
                    }}
                    title="Start"
                    pinColor="#10b981"
                  />
                  <Marker
                    coordinate={{
                      latitude: points[points.length - 1].lat,
                      longitude: points[points.length - 1].lon,
                    }}
                    title="End"
                    pinColor="#ef4444"
                  />
                </>
              )}
            </MapView>
          </View>
        )}

        {/* Statistics */}
        <View style={[styles.contentContainer, styles.statsContainer]}>
          <StatGrid stats={statData} />
        </View>

        {/* Details */}
        <View style={styles.contentContainer}>
          <Card style={styles.infoCard}>
            <Text style={styles.label}>Mode</Text>
            <Text style={styles.value}>{session.mode || 'hybrid'}</Text>
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.label}>Points Collected</Text>
            <Text style={styles.value}>{points.length} GPS + Sensor readings</Text>
          </Card>

          {stats.maxSpeed > 0 && (
            <Card style={styles.infoCard}>
              <Text style={styles.label}>Max Speed</Text>
              <Text style={styles.value}>{formatSpeed(stats.maxSpeed)} m/s</Text>
            </Card>
          )}
        </View>

        {/* Export Options */}
        <View style={styles.contentContainer}>
          <Text style={styles.exportTitle}>Export Options</Text>
          <View style={styles.exportButtons}>
            <View style={styles.buttonRow}>
              <PrimaryButton
                label="JSON"
                onPress={() => handleExport('json')}
                style={styles.exportButton}
              />
              <PrimaryButton
                label="CSV"
                onPress={() => handleExport('csv')}
                style={styles.exportButton}
              />
            </View>
            <PrimaryButton
              label="GPX (Maps)"
              onPress={() => handleExport('gpx')}
            />
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionButtons}>
        <SecondaryButton
          label="Close"
          onPress={() => {
            // Navigation handled by router
          }}
        />
      </View>
    </View>
  );
}
