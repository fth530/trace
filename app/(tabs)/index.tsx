// Home Screen (Bugün)
// Based on ROADMAP §6.1 Home Screen Specification

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { spacing } from '@/lib/constants/spacing';
import { DailyTotal } from '@/components/expense/DailyTotal';
import { ExpenseList } from '@/components/expense/ExpenseList';
import { LimitProgress } from '@/components/limit/LimitProgress';
import { LimitBanner } from '@/components/limit/LimitBanner';
import { getLimitStatus } from '@/lib/utils/limits';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
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

  const t = useThemeColors();
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
  }, [init]);

  // Check limits when todayTotal or monthTotal changes
  useEffect(() => {
    checkLimits();
  }, [todayTotal, monthTotal, settings.daily_limit, settings.monthly_limit]);

  const checkLimits = () => {
    const dailyStatus = getLimitStatus(
      todayTotal,
      settings.daily_limit,
      'daily',
      t.scheme
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
      t.scheme
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
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteExpense(id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/modal/add-expense');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.accent}
          />
        }
      >
        <DailyTotal
          amount={todayTotal}
          limit={settings.daily_limit}
          isToday={true}
        />

        <View style={styles.limitsContainer}>
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

        <ExpenseList
          expenses={todayExpenses}
          onDelete={handleDelete}
          emptyMessage="Henüz harcama eklemedin"
        />
      </ScrollView>

      <Pressable
        onPress={handleAddExpense}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: t.accent },
          pressed && styles.fabPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Harcama ekle"
      >
        <Ionicons name="add" size={32} color={t.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitsContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
});
