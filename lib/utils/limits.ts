// Limit Calculation Utilities
// Based on ROADMAP §7 Limit & Warning System

import { getThemedColors, type ColorScheme } from '../constants/colors';

export type LimitLevel = 'safe' | 'warning-50' | 'warning-80' | 'danger-100';
export type LimitType = 'daily' | 'monthly';

export interface LimitStatus {
  percentage: number;
  level: LimitLevel;
  message: string | null;
  color: string;
  shouldShowBanner: boolean;
}

// Calculate limit percentage
export const calculateLimitPercentage = (current: number, limit: number): number => {
  if (limit === 0) return 0;
  return (current / limit) * 100;
};

// Get limit status with warning level
export const getLimitStatus = (
  current: number,
  limit: number,
  type: LimitType,
  scheme: ColorScheme = 'dark'
): LimitStatus => {
  const themed = getThemedColors(scheme);

  // Edge case: Limit = 0 (no limit set)
  if (limit === 0) {
    return {
      percentage: 0,
      level: 'safe',
      message: null,
      color: themed.success,
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
          ? `Günlük limitini aştın! (${current.toFixed(0)}₺ / ${limit}₺)`
          : 'Aylık limitini aştın!',
      color: themed.danger,
      shouldShowBanner: true,
    };
  }

  if (percentage >= 80) {
    return {
      percentage,
      level: 'warning-80',
      message:
        type === 'daily'
          ? "Günlük limitinin %80'ine ulaştın"
          : "Aylık limitinin %80'ine ulaştın",
      color: themed.warning,
      shouldShowBanner: true,
    };
  }

  if (percentage >= 50) {
    return {
      percentage,
      level: 'warning-50',
      message: type === 'daily' ? 'Günlük limitinin yarısını geçtin' : null,
      color: themed.warning,
      shouldShowBanner: type === 'daily', // Only show for daily at 50%
    };
  }

  return {
    percentage,
    level: 'safe',
    message: null,
    color: themed.success,
    shouldShowBanner: false,
  };
};

// Get progress bar color based on percentage
export const getProgressColor = (percentage: number, scheme: ColorScheme = 'dark'): string => {
  const themed = getThemedColors(scheme);
  if (percentage >= 100) return themed.danger;
  if (percentage >= 80) return themed.warning;
  if (percentage >= 50) return themed.warning;
  return themed.success;
};

// Check if should trigger haptic feedback
export const shouldTriggerHaptic = (level: LimitLevel): boolean => {
  return level !== 'safe';
};

// Get haptic intensity based on level
export const getHapticIntensity = (
  level: LimitLevel
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
