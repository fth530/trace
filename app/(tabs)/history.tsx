import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { spacing } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { DaySummaryCard } from '../../components/history/DaySummaryCard';
import { PeriodSummary } from '../../components/history/PeriodSummary';

export default function HistoryScreen() {
  const { history, weekTotal, monthTotal, loadHistory } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.dark }}>
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
          padding: spacing.md,
          paddingBottom: spacing.xxxl + spacing.lg,
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: spacing.xxxl }}>
            <Text
              style={{
                fontSize: typography.body.fontSize,
                color: colors.text.secondary.dark,
              }}
            >
              Son 30 günde harcama yok
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent.dark}
          />
        }
      />
      <PeriodSummary weeklyTotal={weekTotal} monthlyTotal={monthTotal} />
    </View>
  );
}
