import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { spacing } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { DaySummaryCard } from '@/components/history/DaySummaryCard';
import { PeriodSummary } from '@/components/history/PeriodSummary';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

export default function HistoryScreen() {
  const { history, weekTotal, monthTotal, loadHistory } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const t = useThemeColors();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
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
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: t.textSecondary }]}>
              Son 30 günde harcama yok
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={t.accent}
          />
        }
      />
      <PeriodSummary weeklyTotal={weekTotal} monthlyTotal={monthTotal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl + spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
  },
});
