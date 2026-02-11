// SQL Queries
// Based on ROADMAP §2 Database Design - Query Patterns

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Expense, DaySummary, Settings } from '../store/types';

// Home Screen Queries
export const getTodayExpenses = async (
  db: SQLiteDatabase,
  date: string
): Promise<Expense[]> => {
  const result = await db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
  return result;
};

export const getTodayTotal = async (
  db: SQLiteDatabase,
  date: string
): Promise<number> => {
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?',
    [date]
  );
  return result?.total ?? 0;
};

export const getMonthTotal = async (
  db: SQLiteDatabase,
  startDate: string,
  endDate: string
): Promise<number> => {
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?',
    [startDate, endDate]
  );
  return result?.total ?? 0;
};

// Add Expense
export const addExpense = async (
  db: SQLiteDatabase,
  expense: Omit<Expense, 'id'>
): Promise<number> => {
  const result = await db.runAsync(
    'INSERT INTO expenses (amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?)',
    [
      expense.amount,
      expense.category,
      expense.description,
      expense.date,
      expense.created_at,
    ]
  );
  return result.lastInsertRowId;
};

// History Screen Queries
export const getHistorySummary = async (
  db: SQLiteDatabase,
  daysAgo: number = 30
): Promise<DaySummary[]> => {
  const result = await db.getAllAsync<DaySummary>(
    `SELECT date, COUNT(*) as count, SUM(amount) as total
     FROM expenses 
     WHERE date >= date('now', ?)
     GROUP BY date 
     ORDER BY date DESC`,
    [`-${daysAgo} days`]
  );
  return result;
};

export const getWeekTotal = async (db: SQLiteDatabase): Promise<number> => {
  const result = await db.getFirstAsync<{ total: number | null }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= date('now', '-7 days')"
  );
  return result?.total ?? 0;
};

export const getCurrentMonthTotal = async (
  db: SQLiteDatabase
): Promise<number> => {
  const result = await db.getFirstAsync<{ total: number | null }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= date('now', 'start of month')"
  );
  return result?.total ?? 0;
};

// Day Detail
export const getDayExpenses = async (
  db: SQLiteDatabase,
  date: string
): Promise<Expense[]> => {
  const result = await db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
  return result;
};

// Settings Queries
export const getAllSettings = async (
  db: SQLiteDatabase
): Promise<Settings> => {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT * FROM settings'
  );

  const settings: Record<string, string> = {};
  rows.forEach((row) => {
    settings[row.key] = row.value;
  });

  return {
    daily_limit: Number(settings.daily_limit) || 500,
    monthly_limit: Number(settings.monthly_limit) || 10000,
    theme: (settings.theme as 'light' | 'dark' | 'auto') || 'dark',
  };
};

export const updateSetting = async (
  db: SQLiteDatabase,
  key: string,
  value: string
): Promise<void> => {
  await db.runAsync('UPDATE settings SET value = ? WHERE key = ?', [
    value,
    key,
  ]);
};

// Delete Operations
export const deleteExpense = async (
  db: SQLiteDatabase,
  id: number
): Promise<void> => {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
};

export const clearAllExpenses = async (db: SQLiteDatabase): Promise<void> => {
  await db.runAsync('DELETE FROM expenses');
};
