import {
  formatCurrency,
  parseCurrency,
  validateDecimal,
  formatCurrencyCompact,
  formatCurrencyInput,
} from '../currency';

describe('currency utils', () => {
  describe('formatCurrency', () => {
    it('formats large numbers as millions with M₺', () => {
      expect(formatCurrency(1500000)).toBe('1.5M₺');
      expect(formatCurrency(1000000)).toBe('1.0M₺');
    });

    it('formats small numbers to 2 decimal places', () => {
      expect(formatCurrency(99.5)).toBe('99.50₺');
      expect(formatCurrency(10)).toBe('10.00₺');
    });

    it('formats thousands correctly with standard locale rules', () => {
      const result = formatCurrency(1500);
      expect(result).toContain('₺');
      expect(result).toMatch(/1([.,\s]?)500/);
    });
  });

  describe('parseCurrency', () => {
    it('parses valid number string correctly', () => {
      expect(parseCurrency('1500')).toBe(1500);
      expect(parseCurrency('15.5')).toBe(15.5);
    });

    it('converts comma to dot for floating points', () => {
      expect(parseCurrency('15,50')).toBe(15.5);
    });

    it('removes non-numeric characters before parsing', () => {
      expect(parseCurrency('1500 ₺')).toBe(1500);
      expect(parseCurrency('10.5abc')).toBe(10.5);
    });

    it('returns 0 for completely invalid inputs', () => {
      expect(parseCurrency('abc')).toBe(0);
      expect(parseCurrency('')).toBe(0);
    });
  });

  describe('validateDecimal', () => {
    it('allows valid decimal strings', () => {
      expect(validateDecimal('10')).toBe(true);
      expect(validateDecimal('10.5')).toBe(true);
      expect(validateDecimal('10.50')).toBe(true);
    });

    it('rejects strings with too many decimals', () => {
      expect(validateDecimal('10.505')).toBe(false);
    });
  });

  describe('formatCurrencyCompact', () => {
    it('formats millions to M₺', () => {
      expect(formatCurrencyCompact(2500000)).toBe('2.5M₺');
    });

    it('formats thousands to K₺', () => {
      expect(formatCurrencyCompact(1500)).toBe('1.5K₺');
      expect(formatCurrencyCompact(15000)).toBe('15.0K₺');
    });

    it('formats smaller numbers with 0 decimals', () => {
      expect(formatCurrencyCompact(999)).toBe('999₺');
      expect(formatCurrencyCompact(10.5)).toBe('11₺'); // toFixed(0) rounds it
    });
  });
});
