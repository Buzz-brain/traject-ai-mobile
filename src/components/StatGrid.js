import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatGrid({ stats = [] }) {
  return (
    <View style={styles.grid}>
      {stats.map((s, idx) => (
        <View key={s.label + idx} style={[styles.card, { borderColor: s.color ? `${s.color}22` : '#e9e5ff' }]}>
          <Text style={styles.label}>{s.label}</Text>
          <Text style={[styles.value, { color: s.color || '#17162a' }]}>{s.value}{s.unit ? ` ${s.unit}` : ''}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    color: '#656b84',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
});
