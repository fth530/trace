// Design Tokens: 8px Grid Spacing Scale
// Based on ROADMAP §5 Design System

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    offset: { width: 0, height: 2 },
    opacity: 0.1,
    radius: 4,
    elevation: 2,
  },
  md: {
    offset: { width: 0, height: 4 },
    opacity: 0.15,
    radius: 8,
    elevation: 4,
  },
  lg: {
    offset: { width: 0, height: 8 },
    opacity: 0.2,
    radius: 16,
    elevation: 8,
  },
} as const;
