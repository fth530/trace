import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import { categoryConfig } from '@/lib/constants/categories';
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

  const catKey = expense.category as keyof typeof categoryConfig;
  const cat = categoryConfig[catKey] || { icon: 'cube-outline', label: expense.category || 'Diğer', color: colors.primary };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 40).duration(350)}
      exiting={FadeOutLeft.duration(250)}
      layout={CurvedTransition.delay(50)}
      style={{
        marginBottom: 10,
        borderRadius: 18,
        backgroundColor: colors.bgSecondary,
        borderWidth: 1,
        borderColor: colors.separator,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
        {/* Category icon */}
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: `${cat.color}18`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          borderWidth: 1,
          borderColor: `${cat.color}25`,
        }}>
          <Ionicons name={cat.icon as any} size={20} color={cat.color} />
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: 3,
            }}
            numberOfLines={1}
          >
            {expense.description}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textTertiary }}>
            {cat.label}
            {showDate ? ` · ${formatDateRelative(expense.date)}` : ''}
          </Text>
        </View>

        {/* Amount + delete */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.textPrimary,
          }}>
            {formatCurrency(expense.amount)}
          </Text>

          {onDelete && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: pressed ? `${colors.danger}25` : `${colors.danger}12`,
                alignItems: 'center',
                justifyContent: 'center',
              })}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.delete_label')}
            >
              <Ionicons name="trash-outline" size={15} color={colors.danger} />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
});
