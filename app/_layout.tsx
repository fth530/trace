// Root Layout
// Based on ROADMAP §3 Navigation Tree

import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { useStore } from '@/lib/store';
import { logger } from '@/lib/utils/logger';
import { neonColors } from '@/lib/constants/design-tokens';
import { configureGoogleSignIn, onAuthStateChanged } from '@/lib/firebase/auth';
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
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize Firebase and store on mount
  useEffect(() => {
    configureGoogleSignIn();
    initStore().catch((error) => {
      logger.error('Failed to initialize store:', error);
    });

    // Auth state listener
    const unsubscribe = onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  // Hide splash screen and handle routing when loading is complete
  useEffect(() => {
    if (!isLoading && authChecked) {
      SplashScreen.hideAsync();

      const hasSeenOnboarding =
        useStore.getState().settings.has_seen_onboarding;

      // Routing priority: onboarding > login > tabs
      if (!hasSeenOnboarding) {
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        // Kullanıcı onboarding'i gördü ama giriş yapmadı
        // Login ekranını gösterme, direkt tabs'a git (opsiyonel kullanım)
        router.replace('/(tabs)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, authChecked, isAuthenticated]);

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
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
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
