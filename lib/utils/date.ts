// Date Utilities
// Based on ROADMAP §2 Database Design (ISO 8601 format) & S-Class Logic Protocol

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

// Get a past date in ISO format for Timezone-safe SQLite queries
export const getPastDateISO = (daysAgo: number): string => {
  return formatDateISO(subDays(new Date(), daysAgo));
};

// Get the start of the current month in ISO format
export const getStartOfMonthISO = (): string => {
  return formatDateISO(startOfMonth(new Date()));
};

// Get month range (start and end dates in ISO format)
export const getMonthRange = (
  date: Date = new Date(),
): { start: string; end: string } => {
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

// Calculate current streak: O(1) Set Lookup Optimisation
export const calculateStreak = (dates: string[]): number => {
  if (!dates || dates.length === 0) return 0;

  // S-Class Logic: Convert array to Set for O(1) lookups instead of O(N) Array.includes.
  // Crucial for performance when users have years of logged data.
  const dateSet = new Set(dates);

  const today = new Date();
  const todayISO = formatDateISO(today);
  const yesterdayISO = formatDateISO(subDays(today, 1));

  // If there's no entry for today or yesterday, streak is definitely broken
  if (!dateSet.has(todayISO) && !dateSet.has(yesterdayISO)) {
    return 0;
  }

  let streak = 0;
  let targetDate = dateSet.has(todayISO) ? today : subDays(today, 1);

  while (true) {
    const targetISO = formatDateISO(targetDate);
    if (dateSet.has(targetISO)) {
      streak++;
      targetDate = subDays(targetDate, 1); // Move backward
    } else {
      break;
    }
  }

  return streak;
};
