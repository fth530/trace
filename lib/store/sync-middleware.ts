// Firebase Sync Middleware
// Store değişikliklerini otomatik olarak Firebase'e senkronize eder

import {
  addExpenseToCloud,
  deleteExpenseFromCloud,
  saveSettingsToCloud,
  getExpensesFromCloud,
  getSettingsFromCloud,
} from '../firebase/sync';
import { getCurrentUser } from '../firebase/auth';
import { logger } from '../utils/logger';

// Sync aktif mi kontrolü
export const isSyncEnabled = () => {
  return !!getCurrentUser();
};

// Harcama eklendiğinde cloud'a sync et
export const syncAddExpense = async (expense: any) => {
  if (!isSyncEnabled()) return;

  try {
    await addExpenseToCloud(expense);
    logger.log('✅ Expense synced to cloud');
  } catch (error) {
    logger.error('❌ Sync add expense failed:', error);
  }
};

// Harcama silindiğinde cloud'dan sil
export const syncDeleteExpense = async (expenseId: string | number) => {
  if (!isSyncEnabled()) return;

  try {
    await deleteExpenseFromCloud(String(expenseId));
    logger.log('✅ Expense deleted from cloud');
  } catch (error) {
    logger.error('❌ Sync delete expense failed:', error);
  }
};

// Ayarlar değiştiğinde cloud'a sync et
export const syncSettings = async (settings: any) => {
  if (!isSyncEnabled()) return;

  try {
    await saveSettingsToCloud(settings);
    logger.log('✅ Settings synced to cloud');
  } catch (error) {
    logger.error('❌ Sync settings failed:', error);
  }
};

// Cloud'dan verileri çek ve local'e yükle
export const pullFromCloud = async () => {
  if (!isSyncEnabled()) {
    return { success: false, message: 'User not authenticated' };
  }

  try {
    const [expensesResult, settingsResult] = await Promise.all([
      getExpensesFromCloud(),
      getSettingsFromCloud(),
    ]);

    return {
      success: true,
      expenses: expensesResult.success ? expensesResult.expenses : [],
      settings: settingsResult.success ? settingsResult.settings : null,
    };
  } catch (error: any) {
    logger.error('❌ Pull from cloud failed:', error);
    return { success: false, error: error.message };
  }
};
