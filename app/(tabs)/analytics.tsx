import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils/currency';
import { CategorySummary, DaySummary } from '@/lib/store/types';
import { categoryConfig, Category } from '@/lib/constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import Animated, { FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';
import { colors, shadow } from '@/lib/constants/design-tokens';
import * as Haptics from 'expo-haptics';

const DUMMY_CATEGORIES: CategorySummary[] = [
  { category: 'Yemek', count: 12, total: 1850 },
  { category: 'Yol', count: 8, total: 1200 },
  { category: 'Market', count: 6, total: 2400 },
  { category: 'Diğer', count: 4, total: 650 },
];
const DUMMY_MONTH_TOTAL = 6100;

// Dummy weekly data for when history is empty
const DUMMY_WEEKLY_DATA = [
  { label: 'Bu Hafta', total: 1450, change: -12.5 },
  { label: 'Geçen Hafta', total: 1660, change: 8.3 },
  { label: '2 Hafta Önce', total: 1530, change: -5.1 },
  { label: '3 Hafta Önce', total: 1610, change: 15.2 },
];
const DUMMY_DAILY_AVG = 207;
const DUMMY_BEST_DAY = { day: 'Salı', total: 85 };
const DUMMY_WORST_DAY = { day: 'Cuma', total: 420 };

const WEEK_LABELS = ['Bu Hafta', 'Geçen Hafta', '2 Hafta Önce', '3 Hafta Önce'];
const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

