// Limit Calculation Utilities
// Based on ROADMAP §7 Limit & Warning System

import { i18n } from '../translations/i18n';

export type LimitLevel = 'safe' | 'warning-50' | 'warning-80' | 'danger-100';
export type LimitType = 'daily' | 'monthly';

export interface LimitStatus {
  percentage: number;
  level: LimitLevel;
  message: string | null;
  color: string;
  shouldShowBanner: boolean;
}

// Semantic color mapping from design tokens
const semanticColors = {
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',
} as const;

// Calculate limit percentage
export const calculateLimitPercentage = (
  current: number,
  limit: number,
): number => {
  if (limit === 0) return 0;
  return (current / limit) * 100;
};

// Get limit status with warning level
export const getLimitStatus = (
  current: number,
  limit: number,
  type: LimitType,
  _scheme: 'dark' | 'light' = 'dark',
): LimitStatus => {
  // Edge case: Limit = 0 (no limit set)
  if (limit === 0) {
    return {
      percentage: 0,
      level: 'safe',
      message: null,
      color: semanticColors.success,
      shouldShowBanner: false,
    };
  }

  const percentage = calculateLimitPercentage(current, limit);

  // Determine level and message based on thresholds
  if (percentage >= 100) {
    return {
      percentage,
      level: 'danger-100',
      message:
        type === 'daily'
          ? i18n.t('limits.daily_exceeded')
          : i18n.t('limits.monthly_exceeded'),
      color: semanticColors.danger,
      shouldShowBanner: true,
    };
  }

  if (percentage >= 80) {
    return {
      percentage,
      level: 'warning-80',
      message:
        type === 'daily'
          ? i18n.t('limits.daily_80')
          : i18n.t('limits.monthly_80'),
      color: semanticColors.warning,
      shouldShowBanner: true,
    };
  }

  if (percentage >= 50) {
    return {
      percentage,
      level: 'warning-50',
      message: type === 'daily' ? i18n.t('limits.daily_50') : null,
      color: semanticColors.warning,
      shouldShowBanner: type === 'daily', // Only show for daily at 50%
    };
  }

  return {
    percentage,
    level: 'safe',
    message: null,
    color: semanticColors.success,
    shouldShowBanner: false,
  };
};

// Get progress bar color based on percentage
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return semanticColors.danger;
  if (percentage >= 80) return semanticColors.warning;
  if (percentage >= 50) return semanticColors.warning;
  return semanticColors.success;
};

// Check if should trigger haptic feedback
export const shouldTriggerHaptic = (level: LimitLevel): boolean => {
  return level !== 'safe';
};

// Get haptic intensity based on level
export const getHapticIntensity = (
  level: LimitLevel,
): 'light' | 'medium' | 'heavy' => {
  switch (level) {
    case 'warning-50':
      return 'light';
    case 'warning-80':
      return 'medium';
    case 'danger-100':
      return 'heavy';
    default:
      return 'light';
  }
};
