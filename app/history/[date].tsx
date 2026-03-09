import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { ExpenseList } from '@/components/expense/ExpenseList';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import type { Expense } from '@/lib/store/types';
import { colors } from '@/lib/constants/design-tokens';
import { i18n } from '@/lib/translations/i18n';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { loadDayExpenses, deleteExpense } = useStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (date) {
      loadData();
    }
  }, [date]);

  const loadData = async () => {
    if (!date) return;
    const dateStr = Array.isArray(date) ? date[0] : date;
    const data = await loadDayExpenses(dateStr);
    setExpenses(data);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const dateStr = date ? (Array.isArray(date) ? date[0] : date) : '';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bgPrimary }}>
      <ExpenseList
        expenses={expenses}
        onDelete={async (id) => {
          await deleteExpense(id);
          loadData();
        }}
        emptyMessage={i18n.t('history.day_empty')}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + 8 }}>
            {/* Navigation Bar */}
            <View className="flex-row items-center px-2 mb-6">
              <Pressable
                onPress={handleBack}
                className="flex-row items-center p-2 -ml-1 rounded-xl active:opacity-50"
                accessibilityRole="button"
                accessibilityLabel={i18n.t('common.back')}
              >
                <Ionicons name="chevron-back" size={22} color={colors.primary} />
                <Text className="text-base font-medium ml-0.5" style={{ color: colors.primary }}>
                  Geri
                </Text>
              </Pressable>
            </View>

            {/* Day Summary Card */}
            <View className="mx-1 mb-6 rounded-2xl p-5" style={{ backgroundColor: colors.bgSecondary }}>
              <Text className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                {dateStr && formatDateRelative(dateStr)}
              </Text>
              <Text className="text-3xl font-black" style={{ color: colors.textPrimary }}>
                {formatCurrency(total)}
              </Text>
              <Text className="text-xs font-medium mt-2" style={{ color: colors.textTertiary }}>
                {expenses.length} harcama
              </Text>
            </View>

            {/* Section Title */}
            {expenses.length > 0 && (
              <Text className="text-base font-semibold mb-3 px-2" style={{ color: colors.textPrimary }}>
                Harcamalar
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}
