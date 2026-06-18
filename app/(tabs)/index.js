/**
 * Home Screen - Sessions List
 * Display all tracking sessions and allow creating new ones
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../lib/store/themeContext';
import { useSessionContext } from '../../lib/store/sessionContext';
import { useAsyncStorage } from '../../lib/hooks/useAsyncStorage';
import { useTensorFlowInitialization } from '../../lib/hooks/useTensorFlowInitialization';
import {
  ScreenHeader,
  Card,
  PrimaryButton,
  SecondaryButton,
  StatGrid,
} from '../../components/common';
import { calculateSessionStats, formatSessionDate, formatDistance, formatDuration } from '../../lib/utils/calculations';
import { Ionicons } from '@expo/vector-icons';

/**
 * Home Screen
 */
export default function HomeScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const { sessions, createSession, deleteSession, loadSessions } = useSessionContext();
  const storage = useAsyncStorage();
  const [refreshing, setRefreshing] = useState(false);
  const [sessionsList, setSessionsList] = useState([]);

  // Initialize TensorFlow on app startup
  useTensorFlowInitialization();

  // Load sessions on focus
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  // Update local list when sessions change
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
    } catch (error) {
      Alert.alert('Error', `Failed to create session: ${error.message}`);
    }
  };

  const handleViewSession = (sessionId) => {
    navigation.navigate('session-detail', { sessionId });
  };

  const handleDeleteSession = (sessionId) => {
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
            } catch (error) {
              Alert.alert('Error', `Failed to delete session: ${error.message}`);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderSessionItem = ({ item: session }) => {
    const stats = calculateSessionStats(session.points || []);

    return (
      <Card 
        onPress={() => handleViewSession(session.sessionId)} 
        style={{ marginHorizontal: 16 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text 
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isDark ? '#f3f4f6' : '#1f2937',
                marginBottom: 4,
              }}
            >
              {session.sessionName}
            </Text>
            <Text 
              style={{
                fontSize: 12,
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: 8,
              }}
            >
              {formatSessionDate(session.createdAt)}
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 11, color: isDark ? '#9ca3af' : '#6b7280' }}>Distance</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#10b981' : '#059669' }}>
                  {formatDistance(stats.distance)}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: isDark ? '#9ca3af' : '#6b7280' }}>Duration</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#10b981' : '#059669' }}>
                  {formatDuration(stats.duration)}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: isDark ? '#9ca3af' : '#6b7280' }}>Points</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#10b981' : '#059669' }}>
                  {(session.points || []).length}
                </Text>
              </View>
            </View>
          </View>

          <SecondaryButton
            label="Delete"
            onPress={() => handleDeleteSession(session.sessionId)}
            style={{ paddingHorizontal: 8, paddingVertical: 6, width: 70, marginLeft: 8 }}
          />
        </View>
      </Card>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#f9fafb',
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
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDark ? '#6b7280' : '#9ca3af',
      textAlign: 'center',
      marginBottom: 24,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    listContainer: {
      paddingVertical: 12,
    },
  });

  if (sessionsList.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader 
          title="Sessions"
          subtitle={`${sessionsList.length} total sessions`}
        />
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="list" 
            size={64} 
            color={isDark ? '#4b5563' : '#d1d5db'}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No sessions yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first tracking session to get started
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
        title="Sessions"
        subtitle={`${sessionsList.length} total sessions`}
      />
      <FlatList
        data={sessionsList}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.sessionId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={isDark ? '#10b981' : '#059669'}
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
