/**
 * Sessions Context Provider
 * Manages session CRUD operations and state
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_CONFIG } from '../utils/constants';
import { generateSessionId } from '../utils/calculations';

export const SessionsContext = createContext();

export function SessionsProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Load all sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_CONFIG.STORAGE_KEY_SESSIONS);
      const loaded = raw ? JSON.parse(raw) : [];
      setSessions(loaded);
      setError(null);
    } catch (err) {
      console.error('[SessionsContext] Error loading sessions:', err);
      setError(err.message);
      setSessions([]);
    } finally {
      setIsReady(true);
    }
  }

  async function saveSessions(newSessions) {
    try {
      await AsyncStorage.setItem(
        STORAGE_CONFIG.STORAGE_KEY_SESSIONS,
        JSON.stringify(newSessions)
      );
      setSessions(newSessions);
      setError(null);
    } catch (err) {
      console.error('[SessionsContext] Error saving sessions:', err);
      setError(err.message);
    }
  }

  const createSession = useCallback(
    async (name = null, mode = 'walking') => {
      try {
        const sessionId = generateSessionId();
        const newSession = {
          sessionId,
          sessionName: name || `Session ${new Date().toLocaleString()}`,
          mode,
          createdAt: new Date().toISOString(),
          startedAt: null,
          stoppedAt: null,
          points: [],
        };

        const updated = [newSession, ...sessions];
        await saveSessions(updated);
        return newSession;
      } catch (err) {
        console.error('[SessionsContext] Error creating session:', err);
        setError(err.message);
        return null;
      }
    },
    [sessions]
  );

  const deleteSession = useCallback(
    async (sessionId) => {
      try {
        const updated = sessions.filter(s => s.sessionId !== sessionId);
        await saveSessions(updated);
        return true;
      } catch (err) {
        console.error('[SessionsContext] Error deleting session:', err);
        setError(err.message);
        return false;
      }
    },
    [sessions]
  );

  const updateSession = useCallback(
    async (sessionId, updates) => {
      try {
        const updated = sessions.map(s =>
          s.sessionId === sessionId ? { ...s, ...updates } : s
        );
        await saveSessions(updated);
        return updated.find(s => s.sessionId === sessionId);
      } catch (err) {
        console.error('[SessionsContext] Error updating session:', err);
        setError(err.message);
        return null;
      }
    },
    [sessions]
  );

  const savePoints = useCallback(
    async (sessionId, points) => {
      return updateSession(sessionId, { points });
    },
    [updateSession]
  );

  const clearSessionPoints = useCallback(
    async (sessionId) => {
      return updateSession(sessionId, { points: [] });
    },
    [updateSession]
  );

  const getSession = useCallback(
    (sessionId) => {
      return sessions.find(s => s.sessionId === sessionId) || null;
    },
    [sessions]
  );

  const value = {
    sessions,
    isReady,
    error,
    createSession,
    deleteSession,
    updateSession,
    savePoints,
    clearSessionPoints,
    getSession,
    loadSessions,
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
}

/**
 * Hook to use sessions context
 */
export function useSessions() {
  const context = React.useContext(SessionsContext);
  if (!context) {
    throw new Error('useSessions must be used within SessionsProvider');
  }
  return context;
}

// Export aliases for compatibility
export const useSessionContext = useSessions;
export const SessionProvider = SessionsProvider;

export default SessionsContext;
