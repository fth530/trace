import firestore from '@react-native-firebase/firestore';
import { getCurrentUser } from './auth';

// Firestore koleksiyonları
const COLLECTIONS = {
  USERS: 'users',
  EXPENSES: 'expenses',
  SETTINGS: 'settings',
};

// Kullanıcı referansını al
const getUserRef = () => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return firestore().collection(COLLECTIONS.USERS).doc(user.uid);
};

// Harcama ekle
export const addExpenseToCloud = async (expense: any) => {
  try {
    const userRef = getUserRef();
    await userRef.collection(COLLECTIONS.EXPENSES).add({
      ...expense,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Add Expense Error:', error);
    return { success: false, error: error.message };
  }
};

// Harcamaları getir
export const getExpensesFromCloud = async () => {
  try {
    const userRef = getUserRef();
    const snapshot = await userRef
      .collection(COLLECTIONS.EXPENSES)
      .orderBy('date', 'desc')
      .get();

    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, expenses };
  } catch (error: any) {
    console.error('Get Expenses Error:', error);
    return { success: false, error: error.message };
  }
};

// Harcama güncelle
export const updateExpenseInCloud = async (expenseId: string, updates: any) => {
  try {
    const userRef = getUserRef();
    await userRef.collection(COLLECTIONS.EXPENSES).doc(expenseId).update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Update Expense Error:', error);
    return { success: false, error: error.message };
  }
};

// Harcama sil
export const deleteExpenseFromCloud = async (expenseId: string) => {
  try {
    const userRef = getUserRef();
    await userRef.collection(COLLECTIONS.EXPENSES).doc(expenseId).delete();
    return { success: true };
  } catch (error: any) {
    console.error('Delete Expense Error:', error);
    return { success: false, error: error.message };
  }
};

// Ayarları kaydet
export const saveSettingsToCloud = async (settings: any) => {
  try {
    const userRef = getUserRef();
    await userRef.collection(COLLECTIONS.SETTINGS).doc('preferences').set({
      ...settings,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Save Settings Error:', error);
    return { success: false, error: error.message };
  }
};

// Ayarları getir
export const getSettingsFromCloud = async () => {
  try {
    const userRef = getUserRef();
    const doc = await userRef.collection(COLLECTIONS.SETTINGS).doc('preferences').get();
    
    if (doc.exists) {
      return { success: true, settings: doc.data() };
    }
    return { success: true, settings: null };
  } catch (error: any) {
    console.error('Get Settings Error:', error);
    return { success: false, error: error.message };
  }
};

// Local verileri cloud'a migrate et (ilk giriş)
export const migrateLocalDataToCloud = async (localExpenses: any[], localSettings: any) => {
  try {
    const userRef = getUserRef();
    const batch = firestore().batch();

    // Harcamaları ekle
    localExpenses.forEach(expense => {
      const expenseRef = userRef.collection(COLLECTIONS.EXPENSES).doc();
      batch.set(expenseRef, {
        ...expense,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });

    // Ayarları ekle
    const settingsRef = userRef.collection(COLLECTIONS.SETTINGS).doc('preferences');
    batch.set(settingsRef, {
      ...localSettings,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error('Migration Error:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener (opsiyonel - diğer cihazlardan değişiklikleri dinle)
export const subscribeToExpenses = (callback: (expenses: any[]) => void) => {
  try {
    const userRef = getUserRef();
    return userRef
      .collection(COLLECTIONS.EXPENSES)
      .orderBy('date', 'desc')
      .onSnapshot(snapshot => {
        const expenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(expenses);
      });
  } catch (error) {
    console.error('Subscribe Error:', error);
    return () => {};
  }
};
