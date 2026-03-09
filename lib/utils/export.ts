// CSV Export Utility
// Exports all expenses from the database as a CSV file and opens the share dialog.

import type { SQLiteDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Expense } from '../store/types';

/**
 * Query all expenses from the database, generate a CSV file, and share it.
 * Columns: Tarih, Kategori, Aciklama, Tutar
 */
export const exportExpensesCSV = async (db: SQLiteDatabase): Promise<void> => {
  // Query all expenses ordered by date descending
  const expenses = await db.getAllAsync<Expense>(
    'SELECT * FROM expenses ORDER BY date DESC, created_at DESC',
  );

  if (expenses.length === 0) {
    throw new Error('NO_DATA');
  }

  const csvContent = generateCSV(expenses);

  // Write to a temp file
  const fileName = `trace-harcamalar-${new Date().toISOString().slice(0, 10)}.csv`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  // Write with BOM for proper Turkish character support in Excel
  const bom = '\uFEFF';
  await FileSystem.writeAsStringAsync(filePath, bom + csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('SHARING_UNAVAILABLE');
  }

  await Sharing.shareAsync(filePath, {
    mimeType: 'text/csv',
    dialogTitle: 'Harcama Verilerini Paylas',
    UTI: 'public.comma-separated-values-text',
  });
};

/**
 * Escape a CSV field value: wrap in quotes if it contains comma, quote, or newline.
 */
const escapeCSVField = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Generate CSV string from an array of expenses.
 */
const generateCSV = (expenses: Expense[]): string => {
  const header = 'Tarih,Kategori,Aciklama,Tutar';

  const rows = expenses.map((expense) => {
    const date = expense.date;
    const category = expense.category ?? 'Belirtilmemis';
    const description = escapeCSVField(expense.description || '-');
    const amount = expense.amount.toFixed(2);

    return `${date},${escapeCSVField(category)},${description},${amount}`;
  });

  return [header, ...rows].join('\n');
};
