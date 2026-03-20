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
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';
import * as Haptics from 'expo-haptics';

const DUMMY_CATEGORIES: CategorySummary[] = [
  { category: 'Yemek', count: 12, total: 1850 },
  { category: 'Yol', count: 8, total: 1200 },
  { category: 'Market', count: 6, total: 2400 },
  { category: 'Diğer', count: 4, total: 650 },
];
const DUMMY_MONTH_TOTAL = 6100;

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
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeWeeklySummary(history: DaySummary[]) {
  const today = new Date();
  const currentWeekStart = getStartOfWeek(today);
  const weekBuckets: number[] = [0, 0, 0, 0, 0];
  const thisWeekDays: { day: string; total: number }[] = [];

  for (const entry of history) {
    const entryDate = new Date(entry.date + 'T00:00:00');
    const diffMs = currentWeekStart.getTime() - getStartOfWeek(entryDate).getTime();
    const weekIndex = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    if (weekIndex >= 0 && weekIndex < 5) weekBuckets[weekIndex] += entry.total;
    if (weekIndex === 0) thisWeekDays.push({ day: DAY_NAMES[entryDate.getDay()], total: entry.total });
  }

  const weeks: WeekData[] = WEEK_LABELS.map((label, i) => {
    const prevTotal = weekBuckets[i + 1];
    const change = prevTotal > 0 ? ((weekBuckets[i] - prevTotal) / prevTotal) * 100 : null;
    return { label, total: weekBuckets[i], change };
  });

  const daysElapsed = Math.min(((today.getTime() - currentWeekStart.getTime()) / (24 * 60 * 60 * 1000)) + 1, 7);
  const dailyAvg = daysElapsed > 0 ? weekBuckets[0] / Math.floor(daysElapsed) : 0;

  let bestDay = null, worstDay = null;
  if (thisWeekDays.length > 0) {
    const sorted = [...thisWeekDays].sort((a, b) => a.total - b.total);
    bestDay = sorted[0];
    worstDay = sorted[sorted.length - 1];
  }

  return { weeks, dailyAvg, bestDay, worstDay };
}

