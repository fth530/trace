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

  // Category colors (Dark mode optimized)
  category: {
    Yol: '#5E5CE6',
    Yemek: '#FF375F',
    Market: '#64D2FF',
    Diğer: '#98989D',
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type Category = keyof typeof colors.category;
