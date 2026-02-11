// Single Expense List Item (Swipeable)
// Based on ROADMAP §4 Component Inventory

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
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
  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete(expense.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {expense.category && (
            <Badge category={expense.category} size="sm" />
          )}
          <View style={styles.details}>
            <Text style={styles.description} numberOfLines={1}>
              {expense.description}
            </Text>
            {showDate && (
              <Text style={styles.date}>
                {formatDateRelative(expense.date)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.amount}>
            {formatCurrency(expense.amount)}
          </Text>
          
          {onDelete && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Harcamayı sil"
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.danger.dark}
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
    backgroundColor: colors.surface.dark,
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
    color: colors.text.primary.dark,
    marginBottom: 4,
  },
  date: {
    fontSize: typography.caption.fontSize,
    color: colors.text.tertiary.dark,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amount: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: colors.text.primary.dark,
  },
  deleteButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  deleteButtonPressed: {
    backgroundColor: colors.danger.dark + '20',
  },
});
