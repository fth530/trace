// Design Tokens: Semantic Color Palette
// Category colors are managed in lib/constants/categories.ts

export const colors = {
  // Base colors
  background: {
    dark: '#000000',
    light: '#F5F5F7',
  },
  surface: {
    dark: '#1C1C1E',
    light: '#FFFFFF',
  },
  surfaceGlass: {
    dark: 'rgba(28, 28, 30, 0.7)',
    light: 'rgba(255, 255, 255, 0.7)',
  },

  // Text colors
  text: {
    primary: {
      dark: '#FFFFFF',
      light: '#1D1D1F',
    },
    secondary: {
      dark: '#AEAEB2',
      light: '#6E6E73',
    },
    tertiary: {
      dark: '#636366',
      light: '#86868B',
    },
  },

  // Semantic colors
  accent: {
    dark: '#0A84FF',
    light: '#007AFF',
  },
  success: {
    dark: '#30D158',
    light: '#34C759',
  },
  warning: {
    dark: '#FF9F0A',
    light: '#FF9500',
  },
  danger: {
    dark: '#FF453A',
    light: '#FF3B30',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

// Themed semantic color accessor (used by limits.ts)
export const getThemedColors = (scheme: ColorScheme) => ({
  background: colors.background[scheme],
  surface: colors.surface[scheme],
  surfaceGlass: colors.surfaceGlass[scheme],
  textPrimary: colors.text.primary[scheme],
  textSecondary: colors.text.secondary[scheme],
  textTertiary: colors.text.tertiary[scheme],
  accent: colors.accent[scheme],
  success: colors.success[scheme],
  warning: colors.warning[scheme],
  danger: colors.danger[scheme],
});

export type ThemedColors = ReturnType<typeof getThemedColors>;

