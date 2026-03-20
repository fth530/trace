// Design Tokens: Premium Finance App Design System

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
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Premium color palette
export const colors = {
  // Primary - Rich Indigo
  primary: '#6C63FF',
  primaryLight: '#9B94FF',
  primaryDark: '#4A42D6',
  primaryGlow: 'rgba(108, 99, 255, 0.35)',

  // Semantic
  success: '#00E096',
  successDark: '#00B376',
  warning: '#FFB347',
  warningDark: '#E5930A',
  danger: '#FF4D6A',
  dangerDark: '#CC2A44',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F8F9FF',
  gray100: '#ECECF4',
  gray200: '#D8D8E8',
  gray300: '#B4B4CC',
  gray400: '#8888A8',
  gray500: '#666688',
  gray600: '#444466',
  gray700: '#2E2E48',
  gray800: '#1A1A2E',
  gray900: '#0D0D18',
  black: '#000000',

  // Background — deep space theme
  bgPrimary: '#0D0D12',
  bgSecondary: '#16161F',
  bgTertiary: '#1E1E2A',
  bgElevated: '#22222E',
  bgCard: '#1A1A26',

  // Text
  textPrimary: '#F0F0FF',
  textSecondary: '#8888B0',
  textTertiary: '#555575',

  // Border / separator
  separator: 'rgba(150, 150, 255, 0.08)',
  separatorLight: 'rgba(150, 150, 255, 0.04)',
  borderGlow: 'rgba(108, 99, 255, 0.25)',
} as const;

// Gradient presets
export const gradients = {
  primary: ['#6C63FF', '#9B6BFF'] as const,
  primaryCard: ['#1A1640', '#120F2E'] as const,
  success: ['#00E096', '#00C878'] as const,
  danger: ['#FF4D6A', '#FF2D50'] as const,
  dark: ['#16161F', '#0D0D12'] as const,
  card: ['#1E1E2A', '#16161F'] as const,
  hero: ['#1A1640', '#0D0D12'] as const,
  indigo: ['rgba(108, 99, 255, 0.15)', 'rgba(108, 99, 255, 0.02)'] as const,
} as const;

// Backward compatibility aliases
export const neonColors = {
  mint: colors.success,
  yellow: colors.warning,
  crimson: colors.danger,
  sky: colors.primary,
  cyan: colors.primaryLight,
  slateDark: colors.gray600,
  zinc950: colors.bgPrimary,
  white: colors.white,
  glass: colors.bgSecondary,
  pink: '#FF6B8A',
  violet: '#8B5CF6',
  rose: colors.danger,
  slate: colors.gray500,
  fuchsia: '#A855F7',
} as const;

// Shadows
export const shadow = (
  intensity: 'sm' | 'md' | 'lg' = 'md',
) => {
  const config = {
    sm: { offset: 2, opacity: 0.3, radius: 6, elevation: 3 },
    md: { offset: 6, opacity: 0.4, radius: 16, elevation: 8 },
    lg: { offset: 10, opacity: 0.5, radius: 24, elevation: 12 },
  };

  const { offset, opacity, radius, elevation } = config[intensity];

  return {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: offset },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

export const shadowNeutral = (
  intensity: 'sm' | 'md' | 'lg' = 'md',
) => {
  const config = {
    sm: { offset: 2, opacity: 0.2, radius: 4, elevation: 2 },
    md: { offset: 4, opacity: 0.25, radius: 8, elevation: 4 },
    lg: { offset: 8, opacity: 0.35, radius: 16, elevation: 8 },
  };

  const { offset, opacity, radius, elevation } = config[intensity];

  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: offset },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

// Backward compatibility
export const neonShadow = (
  _color: string,
  intensity: 'sm' | 'md' | 'lg' = 'md',
) => shadow(intensity);

export const placeholderColor = colors.gray600;
