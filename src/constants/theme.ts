/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0B1220',
    background: '#FAFAFB',
    backgroundElement: '#F3F5F7',
    backgroundSelected: '#E5E8EC',
    textSecondary: '#5B6572',
    surface: '#FFFFFF',
    surfaceAlt: '#F3F5F7',
    border: '#E5E8EC',
    accent: '#2563EB',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    ai: '#7C3AED',
    info: '#2563EB',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B0F14',
    backgroundElement: '#141A22',
    backgroundSelected: '#1C2430',
    textSecondary: '#A7B3C2',
    surface: '#141A22',
    surfaceAlt: '#1C2430',
    border: '#232C38',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    ai: '#8B5CF6',
    info: '#38BDF8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
