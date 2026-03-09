// Design Tokens: Professional Finance App Design System

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

// Professional color palette
export const colors = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0055CC',

  // Semantic
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',

  // Neutral
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',

  // Background (dark mode)
  bgPrimary: '#000000',
  bgSecondary: '#1C1C1E',
  bgTertiary: '#2C2C2E',
  bgElevated: '#1C1C1E',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',

  // Border
  separator: 'rgba(255,255,255,0.08)',
  separatorLight: 'rgba(255,255,255,0.04)',
} as const;

// Backward compatibility aliases
export const neonColors = {
  mint: colors.success,
  yellow: colors.warning,
  crimson: colors.danger,
  sky: colors.primary,
  cyan: colors.primary,
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

// Gradient presets
export const gradients = {
  main: ['#000000', '#0a0a0a', '#111111'] as const,
  modal: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,1)'] as const,
  safe: ['rgba(52,199,89,0.15)', 'rgba(52,199,89,0.05)'] as const,
  danger: ['rgba(255,59,48,0.15)', 'rgba(255,59,48,0.05)'] as const,
} as const;

export const gradientLocations = {
  main: [0, 0.5, 1] as const,
};

// Professional subtle shadows
export const shadow = (
  intensity: 'sm' | 'md' | 'lg' = 'md',
) => {
  const config = {
    sm: { offset: 2, opacity: 0.15, radius: 4, elevation: 2 },
    md: { offset: 4, opacity: 0.2, radius: 8, elevation: 4 },
    lg: { offset: 6, opacity: 0.25, radius: 12, elevation: 6 },
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
