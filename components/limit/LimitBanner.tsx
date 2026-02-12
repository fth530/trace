// Limit Warning Banner Component
// Based on ROADMAP §7 Limit & Warning System

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { LimitType, getHapticIntensity } from '@/lib/utils/limits';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

interface LimitBannerProps {
  percentage: number;
  type: LimitType;
  limit: number;
  message: string;
  color: string;
  onDismiss: () => void;
}

export const LimitBanner: React.FC<LimitBannerProps> = ({
  percentage,
  type,
  limit,
  message,
  color,
  onDismiss,
}) => {
  const t = useThemeColors();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const level =
      percentage >= 100
        ? 'danger-100'
        : percentage >= 80
          ? 'warning-80'
          : 'warning-50';

    const intensity = getHapticIntensity(level);

    switch (intensity) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: color + '20',
          borderLeftColor: color,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        onPress={handleDismiss}
        style={styles.content}
        accessibilityRole="button"
        accessibilityLabel="Uyarıyı kapat"
      >
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={24} color={color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.message, { color }]}>
            {message}
          </Text>
          <Text style={[styles.hint, { color: t.textTertiary }]}>
            Dokunarak kapat
          </Text>
        </View>

        <Ionicons name="close" size={20} color={t.textTertiary} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    overflow: 'hidden',
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.headline.fontWeight,
    marginBottom: 2,
  },
  hint: {
    fontSize: typography.caption.fontSize,
  },
});
