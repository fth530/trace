import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateRelative } from '@/lib/utils/date';
import { colors } from '@/lib/constants/design-tokens';
import { Ionicons } from '@expo/vector-icons';
import { i18n } from '@/lib/translations/i18n';

interface DaySummaryCardProps {
  date: string;
  total: number;
  count: number;
  disabled?: boolean;
}

export function DaySummaryCard({ date, total, count, disabled }: DaySummaryCardProps) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/history/${date}`);
  };

  const amountStr = total.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [styles.pressable, { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${formatDateRelative(date)}, ${count} harcama, toplam ${formatCurrency(total)}`}
    >
      {/* Left accent */}
      <LinearGradient
        colors={[colors.primary, '#9B8FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.accentBar}
      />

      <View style={styles.content}>
        {/* Left side */}
        <View style={styles.leftSide}>
          <Text style={styles.dateText}>{formatDateRelative(date)}</Text>
          <View style={styles.countRow}>
            <Ionicons name="receipt-outline" size={11} color={colors.textTertiary} />
            <Text style={styles.countText}>
              {count} {i18n.t('history.expense_count')}
            </Text>
          </View>
        </View>

        {/* Right side */}
        <View style={styles.rightSide}>
          <Text style={styles.amount}>{amountStr}</Text>
          <Text style={styles.amountCurrency}> TL</Text>
          {!disabled && (
            <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} style={{ marginLeft: 4 }} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: 'rgba(150,150,255,0.07)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: {
    width: 3,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  leftSide: {
    flex: 1,
    gap: 5,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  amountCurrency: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textTertiary,
    marginBottom: 2,
  },
});
