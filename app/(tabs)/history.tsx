import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/lib/store';
import { DaySummaryCard } from '@/components/history/DaySummaryCard';
import { PeriodSummary } from '@/components/history/PeriodSummary';
import { SpendingCalendar } from '@/components/history/SpendingCalendar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const getDummyHistory = () => {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      total: Math.round(80 + Math.random() * 600),
      count: Math.round(1 + Math.random() * 5),
    };
  });
};

export default function HistoryScreen() {
  const { history, weekTotal, monthTotal, settings, loadHistory } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const isUsingDummy = history.length === 0;
  const displayHistory = isUsingDummy ? getDummyHistory() : history;
  const displayWeek = isUsingDummy ? 2340 : weekTotal;
  const displayMonth = isUsingDummy ? 6100 : monthTotal;

  return (
    <View className="flex-1 bg-black">
      <Animated.View
        style={{ flex: 1 }}
        entering={FadeInDown.duration(350)}
      >
        <FlatList
          data={displayHistory}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <DaySummaryCard
              date={item.date}
              total={item.total}
              count={item.count}
              disabled={isUsingDummy}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 200,
            paddingTop: insets.top + 16,
          }}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                Geçmiş
              </Text>

              {/* Spending Calendar */}
              <SpendingCalendar
                data={displayHistory}
                dailyLimit={settings.daily_limit}
              />

              {isUsingDummy && (
                <View className="rounded-xl p-3 mb-4 flex-row items-center" style={{ backgroundColor: `${colors.primary}12` }}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text className="text-xs font-medium flex-1" style={{ color: colors.primary }}>
                    Henüz veri yok. Veriler örnek olarak gösterilmektedir.
                  </Text>
                </View>
              )}

              <Text className="text-base font-semibold mb-3 px-1" style={{ color: colors.textPrimary }}>
                Günlük Özet
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.textSecondary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <PeriodSummary weeklyTotal={displayWeek} monthlyTotal={displayMonth} />
    </View>
  );
}
