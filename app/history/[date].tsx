import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { ExpenseList } from '@/components/expense/ExpenseList';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import { spacing } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { useThemeColors } from '@/lib/hooks/useThemeColors';
import type { Expense } from '@/lib/store/types';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { loadDayExpenses } = useStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const t = useThemeColors();

  useEffect(() => {
    if (date) {
      loadData();
    }
  }, [date]);

  const loadData = async () => {
    if (!date) return;
    const data = await loadDayExpenses(date);
    setExpenses(data);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <View style={[styles.header, { borderBottomColor: t.surface }]}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Geri"
            accessibilityHint="Geçmiş ekranına dön"
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={t.accent}
            />
          </Pressable>
          <Text style={[styles.dateText, { color: t.textPrimary }]}>
            {date && formatDateRelative(date)}
          </Text>
        </View>
        <Text style={[styles.totalText, { color: t.textPrimary }]}>
          {formatCurrency(total)}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ExpenseList
          expenses={expenses}
          emptyMessage="Bu günde harcama yok"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xl + spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  backButtonPressed: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
  },
  totalText: {
    fontSize: typography.hero.fontSize,
    fontWeight: typography.hero.fontWeight,
  },
  scrollContent: {
    padding: spacing.md,
  },
});
