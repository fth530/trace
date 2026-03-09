// Zustand Store
// Based on ROADMAP §8 & S-Class Logic Engine Protocol

import { create } from 'zustand';
import type { AppStore, Expense } from './types';
import { initDatabase, getDatabase } from '../db';
import * as queries from '../db/queries';
import {
  getTodayISO,
  getMonthRange,
  getPastDateISO,
  getStartOfMonthISO
} from '../utils/date';
import { logger } from '../utils/logger';
import { updateWidgetData } from '../utils/widget';

const getSafeDb = async () => {
  try {
    return getDatabase();
  } catch (error) {
    logger.log('Database not mapped or initialized, reinitializing...');
    return await initDatabase();
  }
};

/**
 * Push current store state to the iOS widget via shared UserDefaults.
 * Fire-and-forget: failures are logged but never surface to the user.
 */
const syncWidget = (state: AppStore) => {
  const { todayTotal, monthTotal, todayExpenses, settings, history } = state;
  const dailyLimit = settings.daily_limit;

  updateWidgetData({
    todayTotal,
    dailyLimit,
    monthTotal,
    remainingToday: Math.max(0, dailyLimit - todayTotal),
    recentExpenses: todayExpenses.slice(0, 5).map((e) => ({
      description: e.description,
      amount: e.amount,
      category: e.category ?? '',
    })),
    weeklyData: (history ?? []).slice(0, 7).map((d) => ({
      date: d.date,
      total: d.total,
    })),
    lastUpdated: new Date().toISOString(),
  }).catch(() => {
    // Already logged inside updateWidgetData
  });
};

export const useStore = create<AppStore>((set, get) => ({
  // Initial State
  currentDate: '',
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
        currentDate: today,
        settings,
        todayExpenses,
        todayTotal,
        monthTotal,
        isLoading: false,
        error: null,
      });

      logger.log('✅ Store initialized');

      // Sync widget with fresh state
      syncWidget(get());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Store initialization failed';
      logger.error('❌ Store initialization failed:', error);
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Check if date changed during background mode
  checkRollover: async () => {
    const today = getTodayISO();
    const current = get().currentDate;
    if (current && current !== today) {
      logger.log('🔄 Midnight Rollover detected! Refreshing store...');
      await get().init();
      return true;
    }
    return false;
  },

  // Add expense
  addExpense: async (expense) => {
    try {
      await get().checkRollover();
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

      // S-Class Logic: Lightning fast 0ms Optimistic Update. 
      // Avoids blocking the UI thread waiting for massive DB read queries.
      set((state) => {
        const updatedExpenses = [expenseWithId, ...state.todayExpenses];
        return {
          todayExpenses: updatedExpenses,
          todayTotal: Math.round((state.todayTotal + newExpense.amount) * 100) / 100,
          monthTotal: Math.round((state.monthTotal + newExpense.amount) * 100) / 100,
        };
      });

      logger.log('✅ Expense added:', id);

      // Sync widget after optimistic update
      syncWidget(get());

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

      // Retrieve existing expense info before deleting for our Optimistic update calculations
      const existingExpense = get().todayExpenses.find((e) => e.id === id);
      if (!existingExpense) {
        logger.log("⚠️ Expense missing from local memory. Ignoring to prevent spam-tap crash.");
        return;
      }

      await queries.deleteExpense(db, id);

      // S-Class Logic: Instant deletion and float-precision subtraction.
      set((state) => {
        const remainingExpenses = state.todayExpenses.filter((e) => e.id !== id);
        return {
          todayExpenses: remainingExpenses,
          todayTotal: Math.max(0, Math.round((state.todayTotal - existingExpense.amount) * 100) / 100),
          monthTotal: Math.max(0, Math.round((state.monthTotal - existingExpense.amount) * 100) / 100),
        };
      });

      logger.log('✅ Expense deleted:', id);

      // Sync widget after deletion
      syncWidget(get());

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

      // S-Class Timezone Logic: Inject JS execution timezone bounds into SQLite to prevent midnight bugs
      const past30DaysStr = getPastDateISO(30);
      const past7DaysStr = getPastDateISO(7);
      const startOfMonthStr = getStartOfMonthISO();

      const history = await queries.getHistorySummary(db, past30DaysStr);
      const weekTotal = await queries.getWeekTotal(db, past7DaysStr);
      const monthTotal = await queries.getCurrentMonthTotal(db, startOfMonthStr);

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

  // Calculate totals - Legacy Function 
  // Useful for full state refreshes but NOT for add/delete loops anymore
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

      // Sync widget after recalculation
      syncWidget(get());
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
