import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LimitType, getHapticIntensity } from '@/lib/utils/limits';
import { colors } from '@/lib/constants/design-tokens';
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

    const animation = Animated.parallel([
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
    ]);

    animation.start();

    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => {
      clearTimeout(timer);
      animation.stop();
      slideAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
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
      className="absolute top-14 left-4 right-4 rounded-xl overflow-hidden z-50"
      style={[
        {
          backgroundColor: colors.bgElevated,
          borderLeftWidth: 4,
          borderLeftColor: color,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        onPress={handleDismiss}
        className="flex-row items-center p-3.5"
        accessibilityRole="button"
        accessibilityLabel="Dismiss warning"
      >
        <View className="mr-3">
          <Ionicons name="warning" size={22} color={color} />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold mb-0.5" style={{ color }}>
            {message}
          </Text>
          <Text className="text-xs" style={{ color: colors.textTertiary }}>
            {i18n.t('limits.dismiss_hint')}
          </Text>
        </View>

        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
};
