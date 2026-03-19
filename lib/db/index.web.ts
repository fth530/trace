// Web Database Implementation using localStorage
// Replaces expo-sqlite (which requires WebAssembly) for web platform

import { logger } from '../utils/logger';
import type { Expense, Settings } from '../store/types';

const EXPENSES_KEY = 'trace_expenses';
const SETTINGS_KEY = 'trace_settings';

const DEFAULT_SETTINGS: Record<string, string> = {
  daily_limit: '500',
  monthly_limit: '10000',
  theme: 'dark',
  has_seen_onboarding: '0',
  db_version: '1',
};

class WebSQLiteDatabase {
  private expenses: Expense[] = [];
  private settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  private nextId: number = 1;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const expStr = localStorage.getItem(EXPENSES_KEY);
      if (expStr) {
        this.expenses = JSON.parse(expStr);
        const maxId = this.expenses.reduce((m, e) => Math.max(m, e.id ?? 0), 0);
        this.nextId = maxId + 1;
      }
    } catch {
      this.expenses = [];
    }
    try {
      const setStr = localStorage.getItem(SETTINGS_KEY);
      if (setStr) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(setStr) };
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private persistExpenses() {
    try {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(this.expenses));
    } catch {}
  }

  private persistSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {}
  }

  async getAllAsync<T>(sql: string, params?: any[]): Promise<T[]> {
    const s = sql.trim().toLowerCase();

    if (s.includes('from expenses') && s.includes('distinct date')) {
      const dates = [...new Set(this.expenses.map((e) => e.date))]
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 365);
      return dates.map((d) => ({ date: d })) as unknown as T[];
    }

    if (s.includes('from expenses') && s.includes('where date =') && s.includes('select *')) {
      const date = params?.[0] as string;
      const result = this.expenses
        .filter((e) => e.date === date)
        .sort((a, b) => b.created_at - a.created_at);
      return result as unknown as T[];
    }

    if (s.includes('from expenses') && s.includes('where date =') && s.includes('order by created_at desc')) {
      const date = params?.[0] as string;
      const result = this.expenses
        .filter((e) => e.date === date)
        .sort((a, b) => b.created_at - a.created_at);
      return result as unknown as T[];
    }

    if (s.includes('from expenses') && s.includes('group by category')) {
      const startDate = params?.[0] as string;
      const endDate = params?.[1] as string;
      const filtered = this.expenses.filter(
        (e) => e.date >= startDate && e.date <= endDate,
      );
      const byCategory: Record<string, { total: number; count: number }> = {};
      for (const e of filtered) {
        const cat = e.category ?? 'null';
        if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
        byCategory[cat].total += e.amount;
        byCategory[cat].count += 1;
      }
      const result = Object.entries(byCategory)
        .map(([cat, val]) => ({
          category: cat === 'null' ? null : cat,
          total: Math.round(val.total * 100) / 100,
          count: val.count,
        }))
        .sort((a, b) => b.total - a.total);
      return result as unknown as T[];
    }

    if (s.includes('from expenses') && s.includes('group by date')) {
      const startDate = params?.[0] as string;
      const filtered = this.expenses.filter((e) => e.date >= startDate);
      const byDate: Record<string, { count: number; total: number }> = {};
      for (const e of filtered) {
        if (!byDate[e.date]) byDate[e.date] = { count: 0, total: 0 };
        byDate[e.date].count += 1;
        byDate[e.date].total += e.amount;
      }
      const result = Object.entries(byDate)
        .map(([date, val]) => ({
          date,
          count: val.count,
          total: Math.round(val.total * 100) / 100,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
      return result as unknown as T[];
    }

    if (s.includes('from settings')) {
      const rows = Object.entries(this.settings).map(([key, value]) => ({
        key,
        value,
      }));
      return rows as unknown as T[];
    }

    return [];
  }

  async getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null> {
    const s = sql.trim().toLowerCase();

    if (s.includes('from expenses') && s.includes('sum(amount)') && s.includes('where date =')) {
      const date = params?.[0] as string;
      const total = this.expenses
        .filter((e) => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0);
      return { total: Math.round(total * 100) / 100 } as unknown as T;
    }

    if (s.includes('from expenses') && s.includes('sum(amount)') && s.includes('where date >=') && s.includes('and date <=')) {
      const startDate = params?.[0] as string;
      const endDate = params?.[1] as string;
      const total = this.expenses
        .filter((e) => e.date >= startDate && e.date <= endDate)
        .reduce((sum, e) => sum + e.amount, 0);
      return { total: Math.round(total * 100) / 100 } as unknown as T;
    }

    if (s.includes('from expenses') && s.includes('sum(amount)') && s.includes('where date >=')) {
      const startDate = params?.[0] as string;
      const total = this.expenses
        .filter((e) => e.date >= startDate)
        .reduce((sum, e) => sum + e.amount, 0);
      return { total: Math.round(total * 100) / 100 } as unknown as T;
    }

    if (s.includes('from settings') && s.includes('where key =')) {
      const key = params?.[0] as string;
      const value = this.settings[key];
      if (value === undefined) return null;
      return { value } as unknown as T;
    }

    const results = await this.getAllAsync<T>(sql, params);
    return results[0] ?? null;
  }

  async runAsync(
    sql: string,
    params?: any[],
  ): Promise<{ lastInsertRowId: number; changes: number }> {
    const s = sql.trim().toLowerCase();

    if (s.startsWith('insert into expenses')) {
      const [amount, category, description, date, created_at] = params as [
        number,
        string | null,
        string,
        string,
        number,
      ];
      const id = this.nextId++;
      this.expenses.unshift({
        id,
        amount,
        category: category as any,
        description,
        date,
        created_at,
      });
      this.persistExpenses();
      return { lastInsertRowId: id, changes: 1 };
    }

    if (s.startsWith('insert or ignore into settings')) {
      const [key, value] = params as [string, string];
      if (!(key in this.settings)) {
        this.settings[key] = value;
        this.persistSettings();
      }
      return { lastInsertRowId: 0, changes: 0 };
    }

    if (s.startsWith('update settings')) {
      const [value, key] = params as [string, string];
      this.settings[key] = value;
      this.persistSettings();
      return { lastInsertRowId: 0, changes: 1 };
    }

    if (s.startsWith('delete from expenses') && s.includes('where id =')) {
      const id = params?.[0] as number;
      const before = this.expenses.length;
      this.expenses = this.expenses.filter((e) => e.id !== id);
      this.persistExpenses();
      return { lastInsertRowId: 0, changes: before - this.expenses.length };
    }

    if (s.startsWith('delete from expenses')) {
      const count = this.expenses.length;
      this.expenses = [];
      this.persistExpenses();
      return { lastInsertRowId: 0, changes: count };
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  async execAsync(_sql: string): Promise<void> {
    // CREATE TABLE, CREATE INDEX, etc. are no-ops on web (storage is already set up)
  }

  async closeAsync(): Promise<void> {
    // Nothing to close for localStorage
  }
}

let dbInstance: WebSQLiteDatabase | null = null;
let initPromise: Promise<WebSQLiteDatabase> | null = null;

export const initDatabase = async (): Promise<WebSQLiteDatabase> => {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const db = new WebSQLiteDatabase();
      dbInstance = db;
      logger.log('✅ Web database (localStorage) initialized successfully');
      return db;
    } catch (error) {
      initPromise = null;
      logger.error('❌ Web database initialization failed:', error);
      throw error;
    }
  })();

  return initPromise;
};

export const getDatabase = (): WebSQLiteDatabase => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
};

export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    initPromise = null;
    logger.log('✅ Web database closed');
  }
};
