// S-Class Home Screen
// Based on Antigravity Protocol

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { DailyTotal } from '@/components/expense/DailyTotal';
import { ExpenseList } from '@/components/expense/ExpenseList';
import { LimitProgress } from '@/components/limit/LimitProgress';
import { LimitBanner } from '@/components/limit/LimitBanner';
import { getLimitStatus } from '@/lib/utils/limits';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { logger } from '@/lib/utils/logger';
import { LinearGradient } from 'expo-linear-gradient';
import { i18n } from '@/lib/translations/i18n';
import {
  gradients,
  gradientLocations,
  neonColors,
  neonShadow,
} from '@/lib/constants/design-tokens';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const {
    todayExpenses,
    todayTotal,
    monthTotal,
    settings,
    isLoading,
    init,
    deleteExpense,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerData, setBannerData] = useState<{
    percentage: number;
    type: 'daily' | 'monthly';
    limit: number;
    message: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    init();
  }, []); // Empty dependency - init is stable from Zustand

  useEffect(() => {
    checkLimits();
  }, [todayTotal, monthTotal, settings.daily_limit, settings.monthly_limit]);

  const checkLimits = () => {
    const dailyStatus = getLimitStatus(
      todayTotal,
      settings.daily_limit,
      'daily',
      'dark',
    );

    if (dailyStatus.shouldShowBanner) {
      setBannerData({
        percentage: dailyStatus.percentage,
        type: 'daily',
        limit: settings.daily_limit,
        message: dailyStatus.message || '',
        color: dailyStatus.color,
      });
      setShowBanner(true);
      return;
    }

    const monthlyStatus = getLimitStatus(
      monthTotal,
      settings.monthly_limit,
      'monthly',
      'dark',
    );

    if (monthlyStatus.shouldShowBanner) {
      setBannerData({
        percentage: monthlyStatus.percentage,
        type: 'monthly',
        limit: settings.monthly_limit,
        message: monthlyStatus.message || '',
        color: monthlyStatus.color,
      });
      setShowBanner(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await init();
    } catch (error) {
      logger.error('Refresh failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('home.refresh_error'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = useCallback(async (id: number) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteExpense(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Delete failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('home.delete_error'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [deleteExpense]);

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/modal/add-expense');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color={neonColors.mint} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* S-Class Antigravity Background Glow */}
      <View className="absolute top-0 w-full h-full opacity-40 pointer-events-none">
        <LinearGradient
          colors={gradients.main}
          locations={gradientLocations.main}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      {showBanner && bannerData && (
        <LimitBanner
          percentage={bannerData.percentage}
          type={bannerData.type}
          limit={bannerData.limit}
          message={bannerData.message}
          color={bannerData.color}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Main List */}
      <Animated.View
        style={{ flex: 1 }}
        entering={FadeInDown.duration(800).springify().damping(16).stiffness(120)}
      >
        <ExpenseList
          expenses={todayExpenses}
          onDelete={handleDelete}
          emptyMessage={i18n.t('home.empty_encouraging')}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={neonColors.cyan}
              colors={[neonColors.cyan, neonColors.mint]}
            />
          }
          ListHeaderComponent={
            <View>
              <DailyTotal
                amount={todayTotal}
                limit={settings.daily_limit}
                isToday={true}
              />

              <View className="mb-6 px-4">
                <LimitProgress
                  current={todayTotal}
                  limit={settings.daily_limit}
                  type="daily"
                />
                <LimitProgress
                  current={monthTotal}
                  limit={settings.monthly_limit}
                  type="monthly"
                />
              </View>
            </View>
          }
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={{ position: 'absolute', bottom: 100, right: 24, zIndex: 10 }}
      >
        <Pressable
          onPress={handleAddExpense}
          className="w-16 h-16 rounded-full items-center justify-center border border-white/20 active:scale-95 transition-all outline-none"
          style={neonShadow(neonColors.mint, 'lg')}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('common.add_label')}
        >
          {/* FAB Solid Color */}
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 32,
              backgroundColor: neonColors.mint,
              opacity: 0.9,
            }}
          />
          <Ionicons name="add" size={36} color="black" />
        </Pressable>
      </Animated.View>
    </View>
  );
}
