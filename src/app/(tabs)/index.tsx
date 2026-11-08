import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router/react-navigation';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../lib/store/themeContext';
import { useSessionContext } from '../../../lib/store/sessionContext';
import { useAsyncStorage } from '../../../lib/hooks/useAsyncStorage';
import { useTensorFlowInitialization } from '../../../lib/hooks/useTensorFlowInitialization';
import {
  ScreenHeader,
  Card,
  PrimaryButton,
  SecondaryButton,
} from '../../../components/common';
import { calculateSessionStats, formatSessionDate, formatDistance, formatDuration } from '../../../lib/utils/calculations';
import { Ionicons } from '@expo/vector-icons';

type Session = {
  sessionId: string;
  sessionName: string;
  createdAt: string;
  points?: Array<unknown>;
};

export default function HomeScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { sessions, createSession, deleteSession, loadSessions } = useSessionContext();
  const storage = useAsyncStorage();
  const [refreshing, setRefreshing] = useState(false);
  const [sessionsList, setSessionsList] = useState<Session[]>([]);

  useTensorFlowInitialization();

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  useEffect(() => {
    setSessionsList(sessions);
  }, [sessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadSessions();
    } finally {
      setRefreshing(false);
    }
  }, [loadSessions]);

  const handleCreateSession = async () => {
    try {
      const sessionName = `Session ${new Date().toLocaleDateString()}`;
      const result = await createSession(sessionName, 'hybrid');
      
      if (result) {
        Alert.alert('Success', 'New session created');
        await loadSessions();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Error', `Failed to create session: ${message}`);
    }
  };

  const handleViewSession = (sessionId: string) => {
    router.push({ pathname: '/session-detail' as any, params: { sessionId } });
  };

  const handleDeleteSession = async (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteSession(sessionId);
              await loadSessions();
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : String(error);
              Alert.alert('Error', `Failed to delete session: ${message}`);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderSessionItem = ({ item: session }: { item: Session }) => {
    const stats = calculateSessionStats(session.points || []);

    return (
      <Card 
        onPress={() => handleViewSession(session.sessionId)} 
        style={{
          marginHorizontal: 0,
          marginBottom: 14,
          borderRadius: 24,
          padding: 16,
          borderColor: isDark ? '#233049' : '#ece7ff',
          backgroundColor: isDark ? '#121b2d' : '#ffffff',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text 
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: isDark ? '#edf2ff' : '#17162a',
                marginBottom: 6,
                letterSpacing: -0.4,
              }}
            >
              {session.sessionName}
            </Text>
            <Text 
              style={{
                fontSize: 12,
                color: isDark ? '#aab8d3' : '#5f6078',
                marginBottom: 12,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 0.7,
              }}
            >
              {formatSessionDate(session.createdAt)}
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: isDark ? '#9ca9bc' : '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>Distance</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#8b5cf6' : '#6c63ff', marginTop: 4 }}>
                  {formatDistance(stats.distance)}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: isDark ? '#9ca9bc' : '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>Duration</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#60a5fa' : '#2563eb', marginTop: 4 }}>
                  {formatDuration(stats.duration)}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, color: isDark ? '#9ca9bc' : '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>Points</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#34d399' : '#10b981', marginTop: 4 }}>
                  {(session.points || []).length}
                </Text>
              </View>
            </View>
          </View>

          <SecondaryButton
            label="Delete"
            onPress={() => handleDeleteSession(session.sessionId)}
            style={{ paddingHorizontal: 10, paddingVertical: 6, width: 74, marginLeft: 10 }}
          />
        </View>
      </Card>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0c1220' : '#f5f3ff',
    },
    heroCard: {
      marginHorizontal: 18,
      marginTop: 18,
      marginBottom: 16,
      borderRadius: 28,
      padding: 20,
      backgroundColor: isDark ? '#151d2b' : '#ffffff',
      borderWidth: 1,
      borderColor: isDark ? '#1f2a39' : '#e9e5ff',
      shadowColor: '#6d5efc',
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    miniBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: isDark ? '#2a2e48' : '#f0edff',
    },
    miniBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#dfe5ff' : '#5045c1',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    heroTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: isDark ? '#eef4ff' : '#191730',
      letterSpacing: -0.9,
      marginBottom: 6,
    },
    heroSub: {
      fontSize: 14,
      color: isDark ? '#aebad0' : '#5f6078',
      lineHeight: 20,
      marginBottom: 18,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    statTile: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 10,
      backgroundColor: isDark ? '#1a2331' : '#f7f5ff',
      borderWidth: 1,
      borderColor: isDark ? '#273244' : '#ece7ff',
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#9da9be' : '#676b88',
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#f4f7ff' : '#191730',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#e8eefb' : '#1d1b2d',
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDark ? '#9aa4b5' : '#666a84',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    buttonContainer: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      gap: 10,
    },
    listContainer: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      paddingBottom: 20,
    },
    listTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#edf2ff' : '#191730',
      marginBottom: 12,
      marginHorizontal: 18,
    },
  });

  if (sessionsList.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader 
          title="TrajectAI"
          subtitle={`${sessionsList.length} saved sessions`}
        />
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>Live</Text>
            </View>
            <Ionicons name="pulse" size={18} color={isDark ? '#dfe7ff' : '#5b50d4'} />
          </View>
          <Text style={styles.heroTitle}>Track smarter</Text>
          <Text style={styles.heroSub}>Capture routes with real GPS and AI-assisted prediction when accuracy drops.</Text>
          <View style={styles.statRow}>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>Trips</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statLabel}>AI</Text>
              <Text style={styles.statValue}>Ready</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="location-outline" 
            size={64} 
            color={isDark ? '#7a8bb8' : '#d8d4ff'}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No journeys yet</Text>
          <Text style={styles.emptySubtext}>
            Start your first tracking session to generate a live route and AI forecast.
          </Text>
          <PrimaryButton
            label="Create Session"
            onPress={handleCreateSession}
            variant="success"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="TrajectAI"
        subtitle={`${sessionsList.length} saved sessions`}
      />
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.miniBadge}>
            <Text style={styles.miniBadgeText}>Hybrid</Text>
          </View>
          <Ionicons name="navigate" size={18} color={isDark ? '#dfe7ff' : '#5b50d4'} />
        </View>
        <Text style={styles.heroTitle}>Your routes</Text>
        <Text style={styles.heroSub}>Track every trip, compare GPS and AI predictions, and export clean session data.</Text>
        <View style={styles.statRow}>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>Sessions</Text>
            <Text style={styles.statValue}>{sessionsList.length}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>AI</Text>
            <Text style={styles.statValue}>On</Text>
          </View>
        </View>
      </View>

      <Text style={styles.listTitle}>Recent activity</Text>
      <FlatList
        data={sessionsList}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.sessionId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={isDark ? '#7c6cff' : '#6c63ff'}
          />
        }
      />
      <View style={styles.buttonContainer}>
        <PrimaryButton
          label="Create New Session"
          onPress={handleCreateSession}
          variant="success"
        />
      </View>
    </View>
  );
}

