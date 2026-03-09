import { getCurrentUser } from './auth';
import { logger } from '../utils/logger';

let firestore: any = null;

try {
  firestore = require('@react-native-firebase/firestore').default;
} catch {
  logger.warn('Firestore native module not available (Expo Go mode)');
}

const COLLECTIONS = {
  USERS: 'users',
  EXPENSES: 'expenses',
  SETTINGS: 'settings',
};

const FIRESTORE_UNAVAILABLE = {
  success: false,
  error: 'Firestore is not available in Expo Go.',
};

const getUserRef = () => {
  if (!firestore) throw new Error('Firestore not available');
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return firestore().collection(COLLECTIONS.USERS).doc(user.uid);
};

export const addExpenseToCloud = async (expense: any) => {
  if (!firestore) return FIRESTORE_UNAVAILABLE;
  try {
    const userRef = getUserRef();
    const sanitizedExpense = {
      amount: Number(expense.amount),
      category: expense.category,
      description: String(expense.description),
      date: expense.date,
      localId: expense.id,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await userRef
      .collection(COLLECTIONS.EXPENSES)
      .add(sanitizedExpense);
    return { success: true, cloudId: docRef.id };
  } catch (error: any) {
    logger.error('Add Expense Error:', error);
    return { success: false, error: error.message };
  }
};

export const getExpensesFromCloud = async () => {
  if (!firestore) return FIRESTORE_UNAVAILABLE;
  try {
    const userRef = getUserRef();
    const snapshot = await userRef
      .collection(COLLECTIONS.EXPENSES)
      .orderBy('date', 'desc')
      .get();
    const expenses = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, expenses };
  } catch (error: any) {
    logger.error('Get Expenses Error:', error);
    return { success: false, error: error.message };
  }
};

export const updateExpenseInCloud = async (expenseId: string, updates: any) => {
  if (!firestore) return FIRESTORE_UNAVAILABLE;
  try {
    const userRef = getUserRef();
    const sanitizedUpdates: Record<string, unknown> = {
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    if (updates.amount !== undefined)
      sanitizedUpdates.amount = Number(updates.amount);
    if (updates.category !== undefined)
      sanitizedUpdates.category = updates.category;
    if (updates.description !== undefined)
      sanitizedUpdates.description = String(updates.description);
    if (updates.date !== undefined) sanitizedUpdates.date = updates.date;
    await userRef
      .collection(COLLECTIONS.EXPENSES)
      .doc(expenseId)
      .update(sanitizedUpdates);
    return { success: true };
  } catch (error: any) {
    logger.error('Update Expense Error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteExpenseFromCloud = async (expenseId: string) => {
  if (!firestore) return FIRESTORE_UNAVAILABLE;
  try {
    const userRef = getUserRef();
    await userRef.collection(COLLECTIONS.EXPENSES).doc(expenseId).delete();
    return { success: true };
  } catch (error: any) {
    logger.error('Delete Expense Error:', error);
    return { success: false, error: error.message };
  }
};

export const saveSettingsToCloud = async (settings: any) => {
  if (!firestore) return FIRESTORE_UNAVAILABLE;
  try {
    const userRef = getUserRef();
    await userRef
      .collection(COLLECTIONS.SETTINGS)
      .doc('preferences')
      .set(
        {
          ...settings,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    return { success: true };
  } catch (error: any) {
    logger.error('Save Settings Error:', error);
    return { success: false, error: error.message };
  }
};

export const getSettingsFromCloud = async () => {
  if (!firestore) return FIRESTORE_UNAVAILABLE;
  try {
    const userRef = getUserRef();
    const doc = await userRef
      .collection(COLLECTIONS.SETTINGS)
      .doc('preferences')
      .get();
    if (doc.exists()) {
      return { success: true, settings: doc.data() };
    }
    return { success: true, settings: null };
  } catch (error: any) {
    logger.error('Get Settings Error:', error);
    return { success: false, error: error.message };
  }
};

export const migrateLocalDataToCloud = async (
  localExpenses: any[],
  localSettings: any,
) => {
  if (!firestore) return FIRESTORE_UNAVAILABLE;
  try {
    const userRef = getUserRef();
    const BATCH_SIZE = 500;

    for (let i = 0; i < localExpenses.length; i += BATCH_SIZE) {
      const batch = firestore().batch();
      const batchExpenses = localExpenses.slice(i, i + BATCH_SIZE);

      batchExpenses.forEach((expense: any) => {
        const expenseRef = userRef.collection(COLLECTIONS.EXPENSES).doc();
        batch.set(expenseRef, {
          amount: Number(expense.amount),
          category: expense.category,
          description: String(expense.description),
          date: expense.date,
          localId: expense.id,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      logger.log(`Migrated batch ${i / BATCH_SIZE + 1}`);
    }

    const settingsBatch = firestore().batch();
    const settingsRef = userRef
      .collection(COLLECTIONS.SETTINGS)
      .doc('preferences');
    settingsBatch.set(settingsRef, {
      ...localSettings,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    await settingsBatch.commit();

    return { success: true };
  } catch (error: any) {
    logger.error('Migration Error:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToExpenses = (callback: (expenses: any[]) => void) => {
  if (!firestore) return () => {};
  try {
    const userRef = getUserRef();
    return userRef
      .collection(COLLECTIONS.EXPENSES)
      .orderBy('date', 'desc')
      .onSnapshot((snapshot: any) => {
        const expenses = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(expenses);
      });
  } catch (error) {
    logger.error('Subscribe Error:', error);
    return () => {};
  }
};
