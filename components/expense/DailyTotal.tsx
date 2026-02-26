// Daily Total Hero Display
// Based on ROADMAP §4 Component Inventory & Antigravity Protocol

import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';

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
  return (
    <View
      className="items-center py-10"
      accessibilityLabel={`${i18n.t('home.total')} ${Math.round(amount)} lira`}
    >
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
