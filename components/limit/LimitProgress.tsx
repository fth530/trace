import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { getLimitStatus, LimitType } from '@/lib/utils/limits';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';
import { Ionicons } from '@expo/vector-icons';

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
      duration: 700,
      useNativeDriver: false,
    }).start();

    return () => widthAnim.stopAnimation();
  }, [status.percentage]);

  if (limit === 0) return null;

  const icon = type === 'daily' ? 'today-outline' : 'calendar-outline';
  const label = type === 'daily' ? 'Günlük' : 'Aylık';
  const remaining = Math.max(limit - current, 0);

  return (
    <View style={{
      marginBottom: 10,
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.bgSecondary,
      borderWidth: 1,
      borderColor: colors.separator,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          backgroundColor: `${status.color}15`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}>
          <Ionicons name={icon as any} size={15} color={status.color} />
        </View>
        <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
          {label} Limit
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: status.color }}>
          {status.percentage.toFixed(0)}%
        </Text>
      </View>

      <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.bgTertiary, overflow: 'hidden', marginBottom: 8 }}>
        <Animated.View
          style={{
            height: '100%',
            borderRadius: 3,
            backgroundColor: status.color,
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 11, color: colors.textTertiary }}>
          {formatCurrency(current)} harcandı
        </Text>
        <Text style={{ fontSize: 11, color: colors.textTertiary }}>
          {formatCurrency(remaining)} kaldı
        </Text>
      </View>
    </View>
  );
};
