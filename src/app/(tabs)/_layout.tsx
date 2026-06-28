import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'light' ? 'light' : 'dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Tracker',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
