// Root Layout
// Based on ROADMAP §3 Navigation Tree

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import { useStore } from '@/lib/store';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import '../global.css';

// Prevent splash screen from auto-hiding until data loads
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const settings = useStore((state) => state.settings);
  const isLoading = useStore((state) => state.isLoading);
  const t = useThemeColors();

  // Hide splash screen when loading is complete
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Apply theme from settings
  useEffect(() => {
    if (settings.theme === 'auto') {
      setColorScheme('system');
    } else {
      setColorScheme(settings.theme);
    }
  }, [settings.theme, setColorScheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: t.background,
          },
          headerTintColor: t.textPrimary,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: t.background,
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
    </GestureHandlerRootView>
  );
}
