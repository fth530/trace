// Animated Expense List
// Based on ROADMAP §4 Component Inventory

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { spacing } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { ExpenseItem } from './ExpenseItem';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import type { Expense } from '@/lib/store/types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (id: number) => void;
  emptyMessage?: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDelete,
  emptyMessage = 'Henüz harcama eklemedin',
}) => {
  const t = useThemeColors();

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: t.textTertiary }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ExpenseItem
          expense={item}
          onDelete={onDelete}
          showDate={false}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    textAlign: 'center',
  },
});
