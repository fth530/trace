import { View, Text, FlatList, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { DaySummaryCard } from "@/components/history/DaySummaryCard";
import { PeriodSummary } from "@/components/history/PeriodSummary";
import { LinearGradient } from "expo-linear-gradient";
import { i18n } from "@/lib/translations/i18n";

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
      {/* Background Subtle Gradient */}
      <View className="absolute top-0 w-full h-[60vh] opacity-30">
        <LinearGradient
          colors={["#000000", "#1e1b4b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
          paddingBottom: 200, // Leave enough space for bottom floating elements
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
            tintColor="#0ea5e9"
          />
        }
      />
      <PeriodSummary weeklyTotal={weekTotal} monthlyTotal={monthTotal} />
    </View>
  );
}
