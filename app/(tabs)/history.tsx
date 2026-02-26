import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { DaySummaryCard } from '@/components/history/DaySummaryCard';
import { PeriodSummary } from '@/components/history/PeriodSummary';
import { LinearGradient } from 'expo-linear-gradient';
import { i18n } from '@/lib/translations/i18n';
import {
  gradients,
  gradientLocations,
  neonColors,
} from '@/lib/constants/design-tokens';

export default function HistoryScreen() {
  const { history, weekTotal, monthTotal, loadHistory } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Universal Antigravity Background Glow */}
      <View className="absolute top-0 w-full h-full opacity-20 pointer-events-none">
        <LinearGradient
          colors={gradients.main}
          locations={gradientLocations.main}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

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
          padding: 16,
          paddingBottom: 240, // Extended space for safe area and tab bar on Android
        }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-slate-400 font-medium text-lg">
              {i18n.t('history.empty')}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={neonColors.cyan}
          />
        }
      />
      <PeriodSummary weeklyTotal={weekTotal} monthlyTotal={monthTotal} />
    </View>
  );
}
