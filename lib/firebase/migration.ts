// Firebase Migration Helper
// Tüm local verileri cloud'a taşımak için

import { getDatabase } from '../db';
import { migrateLocalDataToCloud } from './sync';
import { logger } from '../utils/logger';

export const migrateAllLocalData = async () => {
  try {
    const db = await getDatabase();

    // TÜM harcamaları al (sadece bugünkü değil!)
    const allExpenses = await db.getAllAsync<any>(
      'SELECT * FROM expenses ORDER BY date DESC',
    );

    // Ayarları al
    const settingsRows = await db.getAllAsync<{ key: string; value: string }>(
      'SELECT * FROM settings',
    );

    const settings: Record<string, any> = {};
    settingsRows.forEach((row) => {
      settings[row.key] = row.value;
    });

    logger.log(`📤 Migrating ${allExpenses.length} expenses to cloud...`);

    // Tüm verileri cloud'a taşı
    const result = await migrateLocalDataToCloud(allExpenses, settings);

    if (result.success) {
      logger.log('✅ Migration completed successfully');
    }

    return result;
  } catch (error: any) {
    logger.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
};
