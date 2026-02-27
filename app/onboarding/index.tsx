// Onboarding Screen
// Based on v1.1 App Store Polish

import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { i18n } from '@/lib/translations/i18n';
import {
  neonColors,
  gradients,
  gradientLocations,
  neonShadow,
} from '@/lib/constants/design-tokens';

const { width } = Dimensions.get('window');

const getSlides = () => [
  {
    icon: 'wallet-outline',
    title: i18n.t('onboarding.slide1_title'),
    description: i18n.t('onboarding.slide1_desc'),
    color: neonColors.cyan,
  },
  {
    icon: 'speedometer-outline',
    title: i18n.t('onboarding.slide2_title'),
    description: i18n.t('onboarding.slide2_desc'),
    color: neonColors.pink,
  },
  {
    icon: 'planet-outline',
    title: i18n.t('onboarding.slide3_title'),
    description: i18n.t('onboarding.slide3_desc'),
    color: neonColors.violet,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const updateSetting = useStore((state) => state.updateSetting);

  const SLIDES = getSlides();

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last slide, finish onboarding
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
    <View className="flex-1 bg-zinc-950 items-center justify-between py-24">
      {/* Background Glow */}
      <View className="absolute top-0 w-full h-full opacity-30 pointer-events-none">
        <LinearGradient
          colors={gradients.main}
          locations={gradientLocations.main}
          style={{ flex: 1 }}
        />
      </View>

      {/* Skip Button */}
      {currentIndex < SLIDES.length - 1 && (
        <Pressable
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await updateSetting('has_seen_onboarding', 1);
            router.replace('/(tabs)');
          }}
          className="absolute top-16 right-8 z-10 p-2"
        >
          <Text className="text-zinc-500 font-medium">
            {i18n.t('onboarding.skip')}
          </Text>
        </Pressable>
      )}

      {/* Content Area */}
      <View className="flex-1 w-full justify-center items-center px-8 relative">
        <Animated.View
          key={`icon-${currentIndex}`}
          entering={FadeInUp.duration(600).springify().damping(12)}
          exiting={FadeOutLeft.duration(300)}
          className="w-32 h-32 rounded-full items-center justify-center mb-12 border border-white/10 bg-slate-900/50 backdrop-blur-md"
          // @ts-ignore dynamic strict matching for icon names is acceptable in map
          style={neonShadow(currentSlide.color, 'lg')}
        >
          {/* @ts-ignore */}
          <Ionicons
            name={currentSlide.icon}
            size={64}
            color={currentSlide.color}
          />
        </Animated.View>

        <Animated.View
          key={`text-${currentIndex}`}
          entering={FadeInRight.duration(500).delay(200)}
          exiting={FadeOutLeft.duration(300)}
          className="items-center"
        >
          <Text className="text-white text-3xl font-bold tracking-wider mb-6 text-center">
            {currentSlide.title}
          </Text>
          <Text className="text-zinc-400 font-medium text-base text-center leading-relaxed">
            {currentSlide.description}
          </Text>
        </Animated.View>
      </View>

      {/* Progress Dots & CTA */}
      <View className="w-full px-8 items-center mt-auto">
        <View className="flex-row gap-3 mb-10">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'
              }`}
              style={
                index === currentIndex
                  ? neonShadow(currentSlide.color, 'sm')
                  : undefined
              }
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          className="w-full h-14 rounded-2xl items-center justify-center overflow-hidden border border-white/20"
          style={neonShadow(currentSlide.color, 'md')}
        >
          <LinearGradient
            colors={[currentSlide.color, '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 3 }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
          <Text className="text-white font-bold text-lg tracking-widest relative z-10">
            {currentIndex === SLIDES.length - 1
              ? i18n.t('onboarding.start')
              : i18n.t('onboarding.continue')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
