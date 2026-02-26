// Single Expense List Item (Swipeable)
// Based on ROADMAP §4 Component Inventory & Antigravity Final Protocol

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
import { neonColors } from '@/lib/constants/design-tokens';

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: (id: number) => void;
  showDate?: boolean;
  index?: number;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
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
      entering={FadeInRight.delay(index * 50)
        .springify()
        .damping(14)}
      exiting={FadeOutLeft.duration(300)}
      layout={CurvedTransition.delay(100)}
      className="mb-2 overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md"
    >
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-1 flex-row items-center gap-3">
          {expense.category && <Badge category={expense.category} size="md" />}
          <View className="flex-1">
            <Text
              className="text-white text-base font-medium mb-1"
              numberOfLines={1}
            >
              {expense.description}
            </Text>
            {showDate && (
              <Text className="text-slate-400 text-xs font-medium">
                {formatDateRelative(expense.date)}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <Text className="text-white text-lg font-bold tracking-tight">
            {formatCurrency(expense.amount)}
          </Text>

          {onDelete && (
            <Pressable
              onPress={handleDelete}
              className="p-2 rounded-xl active:bg-red-500/20 active:scale-95 transition-all"
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.delete_label')}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={neonColors.danger}
              />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
};
