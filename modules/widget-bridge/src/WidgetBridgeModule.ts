import { requireNativeModule } from 'expo-modules-core';

// The native module will be unavailable in Expo Go. We wrap the require in a
// try/catch so that importing this file never throws.
let WidgetBridgeNative: {
  setItem: (key: string, value: string, suite: string) => Promise<void>;
  reloadWidgets: () => Promise<void>;
} | null = null;

try {
  WidgetBridgeNative = requireNativeModule('WidgetBridge');
} catch {
  // Expected in Expo Go – the native module is only available in dev-client
  // or production builds.
}

export default WidgetBridgeNative;
