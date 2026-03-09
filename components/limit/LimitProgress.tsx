import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { getLimitStatus, LimitType } from '@/lib/utils/limits';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';

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

    return () => {
      widthAnim.stopAnimation();
    };
  }, [status.percentage, widthAnim]);

  if (limit === 0) {
    return (
      <View className="mb-3">
        <Text className="text-center py-2" style={{ color: colors.textTertiary }}>
          {i18n.t('limits.unlimited')}
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-end mb-1.5">
        <Text className="font-medium text-sm" style={{ color: colors.textPrimary }}>
          {type === 'daily' ? i18n.t('limits.daily') : i18n.t('limits.monthly')}
        </Text>
        <Text className="font-semibold text-sm" style={{ color: colors.textSecondary }}>
          {status.percentage.toFixed(0)}%
        </Text>
      </View>

      <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 4,
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: status.color,
          }}
        />
      </View>

      <View className="mt-1 flex-row justify-between items-center">
        <Text className="text-xs" style={{ color: colors.textTertiary }}>
          {formatCurrency(current)} / {formatCurrency(limit)}
        </Text>
      </View>
    </View>
  );
};
