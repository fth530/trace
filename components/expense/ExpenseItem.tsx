import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import type { Expense } from '@/lib/store/types';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  CurvedTransition,
} from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: (id: number) => void;
  showDate?: boolean;
  index?: number;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = React.memo(({
  expense,
  onDelete,
  showDate = false,
  index = 0,
}) => {
  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete(expense.id);
    }
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 30)}
      exiting={FadeOutLeft.duration(250)}
      layout={CurvedTransition.delay(50)}
      className="mb-2 rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.bgSecondary }}
    >
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-1 flex-row items-center gap-3">
          {expense.category && <Badge category={expense.category} size="md" />}
          <View className="flex-1">
            <Text
              className="text-[15px] font-medium mb-0.5"
              numberOfLines={1}
              style={{ color: colors.textPrimary }}
            >
              {expense.description}
            </Text>
            {showDate && (
              <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                {formatDateRelative(expense.date)}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(expense.amount)}
          </Text>

          {onDelete && (
            <Pressable
              onPress={handleDelete}
              className="p-2 rounded-full active:opacity-50"
              style={{ backgroundColor: `${colors.danger}12` }}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.delete_label')}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={colors.danger}
              />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
});
