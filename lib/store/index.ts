// Zustand Store
// Based on ROADMAP §8 Zustand Store Design

import { create } from 'zustand';
import type { AppStore, Expense } from './types';
import { initDatabase, getDatabase } from '../db';
import * as queries from '../db/queries';
import { getTodayISO, getMonthRange } from '../utils/date';
import { logger } from '../utils/logger';

const getSafeDb = async () => {
  try {
    return getDatabase();
  } catch (error) {
    logger.log('Database not mapped or initialized, reinitializing...');
    return await initDatabase();
  }
};

export const useStore = create<AppStore>((set, get) => ({
  // Initial State
  todayExpenses: [],
  todayTotal: 0,
  monthTotal: 0,
  history: [],
  weekTotal: 0,
  settings: {
    daily_limit: 500,
    monthly_limit: 10000,
    theme: 'dark', // Locked to dark for Antigravity Protocol
    has_seen_onboarding: false,
  },
  isLoading: true,
  error: null,

  // Initialize store
  init: async () => {
    try {
      set({ isLoading: true, error: null });

      const db = await getSafeDb();
      const settings = await queries.getAllSettings(db);

      const today = getTodayISO();
      const todayExpenses = await queries.getTodayExpenses(db, today);
      const todayTotal = await queries.getTodayTotal(db, today);

      const monthRange = getMonthRange();
      const monthTotal = await queries.getMonthTotal(
        db,
        monthRange.start,
        monthRange.end,
      );

      set({
        settings,
        todayExpenses,
        todayTotal,
        monthTotal,
        isLoading: false,
        error: null,
      });

      logger.log('✅ Store initialized');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Store initialization failed';
      logger.error('❌ Store initialization failed:', error);
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Add expense
  addExpense: async (expense) => {
    try {
      set({ error: null });
      const db = await getSafeDb();
      const today = getTodayISO();

      const newExpense: Omit<Expense, 'id'> = {
        ...expense,
        date: today,
        created_at: Date.now(),
      };

      const id = await queries.addExpense(db, newExpense);
      const expenseWithId: Expense = { ...newExpense, id };

      set((state) => ({
        todayExpenses: [expenseWithId, ...state.todayExpenses],
      }));

      await get().calculateTotals();
      logger.log('✅ Expense added:', id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Add expense failed';
      logger.error('❌ Add expense failed:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete expense
  deleteExpense: async (id) => {
    try {
      set({ error: null });
      const db = await getSafeDb();

      await queries.deleteExpense(db, id);

      set((state) => ({
        todayExpenses: state.todayExpenses.filter((e) => e.id !== id),
      }));

      await get().calculateTotals();
      logger.log('✅ Expense deleted:', id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Delete expense failed';
      logger.error('❌ Delete expense failed:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Load history
  loadHistory: async () => {
    try {
      const db = await getSafeDb();
      const history = await queries.getHistorySummary(db, 30);
      const weekTotal = await queries.getWeekTotal(db);
      const monthTotal = await queries.getCurrentMonthTotal(db);

      set({ history, weekTotal, monthTotal });
      logger.log('✅ History loaded');
    } catch (error) {
      logger.error('❌ Load history failed:', error);
      throw error;
    }
  },

  // Load day expenses
  loadDayExpenses: async (date) => {
    try {
      const db = await getSafeDb();
      const expenses = await queries.getDayExpenses(db, date);

      logger.log(`✅ Day expenses loaded: ${date}`);
      return expenses;
    } catch (error) {
      logger.error('❌ Load day expenses failed:', error);
      throw error;
    }
  },

  // Load monthly analytics (category summaries)
  loadMonthCategoryData: async () => {
    try {
      const db = await getSafeDb();
      const monthRange = getMonthRange();
      const summaries = await queries.getMonthExpensesByCategory(
        db,
        monthRange.start,
        monthRange.end,
      );

      logger.log('✅ Month analytics loaded');
      return summaries;
    } catch (error) {
      logger.error('❌ Load month analytics failed:', error);
      throw error;
    }
  },

  // Update setting
  updateSetting: async (key, value) => {
    try {
      const db = await getSafeDb();
      const valueStr = String(value);

      await queries.updateSetting(db, key, valueStr);

      set((state) => ({
        settings: {
          ...state.settings,
          [key]:
            key === 'theme'
              ? value
              : key === 'has_seen_onboarding'
                ? Boolean(Number(value))
                : Number(value),
        },
      }));

      logger.log(`✅ Setting updated: ${key} = ${value}`);
    } catch (error) {
      logger.error('❌ Update setting failed:', error);
      throw error;
    }
  },

  // Clear all data
  clearAllData: async () => {
    try {
      const db = await getSafeDb();
      await queries.clearAllExpenses(db);

      set({
        todayExpenses: [],
        todayTotal: 0,
        monthTotal: 0,
        history: [],
        weekTotal: 0,
      });

      logger.log('✅ All data cleared');
    } catch (error) {
      logger.error('❌ Clear data failed:', error);
      throw error;
    }
  },

  // Calculate totals
  calculateTotals: async () => {
    try {
      const db = await getSafeDb();
      const today = getTodayISO();

      const todayTotal = await queries.getTodayTotal(db, today);
      const monthRange = getMonthRange();
      const monthTotal = await queries.getMonthTotal(
        db,
        monthRange.start,
        monthRange.end,
      );

      set({ todayTotal, monthTotal });
    } catch (error) {
      logger.error('❌ Calculate totals failed:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
