import {
  calculateLimitPercentage,
  getLimitStatus,
  getProgressColor,
  shouldTriggerHaptic,
  getHapticIntensity,
} from '../limits';

// i18n mock as it requires localization init
jest.mock('../../translations/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

describe('limits utils', () => {
  describe('calculateLimitPercentage', () => {
    it('returns correct percentage', () => {
      expect(calculateLimitPercentage(50, 100)).toBe(50);
      expect(calculateLimitPercentage(80, 200)).toBe(40);
    });

    it('returns 0 when limit is 0 to avoid division by zero', () => {
      expect(calculateLimitPercentage(50, 0)).toBe(0);
    });
  });

  describe('getLimitStatus', () => {
    it('returns safe status when limit is 0 (no limit)', () => {
      const status = getLimitStatus(100, 0, 'daily');
      expect(status.level).toBe('safe');
      expect(status.shouldShowBanner).toBe(false);
    });

    it('returns danger-100 when percentage >= 100', () => {
      const status = getLimitStatus(100, 100, 'daily');
      expect(status.level).toBe('danger-100');
      expect(status.shouldShowBanner).toBe(true);
      expect(status.message).toBe('limits.daily_exceeded');
    });

    it('returns warning-80 when percentage is between 80 and 99', () => {
      const status = getLimitStatus(85, 100, 'monthly');
      expect(status.level).toBe('warning-80');
      expect(status.shouldShowBanner).toBe(true);
      expect(status.message).toBe('limits.monthly_80');
    });

    it('returns warning-50 only for daily limits between 50 and 79', () => {
      const dailyStatus = getLimitStatus(55, 100, 'daily');
      expect(dailyStatus.level).toBe('warning-50');
      expect(dailyStatus.shouldShowBanner).toBe(true);

      const monthlyStatus = getLimitStatus(55, 100, 'monthly');
      expect(monthlyStatus.level).toBe('warning-50');
      // Monthly doesn't show banner at 50%
      expect(monthlyStatus.shouldShowBanner).toBe(false);
    });

    it('returns safe level for < 50%', () => {
      const status = getLimitStatus(49, 100, 'daily');
      expect(status.level).toBe('safe');
      expect(status.shouldShowBanner).toBe(false);
    });
  });

  describe('getProgressColor', () => {
    it('returns distinct semantic colors', () => {
      const danger = getProgressColor(100);
      const warning80 = getProgressColor(85);
      const warning50 = getProgressColor(55);
      const safe = getProgressColor(45);

      expect(danger).toBe('#FF453A'); // semanticColors.danger
      expect(warning80).toBe('#FF9F0A'); // semanticColors.warning
      expect(warning50).toBe('#FF9F0A'); // semanticColors.warning
      expect(safe).toBe('#30D158'); // semanticColors.success
    });
  });

  describe('Haptic feedback utilities', () => {
    it('shouldTriggerHaptic checks correctly', () => {
      expect(shouldTriggerHaptic('safe')).toBe(false);
      expect(shouldTriggerHaptic('warning-50')).toBe(true);
      expect(shouldTriggerHaptic('danger-100')).toBe(true);
    });

    it('getHapticIntensity maps correctly', () => {
      expect(getHapticIntensity('warning-50')).toBe('light');
      expect(getHapticIntensity('warning-80')).toBe('medium');
      expect(getHapticIntensity('danger-100')).toBe('heavy');
      expect(getHapticIntensity('safe')).toBe('light'); // default
    });
  });
});
