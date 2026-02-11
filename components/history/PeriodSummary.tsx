import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { formatCurrency } from '@/lib/utils/currency';
import { spacing } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';

interface PeriodSummaryProps {
  weeklyTotal: number;
  monthlyTotal: number;
}

export function PeriodSummary({ weeklyTotal, monthlyTotal }: PeriodSummaryProps) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.surface.dark,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: typography.caption.fontSize,
                color: colors.text.secondary.dark,
                marginBottom: spacing.xs / 2,
              }}
            >
              Son 7 Gün
            </Text>
            <Text
              style={{
                fontSize: typography.headline.fontSize,
                fontWeight: typography.headline.fontWeight as any,
                color: colors.text.primary.dark,
              }}
            >
              {formatCurrency(weeklyTotal)}
            </Text>
          </View>
          <View
            style={{
              width: 1,
              backgroundColor: colors.surface.dark,
            }}
          />
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: typography.caption.fontSize,
                color: colors.text.secondary.dark,
                marginBottom: spacing.xs / 2,
              }}
            >
              Bu Ay
            </Text>
            <Text
              style={{
                fontSize: typography.headline.fontSize,
                fontWeight: typography.headline.fontWeight as any,
                color: colors.text.primary.dark,
              }}
            >
              {formatCurrency(monthlyTotal)}
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}
