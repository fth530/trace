// S-Class Period Summary
// Based on Antigravity UI Architecture

import { View, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';

interface PeriodSummaryProps {
  weeklyTotal: number;
  monthlyTotal: number;
}

export function PeriodSummary({
  weeklyTotal,
  monthlyTotal,
}: PeriodSummaryProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0">
      {/* S-Class Glassmorphic Panel */}
      <View className="bg-black/80 backdrop-blur-2xl border-t border-white/5 px-6 py-8 pb-12 pointer-events-none">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 items-center border-r border-white/10">
            <Text className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-2">
              {i18n.t('history.week_label')}
            </Text>
            <Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1}>
              {formatCurrency(weeklyTotal)}
            </Text>
          </View>

          <View className="flex-1 items-center">
            <Text className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-2">
              {i18n.t('history.month_label')}
            </Text>
            <Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1}>
              {formatCurrency(monthlyTotal)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
