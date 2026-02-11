// Database Schema
// Based on ROADMAP §2 Database Design

export const SCHEMA_VERSION = 1;

export const createTablesSQL = `
-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT CHECK(category IN ('Yol', 'Yemek', 'Market', 'Diğer')),
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export const seedDataSQL = `
-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('daily_limit', '500'),
  ('monthly_limit', '10000'),
  ('theme', 'dark'),
  ('db_version', '${SCHEMA_VERSION}');
`;
