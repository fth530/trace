import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  formatDateISO,
  formatDateDisplay,
  formatDateShort,
  formatDateRelative,
  getTodayISO,
  getMonthRange,
} from '../date';

describe('date utils', () => {
  describe('formatDateISO', () => {
    it('formats a date to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDateISO(date)).toBe('2024-01-15');
    });
  });

  describe('formatDateDisplay', () => {
    it('formats string date correctly', () => {
      expect(formatDateDisplay('2024-01-15')).toBe('15 Ocak 2024');
    });

    it('formats object date correctly', () => {
      const date = new Date('2024-02-28T10:00:00Z');
      expect(formatDateDisplay(date)).toBe('28 Şubat 2024');
    });
  });

  describe('formatDateShort', () => {
    it('formats date to D MMM format', () => {
      expect(formatDateShort('2024-03-05')).toBe('5 Mar');
    });
  });

  describe('formatDateRelative', () => {
    it('returns "Bugün" for current day', () => {
      const today = new Date();
      expect(formatDateRelative(today)).toBe('Bugün');
      expect(formatDateRelative(formatDateISO(today))).toBe('Bugün');
    });

    it('returns "Dün" for previous day', () => {
      const yesterday = subDays(new Date(), 1);
      expect(formatDateRelative(yesterday)).toBe('Dün');
      expect(formatDateRelative(formatDateISO(yesterday))).toBe('Dün');
    });

    it('returns formatted date for older dates', () => {
      const olderDate = subDays(new Date(), 5);
      const expected = format(olderDate, 'd MMMM', { locale: tr });
      expect(formatDateRelative(olderDate)).toBe(expected);
    });
  });

  describe('getTodayISO', () => {
    it('returns current date in ISO format', () => {
      expect(getTodayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getMonthRange', () => {
    it('returns valid ISO start and end dates', () => {
      const range = getMonthRange(new Date('2024-02-15T10:00:00Z'));
      expect(range.start).toBe('2024-02-01');
      expect(range.end).toBe('2024-02-29'); // Leap year check
    });
  });
});
