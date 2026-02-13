// Root Layout
// Based on ROADMAP §3 Navigation Tree

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useStore } from '@/lib/store';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import { logger } from '@/lib/utils/logger';
import '../global.css';

// Prevent splash screen from auto-hiding until data loads
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const settings = useStore((state) => state.settings);
  const isLoading = useStore((state) => state.isLoading);
  const initStore = useStore((state) => state.init);
  const t = useThemeColors();

  // Initialize store on mount
  useEffect(() => {
    initStore().catch((error) => {
      logger.error('Failed to initialize store:', error);
    });
  }, []);

  // Hide splash screen when loading is complete
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

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
