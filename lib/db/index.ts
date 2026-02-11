// Database Initialization
// Based on ROADMAP §2 Database Design

import * as SQLite from 'expo-sqlite';
import { createTablesSQL, seedDataSQL } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Open database
    const db = await SQLite.openDatabaseAsync('trace.db');

    // Create tables
    await db.execAsync(createTablesSQL);

    // Seed default data
    await db.execAsync(seedDataSQL);

    dbInstance = db;
    console.log('✅ Database initialized successfully');

    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
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
    console.log('✅ Database closed');
  }
};
