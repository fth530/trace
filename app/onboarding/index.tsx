import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInRight,
  FadeOutLeft,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { logger } from '@/lib/utils/logger';
import { i18n } from '@/lib/translations/i18n';
import { colors } from '@/lib/constants/design-tokens';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'wallet' as const,
    iconBg: '#6C63FF',
    glow: 'rgba(108, 99, 255, 0.4)',
    gradient: '#1A1640',
    tag: 'HARCAMA TAKİBİ',
    title: 'Paranızı\nKontrol Edin',
    description: 'Günlük harcamalarınızı saniyeler içinde kaydedin. Sade, hızlı ve etkili.',
    accentColor: '#6C63FF',
  },
  {
    icon: 'flash' as const,
    iconBg: '#FF9F43',
    glow: 'rgba(255, 159, 67, 0.4)',
    gradient: '#1A1200',
    tag: 'ANLLIK LİMİTLER',
    title: 'Limitlerde\nKalın',
    description: 'Günlük ve aylık harcama limitleri belirleyin. Aşımları anında fark edin.',
    accentColor: '#FF9F43',
  },
  {
    icon: 'bar-chart' as const,
    iconBg: '#00E096',
    glow: 'rgba(0, 224, 150, 0.4)',
    gradient: '#001A14',
    tag: 'DETAYLI ANALİZ',
    title: 'Alışkanlıklarınızı\nAnlayın',
    description: 'Kategori bazlı grafikler ve haftalık trendlerle harcama alışkanlıklarınızı keşfedin.',
    accentColor: '#00E096',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const updateSetting = useStore((state) => state.updateSetting);

  const slide = SLIDES[currentIndex];

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

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateSetting('has_seen_onboarding', 1);
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      {/* Animated background accent */}
      <Animated.View
        key={`bg-${currentIndex}`}
        entering={FadeIn.duration(600)}
        exiting={FadeOut.duration(400)}
        style={{
          position: 'absolute',
          top: -120,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: 200,
          backgroundColor: slide.glow,
          opacity: 0.25,
          transform: [{ scaleX: 1.4 }],
        }}
      />
      <Animated.View
        key={`bg2-${currentIndex}`}
        entering={FadeIn.duration(800)}
        exiting={FadeOut.duration(400)}
        style={{
          position: 'absolute',
          bottom: 100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: slide.glow,
          opacity: 0.12,
        }}
      />

      {/* Skip */}
      {currentIndex < SLIDES.length - 1 && (
        <Pressable
          onPress={handleSkip}
          style={{
            position: 'absolute',
            top: 56,
            right: 24,
            zIndex: 10,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.07)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 14 }}>
            Atla
          </Text>
        </Pressable>
      )}

      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        {/* Icon */}
        <Animated.View
          key={`icon-${currentIndex}`}
          entering={FadeInUp.duration(500)}
          exiting={FadeOut.duration(200)}
          style={{ marginBottom: 52, alignItems: 'center' }}
        >
          {/* Outer glow ring */}
          <View style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: `${slide.accentColor}10`,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: `${slide.accentColor}20`,
          }}>
            {/* Inner icon container */}
            <View style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: `${slide.accentColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: `${slide.accentColor}35`,
            }}>
              <View style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: slide.accentColor,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: slide.accentColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.6,
                shadowRadius: 20,
                elevation: 12,
              }}>
                <Ionicons name={slide.icon} size={36} color="#fff" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Tag */}
        <Animated.View
          key={`tag-${currentIndex}`}
          entering={FadeInRight.duration(400).delay(100)}
          exiting={FadeOut.duration(150)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor: `${slide.accentColor}18`,
            borderWidth: 1,
            borderColor: `${slide.accentColor}30`,
            marginBottom: 20,
          }}
        >
          <Text style={{
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.5,
            color: slide.accentColor,
          }}>
            {slide.tag}
          </Text>
        </Animated.View>

        {/* Title */}
        <Animated.View
          key={`title-${currentIndex}`}
          entering={FadeInRight.duration(450).delay(150)}
          exiting={SlideOutLeft.duration(200)}
        >
          <Text style={{
            fontSize: 36,
            fontWeight: '800',
            color: colors.textPrimary,
            textAlign: 'center',
            lineHeight: 44,
            marginBottom: 20,
          }}>
            {slide.title}
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View
          key={`desc-${currentIndex}`}
          entering={FadeInRight.duration(500).delay(200)}
          exiting={SlideOutLeft.duration(200)}
        >
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 26,
            paddingHorizontal: 8,
          }}>
            {slide.description}
          </Text>
        </Animated.View>
      </View>

      {/* Bottom */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 52 }}>
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {SLIDES.map((s, i) => (
            <Animated.View
              key={i}
              style={{
                height: 6,
                width: i === currentIndex ? 28 : 8,
                borderRadius: 3,
                backgroundColor: i === currentIndex ? slide.accentColor : colors.bgTertiary,
              }}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            height: 58,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            backgroundColor: slide.accentColor,
            opacity: pressed ? 0.85 : 1,
            shadowColor: slide.accentColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
          })}
        >
          <Text style={{
            color: '#fff',
            fontWeight: '700',
            fontSize: 17,
            marginRight: currentIndex === SLIDES.length - 1 ? 0 : 8,
          }}>
            {currentIndex === SLIDES.length - 1 ? 'Başlayalım' : 'Devam Et'}
          </Text>
          {currentIndex < SLIDES.length - 1 && (
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
