import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { formatCurrency } from '@/lib/utils/currency';
import { spacing } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

interface PeriodSummaryProps {
  weeklyTotal: number;
  monthlyTotal: number;
}

export function PeriodSummary({ weeklyTotal, monthlyTotal }: PeriodSummaryProps) {
  const t = useThemeColors();

  return (
    <View style={styles.container}>
      <BlurView
        intensity={80}
        tint={t.scheme}
        style={[styles.blurView, { borderTopColor: t.surface }]}
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: t.textSecondary }]}>Son 7 Gün</Text>
            <Text style={[styles.amount, { color: t.textPrimary }]}>
              {formatCurrency(weeklyTotal)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: t.surface }]} />
          <View style={styles.section}>
            <Text style={[styles.label, { color: t.textSecondary }]}>Bu Ay</Text>
            <Text style={[styles.amount, { color: t.textPrimary }]}>
              {formatCurrency(monthlyTotal)}
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurView: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  section: {
    alignItems: 'center',
  },
  label: {
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.xxs,
  },
  amount: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
  },
  divider: {
    width: 1,
  },
});
