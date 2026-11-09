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
    { label: 'Distance', value: formatDistance(stats.distance), unit: 'km', color: isDark ? '#8b5cf6' : '#6c63ff' },
    { label: 'Duration', value: formatDuration(stats.duration), unit: 'h', color: isDark ? '#60a5fa' : '#2563eb' },
    { label: 'Avg Speed', value: formatSpeed(stats.avgSpeed), unit: 'm/s', color: isDark ? '#fbbf24' : '#d97706' },
    { label: 'GPS Points', value: String(gpsPoints.length), unit: 'pts', color: isDark ? '#34d399' : '#10b981' },
    ...(hasAiPoints ? [{ label: 'AI Points', value: String(aiPoints.length), unit: 'pts', color: isDark ? '#c084fc' : '#9333ea' }] : []),
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
    <View style={[styles.container, { backgroundColor: isDark ? '#0c1220' : '#f5f3ff' }]}>
      <ScrollView contentContainerStyle={styles.content}>
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
              color={isDark ? '#edf2ff' : '#17162a'}
            />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: isDark ? '#edf2ff' : '#17162a' }]}>{session.sessionName}</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#aab5ca' : '#5f6078' }]}>{formatSessionDate(session.createdAt)}</Text>
          </View>
          <View style={styles.headerActions}>
            <SecondaryButton label="Share" onPress={() => handleExport('json')} />
          </View>
        </View>

        {points.length > 0 && (
          <View style={[styles.mapHero, { borderColor: isDark ? '#212e41' : '#e9e5ff' }]}>
            <OSMMapView 
              points={gpsPoints as any} 
              predictedPoints={aiPoints as any}
              showPredicted={hasAiPoints}
            />
          </View>
        )}

        <View style={styles.kpiRow}>
          <StatGrid stats={statData} />
        </View>

        <Card style={[styles.card, styles.timelineCard, { backgroundColor: isDark ? '#121b2d' : '#ffffff', borderColor: isDark ? '#1f2b3d' : '#eee9ff', borderRadius: 24 }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#edf2ff' : '#17162a' }]}>Speed / Accuracy Timeline</Text>
          <View style={[styles.timelinePlaceholder, { backgroundColor: isDark ? '#1a2332' : '#f2f1ff' }]} />
        </Card>

        <View style={styles.actionsRow}>
          <PrimaryButton label="Export JSON" onPress={() => handleExport('json')} variant="success" />
          <SecondaryButton label="Export CSV" onPress={() => handleExport('csv')} />
          <SecondaryButton label="Export GPX" onPress={() => handleExport('gpx')} />
        </View>

        <Card style={[styles.card, styles.detailsCard, { backgroundColor: isDark ? '#121b2d' : '#ffffff', borderColor: isDark ? '#1f2b3d' : '#eee9ff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#edf2ff' : '#17162a' }]}>Details</Text>
          <View style={styles.detailsRow}>
            <Text style={[styles.detailLabel, { color: isDark ? '#afbcd6' : '#5f6078' }]}>Total Points</Text>
            <Text style={[styles.detailValue, { color: isDark ? '#edf2ff' : '#17162a' }]}>{points.length}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={[styles.detailLabel, { color: isDark ? '#afbcd6' : '#5f6078' }]}>Avg Accuracy</Text>
            <Text style={[styles.detailValue, { color: isDark ? '#edf2ff' : '#17162a' }]}>{(stats.avgAccuracy || 0).toFixed(1)} m</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={[styles.detailLabel, { color: isDark ? '#afbcd6' : '#5f6078' }]}>Avg AI Confidence</Text>
            <Text style={[styles.detailValue, { color: isDark ? '#edf2ff' : '#17162a' }]}>{(stats.avgAiConfidence || 0).toFixed(2)}</Text>
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
    padding: 18,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
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
    marginBottom: 14,
    paddingTop: 10,
  },
  headerText: {
    flex: 1,
    marginLeft: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(108,99,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mapHero: {
    height: 300,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#4738c9',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  kpiRow: {
    marginBottom: 14,    marginTop: 6,  },
  timelineCard: {
    padding: 14,
    borderRadius: 24,
  },
  timelinePlaceholder: {
    height: 90,
    borderRadius: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  detailsCard: {
    padding: 14,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  buttonGroup: {
    gap: 10,
  },
});
