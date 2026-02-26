// Design Tokens: Spacing, Gradients, Shadows
// Based on Antigravity Protocol & 8px Grid System

export const spacing = {
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
  xl: 32,
  full: 9999,
} as const;

// Neon color palette (matches Tailwind config)
export const neonColors = {
  sky: '#38bdf8',
  amber: '#fbbf24',
  fuchsia: '#e879f9',
  pink: '#f4258c',
  cyan: '#0ea5e9',
  slate: '#94a3b8',
  slateLight: '#cbd5e1',
  slateDark: '#475569',
  danger: '#F43F5E',
  rose: '#e11d48',
  roseDark: '#be123c',
  roseDarker: '#9f1239',
  purple: '#a855f7',
  violet: '#8b5cf6',
  zinc950: '#09090b',
} as const;

// Gradient presets (consistent across all screens)
export const gradients = {
  main: ['#000000', '#0a0a1a', '#0ea5e9'] as const,
  modal: ['#1e1b4b', '#000000'] as const,
  fab: ['#FCA5A5', '#f4258c'] as const,
  danger: ['#be123c', '#9f1239'] as const,
} as const;

// Gradient locations for main gradient
export const gradientLocations = {
  main: [0, 0.7, 1] as const,
};

// Shadow presets with neon glow
export const neonShadow = (
  color: string,
  intensity: 'sm' | 'md' | 'lg' = 'md',
) => {
  const config = {
    sm: { offset: 4, opacity: 0.3, radius: 10, elevation: 5 },
    md: { offset: 8, opacity: 0.5, radius: 15, elevation: 8 },
    lg: { offset: 8, opacity: 0.8, radius: 20, elevation: 12 },
  };

  const { offset, opacity, radius, elevation } = config[intensity];

  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offset },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

// Placeholder text color (consistent across inputs)
export const placeholderColor = neonColors.slateDark;
