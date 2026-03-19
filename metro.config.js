const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable package exports resolution with correct condition order
// This ensures packages like zustand resolve to their react-native/CJS builds
// instead of ESM .mjs files that use import.meta (unsupported in Hermes)
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'require',
  'default',
];

module.exports = withNativeWind(config, { input: './global.css' });
