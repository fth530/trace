// S-Class History Screen
// Based on Antigravity Protocol

import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { DaySummaryCard } from '@/components/history/DaySummaryCard';
import { PeriodSummary } from '@/components/history/PeriodSummary';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';
import {
  gradients,
  gradientLocations,
  neonColors,
} from '@/lib/constants/design-tokens';
import * as Haptics from 'expo-haptics';

export default function HistoryScreen() {
  const { history, weekTotal, monthTotal, loadHistory } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Universal Antigravity Background Glow */}
      <View className="absolute top-0 w-full h-full opacity-40 pointer-events-none">
        <LinearGradient
          colors={gradients.main}
          locations={gradientLocations.main}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <Animated.View
        style={{ flex: 1 }}
        entering={FadeInDown.duration(800).springify().damping(16).stiffness(120)}
      >
        <FlatList
          data={history}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <DaySummaryCard
              date={item.date}
              total={item.total}
              count={item.count}
            />
          )}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 260, // Extended space for Safe Area & S-Class PeriodSummary
          }}
          ListEmptyComponent={
            <View className="items-center mt-32">
              <Text className="text-slate-400 font-medium text-lg tracking-wide">
                {i18n.t('history.empty')}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={neonColors.mint}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <PeriodSummary weeklyTotal={weekTotal} monthlyTotal={monthTotal} />
    </View>
  );
}
