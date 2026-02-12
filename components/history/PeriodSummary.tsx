import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Son 7 Gün</Text>
            <Text style={styles.amount}>{formatCurrency(weeklyTotal)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.label}>Bu Ay</Text>
            <Text style={styles.amount}>{formatCurrency(monthlyTotal)}</Text>
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
    borderTopColor: colors.surface.dark,
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
    color: colors.text.secondary.dark,
    marginBottom: spacing.xs / 2,
  },
  amount: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight as any,
    color: colors.text.primary.dark,
  },
  divider: {
    width: 1,
    backgroundColor: colors.surface.dark,
  },
});
