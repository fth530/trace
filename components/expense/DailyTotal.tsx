// Daily Total Hero Display
// Based on ROADMAP §4 Component Inventory

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { spacing } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { formatCurrency } from '@/lib/utils/currency';

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
  const animatedValue = useRef(new Animated.Value(amount)).current;
  const [displayAmount, setDisplayAmount] = useState(amount);

  useEffect(() => {
    // Animate number counting with native driver
    Animated.timing(animatedValue, {
      toValue: amount,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Update display value during animation
    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayAmount(value);
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [amount, animatedValue]);

  const animatedStyle = {
    opacity: animatedValue.interpolate({
      inputRange: [0, amount],
      outputRange: [0.5, 1],
    }),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {isToday ? 'Bugün' : 'Toplam'}
      </Text>
      
      <Animated.Text style={[styles.amount, animatedStyle]}>
        {formatCurrency(displayAmount)}
      </Animated.Text>

      {limit > 0 && (
        <Text style={styles.limit}>
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
    color: colors.text.secondary.dark,
    marginBottom: spacing.sm,
  },
  amount: {
    fontSize: typography.hero.fontSize,
    fontWeight: typography.hero.fontWeight,
    lineHeight: typography.hero.lineHeight,
    color: colors.text.primary.dark,
  },
  limit: {
    fontSize: typography.body.fontSize,
    color: colors.text.tertiary.dark,
    marginTop: spacing.xs,
  },
});
