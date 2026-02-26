import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { ExpenseList } from '@/components/expense/ExpenseList';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import type { Expense } from '@/lib/store/types';
import { LinearGradient } from 'expo-linear-gradient';
import {
  gradients,
  gradientLocations,
  neonColors,
} from '@/lib/constants/design-tokens';
import { i18n } from '@/lib/translations/i18n';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { loadDayExpenses, deleteExpense } = useStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (date) {
      loadData();
    }
  }, [date, deleteExpense]); // Reflect deletions immediately

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

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Universal Antigravity Background Glow */}
      <View className="absolute top-0 w-full h-full opacity-20 pointer-events-none">
        <LinearGradient
          colors={gradients.main}
          locations={gradientLocations.main}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <ExpenseList
        expenses={expenses}
        onDelete={async (id) => {
          await deleteExpense(id);
          loadData(); // Reload data after deletion
        }}
        emptyMessage={i18n.t('history.day_empty')}
        ListHeaderComponent={
          <View className="pt-16 px-4 pb-6 border-b border-white/5 mb-4">
            <View className="flex-row items-center mb-4">
              <Pressable
                onPress={handleBack}
                className="p-2 -ml-2 rounded-full active:bg-white/10"
                accessibilityRole="button"
                accessibilityLabel={i18n.t('common.back')}
                accessibilityHint={i18n.t('common.back_hint')}
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={neonColors.cyan}
                />
              </Pressable>
              <Text className="text-white text-3xl font-bold tracking-tight">
                {date &&
                  formatDateRelative(Array.isArray(date) ? date[0] : date)}
              </Text>
            </View>
            <Text className="text-sky-400 text-5xl font-black drop-shadow-lg">
              {formatCurrency(total)}
            </Text>
          </View>
        }
      />
    </View>
  );
}
