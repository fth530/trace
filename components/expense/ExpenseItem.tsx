import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const catColor = cat.color;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 40).duration(350)}
      exiting={FadeOutLeft.duration(250)}
      layout={CurvedTransition.delay(50)}
      style={styles.container}
    >
      {/* Left accent bar */}
      <View style={[styles.leftBar, { backgroundColor: catColor }]} />

      <View style={styles.inner}>
        {/* Category icon */}
        <LinearGradient
          colors={[`${catColor}35`, `${catColor}15`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBox}
        >
          <Ionicons name={cat.icon as any} size={22} color={catColor} />
        </LinearGradient>

        {/* Text */}
        <View style={styles.textArea}>
          <Text style={styles.expenseTitle} numberOfLines={1}>
            {expense.description}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.catBadge, { backgroundColor: `${catColor}18` }]}>
              <Text style={[styles.catBadgeText, { color: catColor }]}>{cat.label}</Text>
            </View>
            {showDate && (
              <Text style={styles.dateText}>{formatDateRelative(expense.date)}</Text>
            )}
          </View>
        </View>

        {/* Amount + delete */}
        <View style={styles.rightArea}>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
          {onDelete && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('common.delete_label')}
            >
              <Ionicons name="trash-outline" size={14} color={colors.danger} />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: 'rgba(150,150,255,0.07)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  leftBar: {
    width: 3,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    opacity: 0.7,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textArea: {
    flex: 1,
    gap: 5,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  rightArea: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: `${colors.danger}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
