// Root Layout
// Based on ROADMAP §3 & S-Class Production Protocol

import { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { useStore } from '@/lib/store';
import { logger } from '@/lib/utils/logger';
import { neonColors } from '@/lib/constants/design-tokens';
import { configureGoogleSignIn, onAuthStateChanged } from '@/lib/firebase/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
SplashScreen.preventAutoHideAsync();

// Initialize Sentry Crash Reporting
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  // S-Class Security: Only sample 20% in production to prevent bandwidth overload
  tracesSampleRate: 0.2,
});

function RootLayout() {
  const isLoading = useStore((state) => state.isLoading);
  const initStore = useStore((state) => state.init);
  const checkRollover = useStore((state) => state.checkRollover);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const appState = useRef(AppState.currentState);

  // S-Class Logic: Midnight Rollover Listener (Background to Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkRollover().catch(e => logger.error('Rollover check failed:', e));
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkRollover]);

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

  // Hide splash screen and handle Routing Guard when loading is complete
  useEffect(() => {
    if (!isLoading && authChecked) {
      SplashScreen.hideAsync();

      const hasSeenOnboarding = useStore.getState().settings.has_seen_onboarding;

      // S-Class Auth Guard Logic
      if (!hasSeenOnboarding) {
        // Enforce onboarding first
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        // Enforce login wall if onboarding seen but no user state (No Anon or Normal Auth)
        router.replace('/auth/login');
      } else {
        // Full access
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, authChecked, isAuthenticated]); // Re-evaluate path when auth changes to securely route user back instantly

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
