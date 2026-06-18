import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useDiagnostics } from '../../lib/store/diagnosticsContext';
import { useTheme } from '../../lib/store/themeContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    maxWidth: '60%',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusInitializing: {
    backgroundColor: '#fff3cd',
  },
  statusInitializingText: {
    color: '#856404',
  },
  statusReady: {
    backgroundColor: '#d4edda',
  },
  statusReadyText: {
    color: '#155724',
  },
  statusActive: {
    backgroundColor: '#d4edda',
  },
  statusActiveText: {
    color: '#155724',
  },
  statusInactive: {
    backgroundColor: '#e2e3e5',
  },
  statusInactiveText: {
    color: '#383d41',
  },
  statusLoading: {
    backgroundColor: '#cce5ff',
  },
  statusLoadingText: {
    color: '#004085',
  },
  statusLoaded: {
    backgroundColor: '#d4edda',
  },
  statusLoadedText: {
    color: '#155724',
  },
  statusFailed: {
    backgroundColor: '#f8d7da',
  },
  statusFailedText: {
    color: '#721c24',
  },
  statusNotLoaded: {
    backgroundColor: '#e2e3e5',
  },
  statusNotLoadedText: {
    color: '#383d41',
  },
  statusNotInitialized: {
    backgroundColor: '#e2e3e5',
  },
  statusNotInitializedText: {
    color: '#383d41',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#f08080',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#721c24',
  },
  coordinateText: {
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});

function StatusBadge({ status }) {
  const statusStyles = {
    'initializing': [styles.statusInitializing, styles.statusInitializingText],
    'ready': [styles.statusReady, styles.statusReadyText],
    'active': [styles.statusActive, styles.statusActiveText],
    'inactive': [styles.statusInactive, styles.statusInactiveText],
    'loading': [styles.statusLoading, styles.statusLoadingText],
    'loaded': [styles.statusLoaded, styles.statusLoadedText],
    'failed': [styles.statusFailed, styles.statusFailedText],
    'not-loaded': [styles.statusNotLoaded, styles.statusNotLoadedText],
    'not-initialized': [styles.statusNotInitialized, styles.statusNotInitializedText],
  };

  const [badgeStyle, textStyle] = statusStyles[status] || [styles.statusInactive, styles.statusInactiveText];

  return (
    <View style={[styles.statusBadge, badgeStyle]}>
      <Text style={[styles.statusText, textStyle]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

export default function DiagnosticsScreen() {
  const diagnostics = useDiagnostics();
  const { isDark } = useTheme();

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: isDark ? '#111827' : '#f5f5f5',
    },
    section: {
      ...styles.section,
      backgroundColor: isDark ? '#1f2937' : '#fff',
    },
    sectionTitle: {
      ...styles.sectionTitle,
      color: isDark ? '#f3f4f6' : '#333',
    },
    row: {
      ...styles.row,
      borderBottomColor: isDark ? '#374151' : '#f0f0f0',
    },
    label: {
      ...styles.label,
      color: isDark ? '#9ca3af' : '#666',
    },
    value: {
      ...styles.value,
      color: isDark ? '#e5e7eb' : '#333',
    },
    errorBox: {
      ...styles.errorBox,
      backgroundColor: isDark ? '#7f1d1d' : '#fff5f5',
      borderLeftColor: isDark ? '#f87171' : '#f08080',
    },
    errorText: {
      ...styles.errorText,
      color: isDark ? '#fecaca' : '#721c24',
    },
    coordinateText: {
      ...styles.coordinateText,
      color: isDark ? '#e5e7eb' : '#333',
    },
  };

  return (
    <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.scrollContent}>
        {/* TensorFlow Status */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>TensorFlow</Text>

          <View style={dynamicStyles.row}>
            <Text style={dynamicStyles.label}>Status</Text>
            <StatusBadge status={diagnostics.tensorflowStatus} />
          </View>

          {diagnostics.tensorflowError && (
            <View style={dynamicStyles.errorBox}>
              <Text style={dynamicStyles.label}>Error</Text>
              <Text style={dynamicStyles.errorText}>{diagnostics.tensorflowError}</Text>
            </View>
          )}
        </View>

        {/* Model Status */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>AI Model</Text>

          <View style={dynamicStyles.row}>
            <Text style={dynamicStyles.label}>Status</Text>
            <StatusBadge status={diagnostics.modelStatus} />
          </View>

          {diagnostics.modelError && (
            <View style={dynamicStyles.errorBox}>
              <Text style={dynamicStyles.label}>Error</Text>
              <Text style={dynamicStyles.errorText}>{diagnostics.modelError}</Text>
            </View>
          )}
        </View>

        {/* GPS Status */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>GPS</Text>

          <View style={[dynamicStyles.row, styles.lastRow]}>
            <Text style={dynamicStyles.label}>Status</Text>
            <StatusBadge status={diagnostics.gpsStatus} />
          </View>
        </View>

        {/* Prediction Metrics */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Prediction Metrics</Text>

          <View style={dynamicStyles.row}>
            <Text style={dynamicStyles.label}>Last Inference Time</Text>
            <Text style={dynamicStyles.value}>
              {diagnostics.lastInferenceTime ? `${diagnostics.lastInferenceTime}ms` : 'N/A'}
            </Text>
          </View>

          <View style={dynamicStyles.row}>
            <Text style={dynamicStyles.label}>Total Inferences</Text>
            <Text style={[dynamicStyles.value, styles.statValue]}>
              {diagnostics.totalInferences}
            </Text>
          </View>

          <View style={[dynamicStyles.row, styles.lastRow]}>
            <Text style={dynamicStyles.label}>Prediction Errors</Text>
            <Text style={[dynamicStyles.value, { color: diagnostics.totalPredictionErrors > 0 ? '#f08080' : '#155724' }]}>
              {diagnostics.totalPredictionErrors}
            </Text>
          </View>
        </View>

        {/* Last Prediction */}
        {diagnostics.lastPredictionCoordinates && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Last Prediction</Text>

            <View style={dynamicStyles.row}>
              <Text style={dynamicStyles.label}>Latitude</Text>
              <Text style={dynamicStyles.coordinateText}>
                {diagnostics.lastPredictionCoordinates.lat.toFixed(6)}
              </Text>
            </View>

            <View style={[dynamicStyles.row, styles.lastRow]}>
              <Text style={dynamicStyles.label}>Longitude</Text>
              <Text style={dynamicStyles.coordinateText}>
                {diagnostics.lastPredictionCoordinates.lon.toFixed(6)}
              </Text>
            </View>
          </View>
        )}

        {/* Buffering */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Buffering</Text>

          <View style={[dynamicStyles.row, styles.lastRow]}>
            <Text style={dynamicStyles.label}>Buffered GPS Points</Text>
            <Text style={[dynamicStyles.value, styles.statValue]}>
              {diagnostics.bufferedGpsPoints}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
