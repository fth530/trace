// Theme Colors Hook
// Provides reactive themed colors based on current color scheme

import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { getThemedColors, type ThemedColors } from '../constants/colors';

export type ThemeContext = ThemedColors & { scheme: 'light' | 'dark' };

export const useThemeColors = (): ThemeContext => {
    const { colorScheme } = useColorScheme();
    const scheme: 'light' | 'dark' = colorScheme === 'light' ? 'light' : 'dark';
    return useMemo(() => ({ ...getThemedColors(scheme), scheme }), [scheme]);
};
