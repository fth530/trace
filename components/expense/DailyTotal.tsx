// Daily Total Hero Display
// Based on ROADMAP §4 Component Inventory & Antigravity Protocol

import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';
import { Ionicons } from '@expo/vector-icons';
import { neonColors } from '@/lib/constants/design-tokens';
import Animated, { FadeIn } from 'react-native-reanimated';

interface DailyTotalProps {
  amount: number;
  limit: number;
  isToday: boolean;
  streak?: number;
}

export const DailyTotal: React.FC<DailyTotalProps> = ({
  amount,
  limit,
  isToday,
  streak = 0,
}) => {
  return (
    <View
      className="items-center py-10"
      accessibilityLabel={`${i18n.t('home.total')} ${Math.round(amount)} lira`}
    >
      {streak > 0 && (
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/30 mb-4"
        >
          <Ionicons name="flame" size={16} color="#fbbf24" />
          <Text className="text-orange-400 font-bold ml-1.5 tracking-wide">
            {streak} Günlük Seri!
          </Text>
        </Animated.View>
      )}

      <Text className="text-slate-400 text-lg font-medium mb-2 tracking-widest uppercase">
        {isToday ? i18n.t('home.total') : i18n.t('home.total_label')}
      </Text>

      <Text
        className="text-white text-6xl font-black tracking-tighter"
        style={{
          textShadowColor: 'rgba(255, 255, 255, 0.4)',
          textShadowOffset: { width: 0, height: 4 },
          textShadowRadius: 20,
        }}
      >
        {formatCurrency(amount)}
      </Text>

      {limit > 0 && (
        <View className="mt-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <Text className="text-slate-400 text-sm font-medium">
            / {formatCurrency(limit)} Limit
          </Text>
        </View>
      )}
    </View>
  );
};
