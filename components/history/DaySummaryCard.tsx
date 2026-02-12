import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import { spacing } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

interface DaySummaryCardProps {
  date: string;
  total: number;
  count: number;
}

export function DaySummaryCard({ date, total, count }: DaySummaryCardProps) {
  const t = useThemeColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/history/${date}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressablePressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${formatDateRelative(date)} günü, ${count} harcama, toplam ${formatCurrency(total)}`}
      accessibilityHint="Günün detaylarını görmek için dokunun"
    >
      <Card>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Text style={[styles.dateText, { color: t.textPrimary }]}>
              {formatDateRelative(date)}
            </Text>
            <Text style={[styles.countText, { color: t.textSecondary }]}>
              {count} harcama
            </Text>
          </View>
          <Text style={[styles.totalText, { color: t.textPrimary }]}>
            {formatCurrency(total)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: spacing.sm,
  },
  pressablePressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  dateText: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    marginBottom: spacing.xxs,
  },
  countText: {
    fontSize: typography.caption.fontSize,
  },
  totalText: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
  },
});
