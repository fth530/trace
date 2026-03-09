import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DailyTotalProps {
  amount: number;
  limit: number;
  isToday: boolean;
}

export const DailyTotal: React.FC<DailyTotalProps> = ({
  amount,
  limit,
  isToday,
}) => {
  const isOverLimit = limit > 0 && amount > limit;
  const isWarning = limit > 0 && amount > limit * 0.8 && !isOverLimit;

  let amountColor = colors.textPrimary;
  if (isOverLimit) amountColor = colors.danger;
  else if (isWarning) amountColor = colors.warning;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="items-center py-8 mb-4 mx-1 rounded-2xl"
      style={{ backgroundColor: colors.bgSecondary }}
      accessibilityLabel={`${i18n.t('home.total')} ${Math.round(amount)} lira`}
    >
      <Text className="text-xs font-semibold mb-2 tracking-wider uppercase" style={{ color: colors.textSecondary }}>
        {isToday ? i18n.t('home.total') : i18n.t('home.total_label')}
      </Text>

      <Text
        className="text-5xl font-black tracking-tight"
        style={{ color: amountColor }}
      >
        {amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
        <Text className="text-xl font-semibold" style={{ color: colors.textTertiary }}> TL</Text>
      </Text>
    </Animated.View>
  );
};
