import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '@/lib/utils/currency';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

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
  const percentage = limit > 0 ? Math.min((amount / limit) * 100, 100) : 0;

  let accentColor = colors.primary;
  let statusIcon: any = 'trending-up-outline';
  let statusText = 'Limitiniz dahilinde';

  if (isOverLimit) {
    accentColor = colors.danger;
    statusIcon = 'warning-outline';
    statusText = 'Limit aşıldı!';
  } else if (isWarning) {
    accentColor = colors.warning;
    statusIcon = 'alert-circle-outline';
    statusText = 'Limite yaklaşıyorsunuz';
  } else if (limit === 0) {
    statusText = 'Limit belirlenmedi';
    statusIcon = 'infinite-outline';
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={{
        marginHorizontal: 4,
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#141420',
        borderWidth: 1,
        borderColor: `${accentColor}20`,
      }}
    >
      {/* Top glow bar */}
      <View style={{
        height: 2,
        backgroundColor: accentColor,
        opacity: 0.7,
      }} />

      <View style={{ padding: 24 }}>
        {/* Label */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1.2,
            color: colors.textTertiary,
            textTransform: 'uppercase',
          }}>
            {isToday ? 'Bugün Harcanan' : 'Toplam'}
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: `${accentColor}15`,
            borderWidth: 1,
            borderColor: `${accentColor}25`,
            gap: 4,
          }}>
            <Ionicons name={statusIcon} size={12} color={accentColor} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: accentColor }}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <Text style={{
          fontSize: 52,
          fontWeight: '800',
          color: isOverLimit ? colors.danger : isWarning ? colors.warning : colors.textPrimary,
          letterSpacing: -2,
          lineHeight: 58,
          marginBottom: 20,
        }}>
          {amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          <Text style={{ fontSize: 22, fontWeight: '500', color: colors.textTertiary, letterSpacing: 0 }}> TL</Text>
        </Text>

        {/* Progress bar */}
        {limit > 0 && (
          <View>
            <View style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.bgTertiary,
              overflow: 'hidden',
            }}>
              <View style={{
                height: '100%',
                width: `${percentage}%`,
                borderRadius: 3,
                backgroundColor: accentColor,
                opacity: 0.85,
              }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: colors.textTertiary, fontWeight: '500' }}>
                {formatCurrency(amount)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textTertiary, fontWeight: '500' }}>
                / {formatCurrency(limit)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};
