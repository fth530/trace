// Limit Progress Bar Component
// Based on ROADMAP §7 Limit & Warning System

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { getLimitStatus, LimitType } from '@/lib/utils/limits';
import { formatCurrency } from '@/lib/utils/currency';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

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
  const t = useThemeColors();
  const status = getLimitStatus(current, limit, type, t.scheme);
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
      <View style={styles.container}>
        <Text style={[styles.noLimitText, { color: t.textTertiary }]}>
          ∞ Limit belirlenmedi
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: t.textPrimary }]}>
          {type === 'daily' ? 'Günlük Limit' : 'Aylık Limit'}
        </Text>
        <Text style={[styles.percentage, { color: t.textSecondary }]}>
          {status.percentage.toFixed(0)}%
        </Text>
      </View>

      <View style={[styles.progressBarContainer, { backgroundColor: t.surface }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: status.color,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.amountText, { color: t.textTertiary }]}>
          {formatCurrency(current)} / {formatCurrency(limit)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.headline.fontWeight,
  },
  percentage: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.headline.fontWeight,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  footer: {
    marginTop: spacing.xs,
  },
  amountText: {
    fontSize: typography.caption.fontSize,
  },
  noLimitText: {
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
