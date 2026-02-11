// Date Utilities
// Based on ROADMAP §2 Database Design (ISO 8601 format)

import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

// ISO 8601 format: YYYY-MM-DD
export const formatDateISO = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Display format: "15 Ocak 2024"
export const formatDateDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'd MMMM yyyy', { locale: tr });
};

// Display format: "15 Oca"
export const formatDateShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'd MMM', { locale: tr });
};

// Display format: "Bugün", "Dün", or "15 Ocak"
export const formatDateRelative = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = subDays(today, 1);

  const dateISO = formatDateISO(dateObj);
  const todayISO = formatDateISO(today);
  const yesterdayISO = formatDateISO(yesterday);

  if (dateISO === todayISO) return 'Bugün';
  if (dateISO === yesterdayISO) return 'Dün';

  return format(dateObj, 'd MMMM', { locale: tr });
};

// Get today's date in ISO format
export const getTodayISO = (): string => {
  return formatDateISO(new Date());
};

// Get month range (start and end dates in ISO format)
export const getMonthRange = (date: Date = new Date()): { start: string; end: string } => {
  return {
    start: formatDateISO(startOfMonth(date)),
    end: formatDateISO(endOfMonth(date)),
  };
};

// Get current timestamp (Unix timestamp in milliseconds)
export const getCurrentTimestamp = (): number => {
  return Date.now();
};

// Parse ISO date string to Date object
export const parseISODate = (isoString: string): Date => {
  return new Date(isoString);
};
