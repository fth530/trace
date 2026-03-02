// Database Migration System
// Handles schema changes across versions

import type { SQLiteDatabase } from 'expo-sqlite';
import { logger } from '../utils/logger';

const CURRENT_VERSION = 1;

interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
  down?: (db: SQLiteDatabase) => Promise<void>;
}

// Define migrations here
const migrations: Migration[] = [
  // Version 1: Initial schema (already created in initDatabase)
  {
    version: 1,
    up: async (db) => {
      // Initial schema is created in initDatabase
      logger.log('Migration v1: Initial schema');
    },
  },

  // Example future migration:
  // {
  //   version: 2,
  //   up: async (db) => {
  //     await db.execAsync('ALTER TABLE expenses ADD COLUMN tags TEXT');
  //     logger.log('Migration v2: Added tags column');
  //   },
  //   down: async (db) => {
  //     // SQLite doesn't support DROP COLUMN easily
  //     // Would need to recreate table
  //   },
  // },
];

export const getCurrentVersion = async (
  db: SQLiteDatabase,
): Promise<number> => {
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      ['db_version'],
    );
    return result ? parseInt(result.value, 10) : 0;
  } catch (error) {
    logger.error('Failed to get DB version:', error);
    return 0;
  }
};

export const setVersion = async (
  db: SQLiteDatabase,
  version: number,
): Promise<void> => {
  await db.runAsync('UPDATE settings SET value = ? WHERE key = ?', [
    version.toString(),
    'db_version',
  ]);
};

export const runMigrations = async (db: SQLiteDatabase): Promise<void> => {
  const currentVersion = await getCurrentVersion(db);

  if (currentVersion === CURRENT_VERSION) {
    logger.log(`✅ Database is up to date (v${currentVersion})`);
    return;
  }

  logger.log(
    `🔄 Running migrations from v${currentVersion} to v${CURRENT_VERSION}`,
  );

  // Run migrations in order
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      try {
        logger.log(`⬆️  Applying migration v${migration.version}...`);
        await migration.up(db);
        await setVersion(db, migration.version);
        logger.log(`✅ Migration v${migration.version} completed`);
      } catch (error) {
        logger.error(`❌ Migration v${migration.version} failed:`, error);
        throw new Error(
          `Migration failed at version ${migration.version}: ${error}`,
        );
      }
    }
  }

  logger.log(
    `✅ All migrations completed. Current version: ${CURRENT_VERSION}`,
  );
};

export const rollbackMigration = async (
  db: SQLiteDatabase,
  targetVersion: number,
): Promise<void> => {
  const currentVersion = await getCurrentVersion(db);

  if (targetVersion >= currentVersion) {
    logger.log('No rollback needed');
    return;
  }

  logger.log(`⬇️  Rolling back from v${currentVersion} to v${targetVersion}`);

  // Run down migrations in reverse order
  for (let i = migrations.length - 1; i >= 0; i--) {
    const migration = migrations[i];
    if (
      migration.version <= currentVersion &&
      migration.version > targetVersion
    ) {
      if (!migration.down) {
        throw new Error(
          `Migration v${migration.version} has no down migration`,
        );
      }

      try {
        logger.log(`⬇️  Rolling back migration v${migration.version}...`);
        await migration.down(db);
        await setVersion(db, migration.version - 1);
        logger.log(`✅ Rollback v${migration.version} completed`);
      } catch (error) {
        logger.error(`❌ Rollback v${migration.version} failed:`, error);
        throw error;
      }
    }
  }

  logger.log(`✅ Rollback completed. Current version: ${targetVersion}`);
};
