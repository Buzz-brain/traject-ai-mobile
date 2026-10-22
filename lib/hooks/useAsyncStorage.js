/**
 * useAsyncStorage Hook
 * Abstraction layer for AsyncStorage operations
 * Mirrors web version's useStorage pattern
 */

import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_CONFIG } from '../utils/constants';

/**
 * Hook for AsyncStorage operations
 * Provides session and settings persistence
 * @returns {Object} Storage operations
 */
export function useAsyncStorage() {
  /**
   * Save points to a session
   */
  const savePoints = useCallback(
    async (points, sessionId, mode = null, startedAt = null, sessionName = null, aiDiagnostics = null) => {
      try {
        const sessions = await readAll();
        const idx = sessions.findIndex(s => s.sessionId === sessionId);

        if (idx >= 0) {
          sessions[idx].points = points;
          if (mode) sessions[idx].mode = mode;
          if (startedAt) sessions[idx].startedAt = startedAt;
          if (sessionName) sessions[idx].sessionName = sessionName;
          if (aiDiagnostics) sessions[idx].aiDiagnostics = aiDiagnostics;
        } else {
          sessions.push({
            sessionId,
            sessionName,
            mode,
            startedAt,
            createdAt: new Date().toISOString(),
            points,
            ...(aiDiagnostics ? { aiDiagnostics } : {}),
          });
        }

        await writeAll(sessions);
        return true;
      } catch (error) {
        console.error('[useAsyncStorage] Error saving points:', error);
        return false;
      }
    },
    []
  );

  /**
   * Load a session
   */
  const loadSession = useCallback(async (sessionId = null) => {
    try {
      const sessions = await readAll();
      if (!sessionId) return sessions.length ? sessions[0] : null;
      return sessions.find(s => s.sessionId === sessionId) || null;
    } catch (error) {
      console.error('[useAsyncStorage] Error loading session:', error);
      return null;
    }
  }, []);

  /**
   * Load all sessions
   */
  const loadAll = useCallback(async () => {
    try {
      return await readAll();
    } catch (error) {
      console.error('[useAsyncStorage] Error loading sessions:', error);
      return [];
    }
  }, []);

  /**
   * Clear all sessions
   */
  const clearAll = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_CONFIG.STORAGE_KEY_SESSIONS);
      return true;
    } catch (error) {
      console.error('[useAsyncStorage] Error clearing all:', error);
      return false;
    }
  }, []);

  /**
   * Clear points in a session
   */
  const clearSessionPoints = useCallback(async (sessionId) => {
    try {
      const sessions = await readAll();
      const idx = sessions.findIndex(s => s.sessionId === sessionId);

      if (idx >= 0) {
        sessions[idx].points = [];
        await writeAll(sessions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[useAsyncStorage] Error clearing points:', error);
      return false;
    }
  }, []);

  /**
   * Delete a session
   */
  const deleteSession = useCallback(async (sessionId) => {
    try {
      const sessions = await readAll();
      const filtered = sessions.filter(s => s.sessionId !== sessionId);
      await writeAll(filtered);
      return true;
    } catch (error) {
      console.error('[useAsyncStorage] Error deleting session:', error);
      return false;
    }
  }, []);

  /**
   * Rename a session
   */
  const renameSession = useCallback(async (sessionId, newName) => {
    try {
      const sessions = await readAll();
      const idx = sessions.findIndex(s => s.sessionId === sessionId);

      if (idx >= 0) {
        sessions[idx].sessionName = newName;
        await writeAll(sessions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[useAsyncStorage] Error renaming session:', error);
      return false;
    }
  }, []);

  return {
    savePoints,
    loadSession,
    loadAll,
    clearAll,
    clearSessionPoints,
    deleteSession,
    renameSession,
  };
}

/**
 * Read all sessions from storage
 * @private
 */
async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_CONFIG.STORAGE_KEY_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('[useAsyncStorage] Error reading all:', error);
    return [];
  }
}

/**
 * Write all sessions to storage
 * @private
 */
async function writeAll(sessions) {
  try {
    await AsyncStorage.setItem(
      STORAGE_CONFIG.STORAGE_KEY_SESSIONS,
      JSON.stringify(sessions)
    );
  } catch (error) {
    console.error('[useAsyncStorage] Error writing all:', error);
  }
}

export default useAsyncStorage;
