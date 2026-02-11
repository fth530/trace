// Store Type Definitions
// Based on ROADMAP §8 Zustand Store Design

import type { Category } from '../constants/categories';

export interface Expense {
  id: number;
  amount: number;
  category: Category | null;
  description: string;
  date: string;
  created_at: number;
}

export interface DaySummary {
  date: string;
  count: number;
  total: number;
}

export interface Settings {
  daily_limit: number;
  monthly_limit: number;
  theme: 'light' | 'dark' | 'auto';
}

export interface AppStore {
  // State
  todayExpenses: Expense[];
  todayTotal: number;
  monthTotal: number;
  history: DaySummary[];
  weekTotal: number;
  settings: Settings;
  isLoading: boolean;
  error: string | null;

  // Actions
  init: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  loadHistory: () => Promise<void>;
  loadDayExpenses: (date: string) => Promise<Expense[]>;
  updateSetting: (key: keyof Settings, value: string | number) => Promise<void>;
  clearAllData: () => Promise<void>;
  calculateTotals: () => Promise<void>;
  clearError: () => void;
}
