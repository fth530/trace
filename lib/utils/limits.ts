// Limit Calculation Utilities
// Based on ROADMAP §7 Limit & Warning System

import { colors } from '../constants/colors';

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
  type: LimitType
): LimitStatus => {
  // Edge case: Limit = 0 (no limit set)
  if (limit === 0) {
    return {
      percentage: 0,
      level: 'safe',
      message: null,
      color: colors.success.dark,
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
      color: colors.danger.dark,
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
      color: colors.warning.dark,
      shouldShowBanner: true,
    };
  }

  if (percentage >= 50) {
    return {
      percentage,
      level: 'warning-50',
      message: type === 'daily' ? 'Günlük limitinin yarısını geçtin' : null,
      color: colors.warning.dark,
      shouldShowBanner: type === 'daily', // Only show for daily at 50%
    };
  }

  return {
    percentage,
    level: 'safe',
    message: null,
    color: colors.success.dark,
    shouldShowBanner: false,
  };
};

// Get progress bar color based on percentage
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return colors.danger.dark;
  if (percentage >= 80) return colors.warning.dark;
  if (percentage >= 50) return colors.warning.dark;
  return colors.success.dark;
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
