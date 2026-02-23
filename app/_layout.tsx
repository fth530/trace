// Root Layout
// Based on ROADMAP §3 Navigation Tree

import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useStore } from "@/lib/store";
import { logger } from "@/lib/utils/logger";
import { neonColors } from "@/lib/constants/design-tokens";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import "../global.css";

// Suppress NativeWind's harmless Reanimated strict mode warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Prevent splash screen from auto-hiding until data loads
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isLoading = useStore((state) => state.isLoading);
  const initStore = useStore((state) => state.init);

  // Initialize store on mount
  useEffect(() => {
    initStore().catch((error) => {
      logger.error("Failed to initialize store:", error);
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
            backgroundColor: neonColors.zinc950,
          },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: neonColors.zinc950,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal/add-expense"
          options={{
            presentation: "modal",
            title: "",
            headerShown: false,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

