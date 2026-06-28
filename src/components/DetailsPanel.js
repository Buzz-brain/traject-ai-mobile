import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '../../components/common';

export default function DetailsPanel({ points, confidence, lat, lon, accuracy, onTrackAnyway }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Points</Text>
          <Text style={styles.value}>{points} tracked</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Confidence</Text>
          <Text style={styles.value}>{Math.round((confidence || 0) * 100)}%</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Latitude</Text>
          <Text style={styles.value}>{lat ?? '—'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Longitude</Text>
          <Text style={styles.value}>{lon ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Accuracy</Text>
          <Text style={styles.value}>{accuracy ? `${accuracy.toFixed(1)} m` : 'N/A'}</Text>
        </View>
        <View style={[styles.item, { justifyContent: 'center' }]}>
          <PrimaryButton label="Track Anyway" onPress={onTrackAnyway} variant="primary" accessibilityLabel="Track anyway despite low accuracy" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e6eef8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  item: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
});
