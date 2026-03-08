// S-Class Daily Total Hero Display
// Based on Antigravity Protocol

import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';
import { Ionicons } from '@expo/vector-icons';
import { neonColors } from '@/lib/constants/design-tokens';
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
  // Determine danger level based on limits
  const isOverLimit = limit > 0 && amount > limit;
  const isWarning = limit > 0 && amount > limit * 0.8 && !isOverLimit;

  let glowColor: string = neonColors.mint; // Safe
  if (isOverLimit) glowColor = neonColors.crimson; // Danger
  else if (isWarning) glowColor = neonColors.yellow; // Warning

  return (
    <Animated.View
      entering={FadeInDown.duration(800).springify().damping(12)}
      className="items-center py-12"
      accessibilityLabel={`${i18n.t('home.total')} ${Math.round(amount)} lira`}
    >
      <Text className="text-slate-400 text-sm font-semibold mb-3 tracking-[0.2em] uppercase">
        {isToday ? i18n.t('home.total') : i18n.t('home.total_label')}
      </Text>

      <Text
        className="text-white text-7xl font-black tracking-tighter"
        style={{
          color: '#FFFFFF',
          textShadowColor: glowColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 30, // Intense S-Class Glow
        }}
      >
        {amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
        <Text className="text-3xl text-white/50 font-bold"> ₺</Text>
      </Text>

      {limit > 0 && (
        <View className="mt-6 px-5 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl">
          <Text className="text-slate-300 text-sm font-medium tracking-wide">
            Limit: <Text style={{ color: glowColor }}>{formatCurrency(limit)}</Text>
          </Text>
        </View>
      )}
    </Animated.View>
  );
};