const AnimatedProgressBar = ({ barWidth, color, delay = 0 }: { barWidth: number; color: string; delay: number }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(delay, withSpring(barWidth, { damping: 16, stiffness: 90 }));
  }, [barWidth, delay]);

  const style = useAnimatedStyle(() => ({ width: `${Math.max(0, width.value)}%` }));

  return (
    <Animated.View style={[style, { height: '100%', borderRadius: 4, backgroundColor: color }]} />
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

  useFocusEffect(useCallback(() => { loadData(); }, []));

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
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <Animated.ScrollView
        entering={FadeInDown.duration(350)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: insets.top + 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textSecondary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
            HARCAMA ANALİZİ
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>
            Analiz
          </Text>
        </View>

        {/* Month Total Card */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(400)}
          style={{
            borderRadius: 22,
            padding: 22,
            marginBottom: 16,
            backgroundColor: '#141420',
            borderWidth: 1,
            borderColor: `${colors.primary}20`,
            overflow: 'hidden',
          }}
        >
          <View style={{ height: 2, backgroundColor: colors.primary, opacity: 0.6, position: 'absolute', top: 0, left: 0, right: 0 }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
            {i18n.t('analytics.month_total')}
          </Text>
          <Text style={{ fontSize: 44, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1.5, marginBottom: 16 }}>
            {formatCurrency(displayTotal)}
          </Text>

          {/* Category dots */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {displayCategories.map((item, index) => {
              const catName = (item.category as Category) || ('Diğer' as Category);
              const config = categoryConfig[catName] || { label: catName, color: colors.gray500 };
              const pct = (item.total / displayTotal) * 100;
              return (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: config.color }} />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
                    {config.label} · {pct.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {isUsingDummy && (
          <View style={{
            borderRadius: 14,
            padding: 12,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${colors.primary}10`,
            borderWidth: 1,
            borderColor: `${colors.primary}20`,
          }}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 12, fontWeight: '600', flex: 1, color: colors.primary }}>
              Örnek veri gösteriliyor. Harcama ekledikçe gerçek veriler görünecek.
            </Text>
          </View>
        )}

        {/* Weekly Summary */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>
            Haftalık Özet
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          style={{ marginBottom: 18 }}
        >
          {displayWeeks.map((week, index) => (
            <Animated.View
              entering={FadeInRight.delay(index * 70).duration(400)}
              key={index}
              style={{
                borderRadius: 18,
                padding: 16,
                width: 148,
                backgroundColor: colors.bgSecondary,
                borderWidth: 1,
                borderColor: index === 0 ? `${colors.primary}30` : colors.separator,
              }}
            >
              {index === 0 && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: colors.primary,
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                  opacity: 0.7,
                }} />
              )}
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, marginBottom: 8 }}>
                {week.label}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 }}>
                {formatCurrency(week.total)}
              </Text>
              {week.change !== null ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons
                    name={week.change >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={week.change >= 0 ? colors.danger : colors.success}
                  />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: week.change >= 0 ? colors.danger : colors.success }}>
                    {Math.abs(week.change).toFixed(1)}%
                  </Text>
                </View>
              ) : (
                <Text style={{ fontSize: 12, color: colors.textTertiary }}>—</Text>
              )}
            </Animated.View>
          ))}
        </ScrollView>

        {/* Daily avg + best/worst */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
          <View style={{
            flex: 1,
            borderRadius: 18,
            padding: 16,
            backgroundColor: colors.bgSecondary,
            borderWidth: 1,
            borderColor: colors.separator,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 }}>
              <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="today-outline" size={14} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary }}>GÜNLÜK ORT.</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
              {formatCurrency(Math.round(displayDailyAvg))}
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textTertiary, marginTop: 4 }}>bu hafta</Text>
          </View>

          <View style={{
            flex: 1,
            borderRadius: 18,
            padding: 16,
            backgroundColor: colors.bgSecondary,
            borderWidth: 1,
            borderColor: colors.separator,
          }}>
            {displayBestDay && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 }}>
                  <Ionicons name="trending-down" size={13} color={colors.success} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.success }}>EN AZ</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                  {displayBestDay.day}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textSecondary }}>
                  {formatCurrency(displayBestDay.total)}
                </Text>
              </View>
            )}
            {displayWorstDay && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 }}>
                  <Ionicons name="trending-up" size={13} color={colors.danger} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.danger }}>EN ÇOK</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                  {displayWorstDay.day}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textSecondary }}>
                  {formatCurrency(displayWorstDay.total)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Category Breakdown */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 }}>
          {i18n.t('analytics.category_title')}
        </Text>

        {displayCategories.map((item, index) => {
          const catName = (item.category as Category) || ('Diğer' as Category);
          const config = categoryConfig[catName] || { icon: 'cube-outline', label: catName, color: colors.gray500 };
          const percentage = (item.total / displayTotal) * 100;
          const barWidth = (item.total / maxTotal) * 100;

          return (
            <Animated.View
              entering={FadeInRight.delay(index * 60)}
              key={index}
              style={{
                borderRadius: 18,
                padding: 16,
                marginBottom: 10,
                backgroundColor: colors.bgSecondary,
                borderWidth: 1,
                borderColor: colors.separator,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: `${config.color}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: `${config.color}25`,
                }}>
                  <Ionicons name={config.icon as any} size={20} color={config.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: colors.textPrimary }}>
                    {config.label}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textTertiary, marginTop: 2 }}>
                    {item.count} {i18n.t('analytics.transaction_count')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '800', fontSize: 16, color: colors.textPrimary }}>
                    {formatCurrency(item.total)}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: config.color, marginTop: 2 }}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={{ height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: colors.bgTertiary }}>
                <AnimatedProgressBar barWidth={barWidth} color={config.color} delay={index * 80} />
              </View>
            </Animated.View>
          );
        })}

        {/* Insight */}
        <View style={{
          borderRadius: 18,
          padding: 16,
          marginTop: 6,
          backgroundColor: colors.bgSecondary,
          borderWidth: 1,
          borderColor: `${colors.warning}20`,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: `${colors.warning}15`, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="bulb" size={16} color={colors.warning} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Özet</Text>
          </View>
          <Text style={{ fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>
            {displayCategories.length > 0
              ? `En çok harcama "${categoryConfig[(displayCategories[0].category as Category) || 'Diğer']?.label || 'Diğer'}" kategorisinde. Toplam ${displayCategories.length} farklı kategoride harcama yapıldı.`
              : 'Henüz harcama verisi bulunmuyor.'}
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
