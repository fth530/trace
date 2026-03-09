import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import { colors } from '@/lib/constants/design-tokens';
import { Ionicons } from '@expo/vector-icons';
import { i18n } from '@/lib/translations/i18n';

interface DaySummaryCardProps {
  date: string;
  total: number;
  count: number;
  disabled?: boolean;
}

export function DaySummaryCard({ date, total, count, disabled }: DaySummaryCardProps) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/history/${date}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className="mb-3 rounded-2xl overflow-hidden active:opacity-70"
      style={{ backgroundColor: colors.bgSecondary, opacity: disabled ? 0.6 : 1 }}
      accessibilityRole="button"
      accessibilityLabel={`${formatDateRelative(date)}, ${count} harcama, toplam ${formatCurrency(total)}`}
    >
      <View className="p-4 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-base font-semibold mb-0.5" style={{ color: colors.textPrimary }}>
            {formatDateRelative(date)}
          </Text>
          <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            {count} {i18n.t('history.expense_count')}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(total)}
          </Text>
          {!disabled && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
        </View>
      </View>
    </Pressable>
  );
}