interface WeekData {
  label: string;
  total: number;
  change: number | null;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday as start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeWeeklySummary(history: DaySummary[]): {
  weeks: WeekData[];
  dailyAvg: number;
  bestDay: { day: string; total: number } | null;
  worstDay: { day: string; total: number } | null;
} {
  const today = new Date();
  const currentWeekStart = getStartOfWeek(today);

  // Build 5 weeks (4 displayed + 1 extra for change calc on week 4)
  const weekBuckets: number[] = [0, 0, 0, 0, 0];
  const thisWeekDays: { day: string; total: number }[] = [];

  for (const entry of history) {
    const entryDate = new Date(entry.date + 'T00:00:00');
    const diffMs = currentWeekStart.getTime() - getStartOfWeek(entryDate).getTime();
    const weekIndex = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

    if (weekIndex >= 0 && weekIndex < 5) {
      weekBuckets[weekIndex] += entry.total;
    }

    if (weekIndex === 0) {
      const dayName = DAY_NAMES[entryDate.getDay()];
      thisWeekDays.push({ day: dayName, total: entry.total });
    }
  }

  const weeks: WeekData[] = WEEK_LABELS.map((label, i) => {
    const prevTotal = weekBuckets[i + 1];
    let change: number | null = null;
    if (prevTotal > 0) {
      change = ((weekBuckets[i] - prevTotal) / prevTotal) * 100;
    }
    return { label, total: weekBuckets[i], change };
  });

  // Daily average for current week
  const daysElapsed = Math.min(
    ((today.getTime() - currentWeekStart.getTime()) / (24 * 60 * 60 * 1000)) + 1,
    7
  );
  const dailyAvg = daysElapsed > 0 ? weekBuckets[0] / Math.floor(daysElapsed) : 0;

  // Best/worst day
  let bestDay: { day: string; total: number } | null = null;
  let worstDay: { day: string; total: number } | null = null;
  if (thisWeekDays.length > 0) {
    const sorted = [...thisWeekDays].sort((a, b) => a.total - b.total);
    bestDay = sorted[0];
    worstDay = sorted[sorted.length - 1];
  }

  return { weeks, dailyAvg, bestDay, worstDay };
}

const AnimatedProgressBar = ({ barWidth, color, delay = 0 }: { barWidth: number, color: string, delay: number }) => {
  const widthResult = useSharedValue(0);

  useEffect(() => {
    widthResult.value = withDelay(delay, withSpring(barWidth, { damping: 16, stiffness: 90 }));
  }, [barWidth, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, widthResult.value)}%`,
  }));

  return (
    <Animated.View
      className="h-full rounded-full"
      style={[animatedStyle, { backgroundColor: color }]}
    />
  );
};

export default function AnalyticsScreen() {
  const { monthTotal, loadMonthCategoryData, history, loadHistory } = useStore();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const loadData = async () => {
    const data = await loadMonthCategoryData();
    setCategories(data);
    await loadHistory();
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const isUsingDummy = categories.length === 0;
  const displayCategories = isUsingDummy ? DUMMY_CATEGORIES : categories;
  const displayTotal = isUsingDummy ? DUMMY_MONTH_TOTAL : monthTotal;

  const isWeeklyDummy = history.length === 0;
  const weeklySummary = useMemo(() => computeWeeklySummary(history), [history]);
  const displayWeeks = isWeeklyDummy ? DUMMY_WEEKLY_DATA : weeklySummary.weeks;
  const displayDailyAvg = isWeeklyDummy ? DUMMY_DAILY_AVG : weeklySummary.dailyAvg;
  const displayBestDay = isWeeklyDummy ? DUMMY_BEST_DAY : weeklySummary.bestDay;
  const displayWorstDay = isWeeklyDummy ? DUMMY_WORST_DAY : weeklySummary.worstDay;
  const maxTotal = Math.max(...displayCategories.map((c) => c.total), 1);

  return (
    <View className="flex-1 bg-black">
      <Animated.ScrollView
        entering={FadeInDown.duration(350)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: insets.top + 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <Text className="text-2xl font-bold mb-5" style={{ color: colors.textPrimary }}>
          Analiz
        </Text>

        {/* Month Total Card */}
        <View
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: colors.bgSecondary }}
        >
          <Text className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: colors.textSecondary }}>
            {i18n.t('analytics.month_total')}
          </Text>
          <Text className="text-4xl font-black tracking-tight mb-4" style={{ color: colors.textPrimary }}>
            {formatCurrency(displayTotal)}
          </Text>

          {/* Mini category breakdown dots */}
          <View className="flex-row gap-4">
            {displayCategories.map((item, index) => {
              const catName = (item.category as Category) || ('Diğer' as Category);
              const config = categoryConfig[catName] || { label: catName, color: colors.gray500 };
              const pct = (item.total / displayTotal) * 100;
              return (
                <View key={index} className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: config.color }} />
                  <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    {config.label} {pct.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {isUsingDummy && (
          <View className="rounded-xl p-3 mb-5 flex-row items-center" style={{ backgroundColor: `${colors.primary}12` }}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text className="text-xs font-medium flex-1" style={{ color: colors.primary }}>
              Henüz veri yok. Aşağıdaki veriler örnek olarak gösterilmektedir.
            </Text>
          </View>
        )}

        {/* Haftalık Özet */}
        <Text className="text-base font-bold mb-4 px-1" style={{ color: colors.textPrimary }}>
          Haftalık Özet
        </Text>

        {/* Weekly Trend Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          style={{ marginBottom: 16 }}
        >
          {displayWeeks.map((week, index) => (
            <Animated.View
              entering={FadeInRight.delay(index * 80).duration(400)}
              key={index}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: colors.bgSecondary,
                width: 150,
              }}
            >
              <Text className="text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>
                {week.label}
              </Text>
              <Text className="text-lg font-bold mb-1" style={{ color: colors.textPrimary }}>
                {formatCurrency(week.total)}
              </Text>
              {week.change !== null && week.change !== undefined ? (
                <View className="flex-row items-center">
                  <Ionicons
                    name={week.change >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={week.change >= 0 ? colors.danger : colors.success}
                  />
                  <Text
                    className="text-xs font-semibold ml-1"
                    style={{ color: week.change >= 0 ? colors.danger : colors.success }}
                  >
                    {Math.abs(week.change).toFixed(1)}%
                  </Text>
                </View>
              ) : (
                <Text className="text-xs font-medium" style={{ color: colors.textTertiary }}>—</Text>
              )}
            </Animated.View>
          ))}
        </ScrollView>

        {/* Daily Average & Best/Worst Day */}
        <View className="flex-row gap-3 mb-6">
          {/* Daily Average */}
          <View
            className="flex-1 rounded-2xl p-4"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="today-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                Günlük Ortalama
              </Text>
            </View>
            <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              {formatCurrency(Math.round(displayDailyAvg))}
            </Text>
            <Text className="text-[10px] font-medium mt-1" style={{ color: colors.textTertiary }}>
              bu hafta
            </Text>
          </View>

          {/* Best & Worst Day */}
          <View
            className="flex-1 rounded-2xl p-4"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            {displayBestDay && (
              <View className="mb-3">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="trending-down" size={14} color={colors.success} style={{ marginRight: 4 }} />
                  <Text className="text-[10px] font-semibold" style={{ color: colors.success }}>
                    EN AZ
                  </Text>
                </View>
                <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                  {displayBestDay.day}{' '}
                  <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>
                    {formatCurrency(displayBestDay.total)}
                  </Text>
                </Text>
              </View>
            )}
            {displayWorstDay && (
              <View>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="trending-up" size={14} color={colors.danger} style={{ marginRight: 4 }} />
                  <Text className="text-[10px] font-semibold" style={{ color: colors.danger }}>
                    EN ÇOK
                  </Text>
                </View>
                <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                  {displayWorstDay.day}{' '}
                  <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>
                    {formatCurrency(displayWorstDay.total)}
                  </Text>
                </Text>
              </View>
            )}
            {!displayBestDay && !displayWorstDay && (
              <Text className="text-xs font-medium" style={{ color: colors.textTertiary }}>Veri yok</Text>
            )}
          </View>
        </View>

        {/* Category Breakdown */}
        <Text className="text-base font-bold mb-4 px-1" style={{ color: colors.textPrimary }}>
          {i18n.t('analytics.category_title')}
        </Text>

        {displayCategories.map((item, index) => {
          const catName = (item.category as Category) || ('Diğer' as Category);
          const config = categoryConfig[catName] || {
            icon: 'cube-outline',
            label: catName,
            color: colors.gray500,
          };
          const percentage = (item.total / displayTotal) * 100;
          const barWidth = (item.total / maxTotal) * 100;

          return (
            <Animated.View
              entering={FadeInRight.delay(index * 50)}
              key={index}
              className="rounded-2xl p-4 mb-3"
              style={{ backgroundColor: colors.bgSecondary }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={20}
                      color={config.color}
                    />
                  </View>
                  <View>
                    <Text className="font-semibold text-[15px]" style={{ color: colors.textPrimary }}>
                      {config.label}
                    </Text>
                    <Text className="text-xs font-medium mt-0.5" style={{ color: colors.textSecondary }}>
                      {item.count} {i18n.t('analytics.transaction_count')}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-base" style={{ color: colors.textPrimary }}>
                    {formatCurrency(item.total)}
                  </Text>
                  <Text className="text-xs font-semibold mt-0.5" style={{ color: config.color }}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
                <AnimatedProgressBar barWidth={barWidth} color={config.color} delay={index * 80} />
              </View>
            </Animated.View>
          );
        })}

        {/* Insight Card */}
        <View className="rounded-2xl p-4 mt-3" style={{ backgroundColor: colors.bgSecondary }}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="bulb-outline" size={18} color={colors.warning} style={{ marginRight: 8 }} />
            <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>Özet</Text>
          </View>
          <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
            {displayCategories.length > 0
              ? `En çok harcama "${categoryConfig[(displayCategories[0].category as Category) || 'Diğer']?.label || 'Diğer'}" kategorisinde. Toplam ${displayCategories.length} farklı kategoride harcama yapıldı.`
              : 'Harcama verisi bulunmuyor.'}
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
