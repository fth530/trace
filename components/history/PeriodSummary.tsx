import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';

interface PeriodSummaryProps {
  weeklyTotal: number;
  monthlyTotal: number;
}

export function PeriodSummary({
  weeklyTotal,
  monthlyTotal,
}: PeriodSummaryProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute bottom-0 left-0 right-0">
      <View
        className="px-5 py-5 pointer-events-none"
        style={{
          backgroundColor: 'rgba(0,0,0,0.94)',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.separator,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1 items-center" style={{ borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.separator }}>
            <Text className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: colors.textSecondary }}>
              {i18n.t('history.week_label')}
            </Text>
            <Text className="text-xl font-bold" numberOfLines={1} style={{ color: colors.textPrimary }}>
              {formatCurrency(weeklyTotal)}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: colors.textSecondary }}>
              {i18n.t('history.month_label')}
            </Text>
            <Text className="text-xl font-bold" numberOfLines={1} style={{ color: colors.textPrimary }}>
              {formatCurrency(monthlyTotal)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
