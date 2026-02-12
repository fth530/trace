// Design Tokens: Color Palette
// Based on ROADMAP §5 Design System

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

  // Category colors (Theme-aware)
  category: {
    Yol: {
      dark: '#5E5CE6',
      light: '#4B48CC',
    },
    Yemek: {
      dark: '#FF375F',
      light: '#E0294F',
    },
    Market: {
      dark: '#64D2FF',
      light: '#0A84FF',
    },
    Diğer: {
      dark: '#98989D',
      light: '#6E6E73',
    },
  },
} as const;

export type ColorScheme = 'light' | 'dark';

// Themed color accessor — use directly or via useThemeColors() hook
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
  category: {
    Yol: colors.category.Yol[scheme],
    Yemek: colors.category.Yemek[scheme],
    Market: colors.category.Market[scheme],
    Diğer: colors.category.Diğer[scheme],
  },
});

export type ThemedColors = ReturnType<typeof getThemedColors>;
