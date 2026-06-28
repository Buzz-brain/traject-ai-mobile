import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title?: string;
  onOpenMenu?: () => void;
}

export function Header({ title = 'Traject', onOpenMenu }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {onOpenMenu && (
        <TouchableOpacity onPress={onOpenMenu} style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { width: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800' },
  menuBtn: { padding: 8 }
});

export default Header;
