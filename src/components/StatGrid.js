import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatGrid({ stats = [] }) {
  return (
    <View style={styles.grid}>
      {stats.map((s, idx) => (
        <View key={s.label + idx} style={styles.card}>
          <Text style={styles.label}>{s.label}</Text>
          <Text style={styles.value}>{s.value}{s.unit ? ` ${s.unit}` : ''}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
});
