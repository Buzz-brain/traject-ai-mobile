import { DarkTheme, DefaultTheme, ThemeProvider as ExpoThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../../lib/store/themeContext';
import { SessionProvider } from '../../lib/store/sessionContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider>
      <SessionProvider>
        <ExpoThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="session-detail"
              options={{
                title: 'Session Detail',
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </Stack>
        </ExpoThemeProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
