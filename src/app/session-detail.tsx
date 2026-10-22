import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../lib/store/themeContext';
import { useSessionContext } from '../../lib/store/sessionContext';
import {
  PrimaryButton,
  SecondaryButton,
  Card,
  StatGrid,
} from '../../components/common';
import OSMMapView from '../components/OSMMapView';
import {
  calculateSessionStats,
  formatSessionDate,
  formatDistance,
  formatDuration,
  formatSpeed,
} from '../../lib/utils/calculations';
import { 
  exportSessionAsJSON, 
  exportSessionAsCSV, 
  exportSessionAsGPX 
} from '../../lib/services/exportService';

export default function SessionDetailScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { sessions } = useSessionContext();
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    if (sessionId && typeof sessionId === 'string') {
      const found = sessions.find((s: any) => s.sessionId === sessionId);
      setSession(found || null);
    }
  }, [sessionId, sessions]);

  if (!session) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>Session not found</Text>
      </View>
    );
  }

  const stats = calculateSessionStats(session.points || []);
  const points = (session.points || []) as Array<{source?: string; [key: string]: any}>;
  
  // Separate GPS and AI predicted points
  const gpsPoints = points.filter((p: any) => p.source === 'gps' || !p.source);
  const aiPoints = points.filter((p: any) => p.source === 'ai');
  const hasAiPoints = aiPoints.length > 0;

  const statData = [
    { label: 'Distance', value: formatDistance(stats.distance), unit: 'km', color: isDark ? '#10b981' : '#059669' },
    { label: 'Duration', value: formatDuration(stats.duration), unit: 'h', color: isDark ? '#3b82f6' : '#2563eb' },
    { label: 'Avg Speed', value: formatSpeed(stats.avgSpeed), unit: 'm/s', color: isDark ? '#f59e0b' : '#d97706' },
    { label: 'GPS Points', value: String(gpsPoints.length), unit: 'pts', color: isDark ? '#10b981' : '#059669' },
    ...(hasAiPoints ? [{ label: 'AI Points', value: String(aiPoints.length), unit: 'pts', color: isDark ? '#a855f7' : '#9333ea' }] : []),
  ];

  const handleExport = async (format: 'json' | 'csv' | 'gpx') => {
    try {
      if (!session || !session.points) {
        Alert.alert('Error', 'No session data available');
        return;
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      const sessionName = (session.sessionName || `session_${session.sessionId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');

      // Generate file content based on format
      if (format === 'json') {
        const exported = exportSessionAsJSON(session);
        content = JSON.stringify(exported, null, 2);
        filename = `${sessionName}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        content = exportSessionAsCSV(session);
        filename = `${sessionName}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'gpx') {
        content = exportSessionAsGPX(session);
        filename = `${sessionName}.gpx`;
        mimeType = 'application/gpx+xml';
      } else {
        Alert.alert('Error', 'Invalid export format');
        return;
      }

      // Write to file system using DocumentDirectory
      const documentDir = FileSystem.documentDirectory || '';
      const fileUri = `${documentDir}${filename}`;
      
      console.log('[SessionDetail] Exporting to:', fileUri);
      console.log('[SessionDetail] Content length:', content.length);
      
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('[SessionDetail] File written successfully');

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        console.log('[SessionDetail] Sharing file...');
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export Session as ${format.toUpperCase()}`,
        });
      } else {
        Alert.alert('Success', `File saved to:\n${fileUri}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[SessionDetail] Export error:', message, error);
      Alert.alert('Export Error', `Failed to export: ${message}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b1220' : '#f8fafc' }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={isDark ? '#e5e7eb' : '#0f172a'}
            />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{session.sessionName}</Text>
            <Text style={styles.subtitle}>{formatSessionDate(session.createdAt)}</Text>
          </View>
          <View style={styles.headerActions}>
            <SecondaryButton label="Share" onPress={() => handleExport('json')} />
          </View>
        </View>

        {/* Hero map */}
        {points.length > 0 && (
          <View style={styles.mapHero}>
            <OSMMapView 
              points={gpsPoints as any} 
              predictedPoints={aiPoints as any}
              showPredicted={hasAiPoints}
            />
          </View>
        )}

        {/* KPI row */}
        <View style={styles.kpiRow}>
          <StatGrid stats={statData} />
        </View>

        {/* Timeline / chart placeholder */}
        <Card style={[styles.card, styles.timelineCard]}>
          <Text style={styles.sectionTitle}>Speed / Accuracy Timeline</Text>
          <View style={styles.timelinePlaceholder} />
        </Card>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <PrimaryButton label="Export JSON" onPress={() => handleExport('json')} variant="success" />
          <SecondaryButton label="Export CSV" onPress={() => handleExport('csv')} />
          <SecondaryButton label="Export GPX" onPress={() => handleExport('gpx')} />
        </View>

        {/* Details accordion */}
        <Card style={[styles.card, styles.detailsCard]}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Total Points</Text>
            <Text style={styles.detailValue}>{points.length}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Avg Accuracy</Text>
            <Text style={styles.detailValue}>{(stats.avgAccuracy || 0).toFixed(1)} m</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Avg AI Confidence</Text>
            <Text style={styles.detailValue}>{(stats.avgAiConfidence || 0).toFixed(2)}</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  backButton: {
    paddingVertical: 4,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mapHero: {
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  kpiRow: {
    marginBottom: 12,
  },
  timelineCard: {
    padding: 12,
  },
  timelinePlaceholder: {
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  detailsCard: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0f172a',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    fontWeight: '700',
    color: '#0f172a',
  },
  buttonGroup: {
    gap: 10,
  },
});
