/**
 * Theme Context Provider
 * Manages app-wide light/dark theme
 */

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { STORAGE_CONFIG } from '../utils/constants';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Load theme preference on mount
  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_CONFIG.STORAGE_KEY_THEME);
      
      if (saved) {
        setIsDark(saved === 'dark');
      } else {
        // Use system preference
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('[ThemeContext] Error loading theme:', error);
      setIsDark(systemColorScheme === 'dark');
    } finally {
      setIsReady(true);
    }
  }

  async function toggleTheme() {
    try {
      const newValue = !isDark;
      setIsDark(newValue);
      await AsyncStorage.setItem(
        STORAGE_CONFIG.STORAGE_KEY_THEME,
        newValue ? 'dark' : 'light'
      );
    } catch (error) {
      console.error('[ThemeContext] Error saving theme:', error);
    }
  }

  const value = {
    isDark: isDark ?? (systemColorScheme === 'dark'),
    setIsDark,
    toggleTheme,
    isReady,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export default ThemeContext;
