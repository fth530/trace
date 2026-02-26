// Root Layout
// Based on ROADMAP §3 Navigation Tree

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { useStore } from '@/lib/store';
import { logger } from '@/lib/utils/logger';
import { neonColors } from '@/lib/constants/design-tokens';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import '../global.css';

// Suppress NativeWind's harmless Reanimated strict mode warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Prevent splash screen from auto-hiding until data loads
// Prevent splash screen from auto-hiding until data loads
SplashScreen.preventAutoHideAsync();

// Initialize Sentry Crash Reporting
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

function RootLayout() {
  const isLoading = useStore((state) => state.isLoading);
  const initStore = useStore((state) => state.init);

  // Initialize store on mount
  useEffect(() => {
    initStore().catch((error) => {
      logger.error('Failed to initialize store:', error);
    });
  }, []);

  // Hide splash screen and handle routing when loading is complete
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();

      const hasSeenOnboarding =
        useStore.getState().settings.has_seen_onboarding;
      if (!hasSeenOnboarding) {
        router.replace('/onboarding');
      }
    }
  }, [isLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: neonColors.zinc950,
          },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: neonColors.zinc950,
          },
        }}
      >
        <Stack.Screen
          name="onboarding/index"
          options={{ headerShown: false }}
        />
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

export default Sentry.wrap(RootLayout);
