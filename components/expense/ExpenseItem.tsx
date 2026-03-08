// S-Class Single Expense List Item
// Based on Antigravity UI Architecture

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

export const ExpenseItem: React.FC<ExpenseItemProps> = React.memo(({
  expense,
  onDelete,
  showDate = false,
  index = 0,
}) => {
  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onDelete(expense.id);
    }
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50)
        .springify()
        .damping(16)
        .stiffness(120)}
      exiting={FadeOutLeft.duration(300).springify()}
      layout={CurvedTransition.delay(50)}
      className="mb-3 overflow-hidden rounded-3xl border border-white/5 bg-black/80 backdrop-blur-xl"
    >
      <View className="flex-row items-center justify-between p-5">
        <View className="flex-1 flex-row items-center gap-4">
          {expense.category && <Badge category={expense.category} size="md" />}
          <View className="flex-1">
            <Text
              className="text-white text-[15px] font-semibold tracking-wide mb-1"
              numberOfLines={1}
            >
              {expense.description}
            </Text>
            {showDate && (
              <Text className="text-slate-400 text-xs font-medium tracking-wider">
                {formatDateRelative(expense.date)}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          <Text className="text-white text-lg font-bold tracking-tight">
            {formatCurrency(expense.amount)}
          </Text>

          {onDelete && (
            <Pressable
              onPress={handleDelete}
              className="p-2.5 rounded-full bg-white/5 active:bg-red-500/20 active:scale-90 transition-all border border-white/5"
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.delete_label')}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={neonColors.crimson}
              />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
});
