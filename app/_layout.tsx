// Root Layout
// Based on ROADMAP §3 Navigation Tree

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/constants/colors';
import '../global.css';

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const settings = useStore((state) => state.settings);

  // Apply theme from settings
  useEffect(() => {
    if (settings.theme === 'auto') {
      // Let system handle it
      setColorScheme('system');
    } else {
      setColorScheme(settings.theme);
    }
  }, [settings.theme, setColorScheme]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.dark,
        },
        headerTintColor: colors.text.primary.dark,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background.dark,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal/add-expense"
        options={{
          presentation: 'modal',
          title: '',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
