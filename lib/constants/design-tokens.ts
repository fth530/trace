// Design Tokens: Spacing, Gradients, Shadows
// Based on Antigravity Protocol & S-Class Aesthetics

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

// Neon color palette
export const neonColors = {
  mint: '#00FFAA', // Safe
  yellow: '#FFD60A', // Warning
  crimson: '#FF2A55', // Danger
  sky: '#38bdf8',
  cyan: '#0ea5e9',
  slateDark: '#475569',
  zinc950: '#09090b',
  white: '#FFFFFF',
  glass: 'rgba(0, 0, 0, 0.8)', // bg-black/80 equivalent
  pink: '#F472B6',
  violet: '#A78BFA',
  rose: '#F43F5E',
  slate: '#64748B',
  fuchsia: '#D946EF',
} as const;

// Gradient presets
export const gradients = {
  main: ['#000000', '#0a0a0a', '#111111'] as const,
  modal: ['rgba(0,0,0,0.9)', 'rgba(0,0,0,1)'] as const,
  safe: ['rgba(0,255,170,0.2)', 'rgba(0,255,170,0.05)'] as const,
  danger: ['rgba(255,42,85,0.2)', 'rgba(255,42,85,0.05)'] as const,
} as const;

export const gradientLocations = {
  main: [0, 0.5, 1] as const,
};

// Shadow presets with neon glow
export const neonShadow = (
  color: string,
  intensity: 'sm' | 'md' | 'lg' = 'md',
) => {
  const config = {
    sm: { offset: 4, opacity: 0.2, radius: 10, elevation: 5 },
    md: { offset: 8, opacity: 0.35, radius: 15, elevation: 8 },
    lg: { offset: 8, opacity: 0.5, radius: 25, elevation: 12 },
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

export const placeholderColor = neonColors.slateDark;
