// Currency Formatting Utilities
// Based on ROADMAP §6.1 Edge Cases (Amount > 999,999 → "1.2M₺")

export const formatCurrency = (amount: number): string => {
  // Handle edge case: amount > 999,999
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${millions.toFixed(1)}M₺`;
  }

  // Handle edge case: amount > 999
  if (amount >= 1_000) {
    return `${amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}₺`;
  }

  // Standard formatting
  return `${amount.toFixed(2)}₺`;
};

// Format currency without symbol (for inputs)
export const formatCurrencyInput = (amount: number): string => {
  return amount.toFixed(2);
};

// Parse currency string to number
export const parseCurrency = (value: string): number => {
  // Remove non-numeric characters except dot and comma
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Replace comma with dot for decimal
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? 0 : parsed;
};

// Validate decimal places (max 2)
export const validateDecimal = (value: string): boolean => {
  const regex = /^\d+(\.\d{0,2})?$/;
  return regex.test(value);
};

// Format amount for display in lists (compact)
export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M₺`;
  }
  
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K₺`;
  }
  
  return `${amount.toFixed(0)}₺`;
};
