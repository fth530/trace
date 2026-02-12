// Daily Total Hero Display
// Based on ROADMAP §4 Component Inventory

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { spacing } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { formatCurrency } from '@/lib/utils/currency';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

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
  const t = useThemeColors();
  const animatedValue = useRef(new Animated.Value(amount)).current;
  const [displayAmount, setDisplayAmount] = useState(amount);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: amount,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayAmount(value);
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [amount, animatedValue]);

  const safeMax = Math.max(amount, 1);
  const animatedStyle = {
    opacity: animatedValue.interpolate({
      inputRange: [0, safeMax],
      outputRange: [0.5, 1],
    }),
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Bugünkü toplam ${Math.round(amount)} lira`}
    >
      <Text style={[styles.label, { color: t.textSecondary }]}>
        {isToday ? 'Bugün' : 'Toplam'}
      </Text>

      <Animated.Text style={[styles.amount, { color: t.textPrimary }, animatedStyle]}>
        {formatCurrency(displayAmount)}
      </Animated.Text>

      {limit > 0 && (
        <Text style={[styles.limit, { color: t.textTertiary }]}>
          / {formatCurrency(limit)} limit
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  label: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    marginBottom: spacing.sm,
  },
  amount: {
    fontSize: typography.hero.fontSize,
    fontWeight: typography.hero.fontWeight,
    lineHeight: typography.hero.lineHeight,
  },
  limit: {
    fontSize: typography.body.fontSize,
    marginTop: spacing.xs,
  },
});
