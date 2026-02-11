// Limit Progress Bar Component
// Based on ROADMAP §7 Limit & Warning System

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { getLimitStatus, LimitType } from '@/lib/utils/limits';
import { formatCurrency } from '@/lib/utils/currency';

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
  const status = getLimitStatus(current, limit, type);
  const widthAnim = useRef(new Animated.Value(0)).current;

  // Animate progress bar on mount and when percentage changes
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(status.percentage, 100),
      duration: 600,
      useNativeDriver: false, // width animation requires false
    }).start();
  }, [status.percentage]);

  // Edge case: Limit = 0 (no limit)
  if (limit === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noLimitText}>∞ Limit belirlenmedi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {type === 'daily' ? 'Günlük Limit' : 'Aylık Limit'}
        </Text>
        <Text style={styles.percentage}>
          {status.percentage.toFixed(0)}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
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

      {/* Amount Display */}
      <View style={styles.footer}>
        <Text style={styles.amountText}>
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
    color: colors.text.primary.dark,
  },
  percentage: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: colors.text.secondary.dark,
  },
  progressBarContainer: {
    height: 8, // 8px grid
    backgroundColor: colors.surface.dark,
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
    color: colors.text.tertiary.dark,
  },
  noLimitText: {
    fontSize: typography.body.fontSize,
    color: colors.text.tertiary.dark,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
