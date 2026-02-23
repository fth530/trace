// Database Initialization
// Based on ROADMAP §2 Database Design

import * as SQLite from 'expo-sqlite';
import { logger } from '../utils/logger';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  // Prevent concurrent initialization
  if (isInitializing) {
    // Wait for ongoing initialization
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (dbInstance) return dbInstance;
  }

  isInitializing = true;

  try {
    const db = await SQLite.openDatabaseAsync('trace.db');

    // Run each statement individually to avoid Android NullPointerException
    // with multi-statement execAsync
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL CHECK(amount > 0),
        category TEXT CHECK(category IN ('Yol', 'Yemek', 'Market', 'Diğer')),
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`
    );

    await db.execAsync(
      `CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC)`
    );

    await db.execAsync(
      `CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC)`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`
    );

    // Seed default settings one by one
    await db.runAsync(
      `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
      ['daily_limit', '500']
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
      ['monthly_limit', '10000']
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
      ['theme', 'dark']
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
      ['db_version', '1']
    );

    dbInstance = db;
    isInitializing = false;
    logger.log('✅ Database initialized successfully');

    return db;
  } catch (error) {
    isInitializing = false;
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
};

export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    logger.log('✅ Database closed');
  }
};
