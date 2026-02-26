// Limit Warning Banner Component
// Based on ROADMAP §7 Limit & Warning System & Antigravity Protocol

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LimitType, getHapticIntensity } from '@/lib/utils/limits';
import { neonColors } from '@/lib/constants/design-tokens';
import { i18n } from '@/lib/translations/i18n';

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
      className="absolute top-0 left-4 right-4 rounded-xl border-l-[4px] overflow-hidden z-50 backdrop-blur-md"
      style={[
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
        className="flex-row items-center p-3"
        accessibilityRole="button"
        accessibilityLabel="Uyarıyı kapat"
      >
        <View className="mr-3">
          <Ionicons name="warning" size={24} color={color} />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-bold mb-0.5" style={{ color }}>
            {message}
          </Text>
          <Text className="text-xs text-slate-400">
            {i18n.t('limits.dismiss_hint')}
          </Text>
        </View>

        <Ionicons name="close" size={20} color={neonColors.slate} />
      </Pressable>
    </Animated.View>
  );
};
