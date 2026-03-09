import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { logger } from '@/lib/utils/logger';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';

const SLIDE_COLORS = [colors.primary, '#FF9500', '#AF52DE'];

const getSlides = () => [
  {
    icon: 'wallet-outline',
    title: i18n.t('onboarding.slide1_title'),
    description: i18n.t('onboarding.slide1_desc'),
  },
  {
    icon: 'speedometer-outline',
    title: i18n.t('onboarding.slide2_title'),
    description: i18n.t('onboarding.slide2_desc'),
  },
  {
    icon: 'analytics-outline',
    title: i18n.t('onboarding.slide3_title'),
    description: i18n.t('onboarding.slide3_desc'),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const updateSetting = useStore((state) => state.updateSetting);

  const SLIDES = getSlides();
  const accentColor = SLIDE_COLORS[currentIndex];

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      try {
        await updateSetting('has_seen_onboarding', 1);
        router.replace('/(tabs)');
      } catch (error) {
        logger.error('Failed to update onboarding setting', error);
      }
    }
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <View className="flex-1 items-center justify-between py-24" style={{ backgroundColor: colors.bgPrimary }}>
      {/* Skip Button */}
      {currentIndex < SLIDES.length - 1 && (
        <Pressable
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await updateSetting('has_seen_onboarding', 1);
            router.replace('/(tabs)');
          }}
          className="absolute top-16 right-8 z-10 p-2"
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text className="font-medium" style={{ color: colors.textTertiary }}>
            {i18n.t('onboarding.skip')}
          </Text>
        </Pressable>
      )}

      {/* Content Area */}
      <View className="flex-1 w-full justify-center items-center px-8">
        <Animated.View
          key={`icon-${currentIndex}`}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutLeft.duration(250)}
          className="w-28 h-28 rounded-3xl items-center justify-center mb-12"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Ionicons
            name={currentSlide.icon as any}
            size={56}
            color={accentColor}
          />
        </Animated.View>

        <Animated.View
          key={`text-${currentIndex}`}
          entering={FadeInRight.duration(400).delay(150)}
          exiting={FadeOutLeft.duration(250)}
          className="items-center"
        >
          <Text className="text-2xl font-bold mb-4 text-center" style={{ color: colors.textPrimary }}>
            {currentSlide.title}
          </Text>
          <Text className="text-base text-center leading-6 px-4" style={{ color: colors.textSecondary }}>
            {currentSlide.description}
          </Text>
        </Animated.View>
      </View>

      {/* Progress Dots & CTA */}
      <View className="w-full px-8 items-center mt-auto">
        <View className="flex-row gap-2 mb-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className="h-1.5 rounded-full"
              style={{
                width: index === currentIndex ? 24 : 8,
                backgroundColor: index === currentIndex ? accentColor : colors.bgTertiary,
              }}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          className="w-full h-14 rounded-xl items-center justify-center active:opacity-80"
          style={{ backgroundColor: accentColor }}
        >
          <Text className="font-bold text-base" style={{ color: colors.white }}>
            {currentIndex === SLIDES.length - 1
              ? i18n.t('onboarding.start')
              : i18n.t('onboarding.continue')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
