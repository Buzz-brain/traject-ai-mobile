import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type Mode = 'gps_only' | 'ai_only' | 'hybrid';

interface Props {
  mode: Mode;
  onChange: (m: Mode) => void;
}

export function ModeSelector({ mode, onChange }: Props) {
  const opts: Mode[] = ['gps_only', 'ai_only', 'hybrid'];
  return (
    <View style={styles.container}>
      {opts.map((o) => (
        <TouchableOpacity key={o} style={[styles.btn, mode === o && styles.active]} onPress={() => onChange(o)}>
          <Text style={[styles.btnText, mode === o && styles.activeText]}>{o.replace('_', ' ').toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
  active: { backgroundColor: '#e9d5ff' },
  btnText: { fontSize: 12, fontWeight: '700' },
  activeText: { color: '#6b21a8' }
});

export default ModeSelector;
