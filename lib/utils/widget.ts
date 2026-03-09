/**
 * Widget Data Sync Utility
 *
 * Writes expense data to a shared UserDefaults suite so the iOS WidgetKit
 * extension can read it. All operations are wrapped in try/catch and silently
 * fail when the native module is unavailable (Expo Go).
 */

import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WidgetData {
  todayTotal: number;
  dailyLimit: number;
  monthTotal: number;
  remainingToday: number;
  recentExpenses: Array<{
    description: string;
    amount: number;
    category: string;
  }>;
  weeklyData: Array<{
    date: string;
    total: number;
  }>;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUITE_NAME = 'group.com.trace.gunluk';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Serialise the current expense state into shared UserDefaults and ask
 * WidgetKit to refresh all timelines.
 *
 * This is intentionally fire-and-forget: widget updates should never block
 * the main app flow or surface errors to the user.
 */
export const updateWidgetData = async (data: WidgetData): Promise<void> => {
  if (Platform.OS !== 'ios') return;

  try {
    // Lazy-require so the import itself never throws during module
    // initialisation on Android or in Expo Go.
    const { WidgetBridge } = require('../../modules/widget-bridge');

    if (!WidgetBridge) {
      // Native module not available (Expo Go)
      return;
    }

    // Write each key individually so the widget can read only what it needs
    // without parsing a single giant JSON blob.
    await WidgetBridge.setItem(
      'todayTotal',
      String(data.todayTotal),
      SUITE_NAME,
    );
    await WidgetBridge.setItem(
      'dailyLimit',
      String(data.dailyLimit),
      SUITE_NAME,
    );
    await WidgetBridge.setItem(
      'monthTotal',
      String(data.monthTotal),
      SUITE_NAME,
    );
    await WidgetBridge.setItem(
      'remainingToday',
      String(data.remainingToday),
      SUITE_NAME,
    );
    await WidgetBridge.setItem(
      'recentExpenses',
      JSON.stringify(data.recentExpenses),
      SUITE_NAME,
    );
    await WidgetBridge.setItem(
      'weeklyData',
      JSON.stringify(data.weeklyData),
      SUITE_NAME,
    );
    await WidgetBridge.setItem(
      'lastUpdated',
      new Date().toISOString(),
      SUITE_NAME,
    );

    // Ask WidgetKit to reload all timelines so the widget picks up new data.
    await WidgetBridge.reloadWidgets();
  } catch (error) {
    // Silently swallow – widget sync must never crash the app.
    // This will also fire in Expo Go where the module is absent.
    console.log('Widget sync skipped:', (error as Error).message ?? error);
  }
};
