import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { i18n } from '@/lib/translations/i18n';
import { logger } from './logger';

// Set notification handler to show alerts when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0ea5e9', // Trace cyan
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Updates the local notification schedule based on whether the user
 * has logged an expense today.
 * We schedule specifically for 20:00 every day up to 7 days ahead.
 */
export async function updateNotificationSchedule(hasExpenseToday: boolean) {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      logger.log('⚠️ Notification permission not granted');
      return;
    }

    // First clear any existing reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    const currentHour = now.getHours();

    // Determine the starting day for scheduling
    // If they already spent today, or it's past 20:00, start scheduling from tomorrow
    let daysToAddForFirstNotification = 0;

    if (hasExpenseToday || currentHour >= 20) {
      daysToAddForFirstNotification = 1;
    }

    // Schedule notifications for the next 7 days
    for (let i = 0; i < 7; i++) {
      const triggerDate = new Date();
      triggerDate.setDate(now.getDate() + daysToAddForFirstNotification + i);
      triggerDate.setHours(20);
      triggerDate.setMinutes(0);
      triggerDate.setSeconds(0);
      triggerDate.setMilliseconds(0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('notifications.reminder_title'),
          body: i18n.t('notifications.reminder_body'),
          sound: true,
        },
        trigger: {
          date: triggerDate,
          channelId: 'default',
        },
      });
    }

    logger.log('✅ Notification schedule updated');
  } catch (error) {
    logger.error('⚠️ Failed to update notification schedule:', error);
    // Don't throw - notifications are non-critical feature
  }
}
