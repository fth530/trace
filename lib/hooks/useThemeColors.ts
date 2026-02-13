// Theme Colors Hook
// Provides reactive themed colors based on current color scheme

import { useColorScheme as useRNColorScheme } from 'react-native';
import { useMemo } from 'react';
import { getThemedColors, type ThemedColors } from '../constants/colors';

export type ThemeContext = ThemedColors & { scheme: 'light' | 'dark' };

export const useThemeColors = (): ThemeContext => {
    const systemScheme = useRNColorScheme();
    const scheme: 'light' | 'dark' = systemScheme === 'light' ? 'light' : 'dark';
    return useMemo(() => ({ ...getThemedColors(scheme), scheme }), [scheme]);
};
