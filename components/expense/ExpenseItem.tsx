// Single Expense List Item (Swipeable)
// Based on ROADMAP §4 Component Inventory

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import type { Expense } from '@/lib/store/types';

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: (id: number) => void;
  showDate?: boolean;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onDelete,
  showDate = false,
}) => {
  const t = useThemeColors();

  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete(expense.id);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.surface }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {expense.category && (
            <Badge category={expense.category} size="sm" />
          )}
          <View style={styles.details}>
            <Text style={[styles.description, { color: t.textPrimary }]} numberOfLines={1}>
              {expense.description}
            </Text>
            {showDate && (
              <Text style={[styles.date, { color: t.textTertiary }]}>
                {formatDateRelative(expense.date)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: t.textPrimary }]}>
            {formatCurrency(expense.amount)}
          </Text>

          {onDelete && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && { backgroundColor: t.danger + '20' },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Harcamayı sil"
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={t.danger}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: typography.body.fontSize,
    marginBottom: 4,
  },
  date: {
    fontSize: typography.caption.fontSize,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amount: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
  },
  deleteButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
});
