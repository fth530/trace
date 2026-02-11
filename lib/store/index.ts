// Zustand Store
// Based on ROADMAP §8 Zustand Store Design

import { create } from 'zustand';
import type { AppStore, Expense } from './types';
import { initDatabase, getDatabase } from '../db';
import * as queries from '../db/queries';
import { getTodayISO, getMonthRange } from '../utils/date';

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
    theme: 'dark',
  },
  isLoading: true,
  error: null,

  // Initialize store
  init: async () => {
    try {
      set({ isLoading: true, error: null });

      // Initialize database
      const db = await initDatabase();

      // Load settings
      const settings = await queries.getAllSettings(db);

      // Load today's data
      const today = getTodayISO();
      const todayExpenses = await queries.getTodayExpenses(db, today);
      const todayTotal = await queries.getTodayTotal(db, today);

      // Load month total
      const monthRange = getMonthRange();
      const monthTotal = await queries.getMonthTotal(
        db,
        monthRange.start,
        monthRange.end
      );

      set({
        settings,
        todayExpenses,
        todayTotal,
        monthTotal,
        isLoading: false,
        error: null,
      });

      console.log('✅ Store initialized');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Store initialization failed';
      console.error('❌ Store initialization failed:', error);
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Add expense
  addExpense: async (expense) => {
    try {
      set({ error: null });
      const db = getDatabase();
      const today = getTodayISO();

      // Create expense with timestamp
      const newExpense: Omit<Expense, 'id'> = {
        ...expense,
        date: today,
        created_at: Date.now(),
      };

      // Insert to database
      const id = await queries.addExpense(db, newExpense);

      // Update state
      const expenseWithId: Expense = { ...newExpense, id };
      
      set((state) => ({
        todayExpenses: [expenseWithId, ...state.todayExpenses],
      }));

      // Recalculate totals
      await get().calculateTotals();

      console.log('✅ Expense added:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Add expense failed';
      console.error('❌ Add expense failed:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete expense
  deleteExpense: async (id) => {
    try {
      set({ error: null });
      const db = getDatabase();

      // Delete from database
      await queries.deleteExpense(db, id);

      // Update state
      set((state) => ({
        todayExpenses: state.todayExpenses.filter((e) => e.id !== id),
      }));

      // Recalculate totals
      await get().calculateTotals();

      console.log('✅ Expense deleted:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete expense failed';
      console.error('❌ Delete expense failed:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Load history
  loadHistory: async () => {
    try {
      const db = getDatabase();

      // Load last 30 days summary
      const history = await queries.getHistorySummary(db, 30);
      const weekTotal = await queries.getWeekTotal(db);
      const monthTotal = await queries.getCurrentMonthTotal(db);

      set({ history, weekTotal, monthTotal });

      console.log('✅ History loaded');
    } catch (error) {
      console.error('❌ Load history failed:', error);
      throw error;
    }
  },

  // Load day expenses
  loadDayExpenses: async (date) => {
    try {
      const db = getDatabase();
      const expenses = await queries.getDayExpenses(db, date);
      
      console.log(`✅ Day expenses loaded: ${date}`);
      return expenses;
    } catch (error) {
      console.error('❌ Load day expenses failed:', error);
      throw error;
    }
  },

  // Update setting
  updateSetting: async (key, value) => {
    try {
      const db = getDatabase();
      const valueStr = String(value);

      // Update database
      await queries.updateSetting(db, key, valueStr);

      // Update state
      set((state) => ({
        settings: {
          ...state.settings,
          [key]: key === 'theme' ? value : Number(value),
        },
      }));

      console.log(`✅ Setting updated: ${key} = ${value}`);
    } catch (error) {
      console.error('❌ Update setting failed:', error);
      throw error;
    }
  },

  // Clear all data
  clearAllData: async () => {
    try {
      const db = getDatabase();

      // Delete all expenses
      await queries.clearAllExpenses(db);

      // Reset state
      set({
        todayExpenses: [],
        todayTotal: 0,
        monthTotal: 0,
        history: [],
        weekTotal: 0,
      });

      console.log('✅ All data cleared');
    } catch (error) {
      console.error('❌ Clear data failed:', error);
      throw error;
    }
  },

  // Calculate totals
  calculateTotals: async () => {
    try {
      const db = getDatabase();
      const today = getTodayISO();

      // Calculate today total
      const todayTotal = await queries.getTodayTotal(db, today);

      // Calculate month total
      const monthRange = getMonthRange();
      const monthTotal = await queries.getMonthTotal(
        db,
        monthRange.start,
        monthRange.end
      );

      set({ todayTotal, monthTotal });
    } catch (error) {
      console.error('❌ Calculate totals failed:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
