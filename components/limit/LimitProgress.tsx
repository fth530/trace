// Limit Progress Bar Component
// Based on ROADMAP §7 Limit & Warning System & Antigravity Protocol

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { getLimitStatus, LimitType } from '@/lib/utils/limits';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';
import { neonColors } from '@/lib/constants/design-tokens';

interface LimitProgressProps {
  current: number;
  limit: number;
  type: LimitType;
}

export const LimitProgress: React.FC<LimitProgressProps> = ({
  current,
  limit,
  type,
}) => {
  const status = getLimitStatus(current, limit, type, 'dark');
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(status.percentage, 100),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [status.percentage]);

  if (limit === 0) {
    return (
      <View className="mb-4">
        <Text className="text-slate-500 text-center py-2">
          {i18n.t('limits.unlimited')}
        </Text>
      </View>
    );
  }

  // Fallback to neon cyan and fuchsia if logic fails
  const neonColor =
    status.color || (type === 'daily' ? neonColors.cyan : neonColors.fuchsia);

  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-end mb-2">
        <Text className="text-white font-medium text-sm tracking-wide">
          {type === 'daily' ? i18n.t('limits.daily') : i18n.t('limits.monthly')}
        </Text>
        <Text className="text-slate-400 font-bold text-sm">
          {status.percentage.toFixed(0)}%
        </Text>
      </View>

      <View className="h-2 rounded-full overflow-hidden bg-slate-800/80 border border-white/5">
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 4,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: neonColor,
              shadowColor: neonColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 5,
            },
          ]}
        />
      </View>

      <View className="mt-1.5 flex-row justify-between items-center">
        <Text className="text-slate-500 text-xs">
          {formatCurrency(current)} / {formatCurrency(limit)}
        </Text>
      </View>
    </View>
  );
};
