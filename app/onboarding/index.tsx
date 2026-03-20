import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { logger } from '@/lib/utils/logger';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'wallet' as const,
    accentColor: '#7C6FFF',
    gradientStart: '#1C1645',
    tag: 'HARCAMA TAKİBİ',
    title: 'Paranızı\nKontrol Edin',
    description: 'Günlük harcamalarınızı saniyeler içinde kaydedin. Sade, hızlı ve etkili.',
    iconGradient: ['#7C6FFF', '#5B4FD8'] as const,
  },
  {
    icon: 'flash' as const,
    accentColor: '#FF9F43',
    gradientStart: '#221500',
    tag: 'ANLLIK LİMİTLER',
    title: 'Limitlerde\nKalın',
    description: 'Günlük ve aylık harcama limitleri belirleyin. Aşımları anında fark edin.',
    iconGradient: ['#FF9F43', '#E07D20'] as const,
  },
  {
    icon: 'bar-chart' as const,
    accentColor: '#00D68F',
    gradientStart: '#00211A',
    tag: 'DETAYLI ANALİZ',
    title: 'Alışkanlıkları\nAnlayın',
    description: 'Kategori bazlı grafikler ve haftalık trendlerle harcama alışkanlıklarınızı keşfedin.',
    iconGradient: ['#00D68F', '#00A86B'] as const,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const updateSetting = useStore((state) => state.updateSetting);

  const contentOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  const slide = SLIDES[displayIndex];

  const transition = (newIndex: number) => {
    contentOpacity.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) }, () => {
      runOnJS(setDisplayIndex)(newIndex);
      contentTranslateY.value = 12;
      contentOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) });
      contentTranslateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.quad) });
    });
  };

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      transition(next);
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
    <View style={{ flex: 1, backgroundColor: '#0D0D12' }}>
      {/* Gradient background */}
      <LinearGradient
        colors={[slide.gradientStart, '#0D0D12', '#0D0D12']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow top */}
      <View style={[styles.glowTop, { backgroundColor: slide.accentColor }]} />
      <View style={[styles.glowBottom, { backgroundColor: slide.accentColor }]} />

      {/* Skip button */}
      {currentIndex < SLIDES.length - 1 && (
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.skipText}>Atla</Text>
        </Pressable>
      )}

      {/* Content */}
      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.content, contentAnimStyle]}>
          {/* Icon */}
          <View style={styles.iconOuterRing}>
            <View style={[styles.iconMidRing, { borderColor: `${slide.accentColor}30` }]}>
              <LinearGradient
                colors={slide.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconInner}
              >
                <Ionicons name={slide.icon} size={42} color="#fff" />
              </LinearGradient>
            </View>
          </View>

          {/* Tag */}
          <View style={[styles.tag, { backgroundColor: `${slide.accentColor}1A`, borderColor: `${slide.accentColor}40` }]}>
            <Text style={[styles.tagText, { color: slide.accentColor }]}>{slide.tag}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{slide.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>
      </View>

      {/* Bottom area */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === currentIndex ? 32 : 8,
                  backgroundColor: i === currentIndex ? slide.accentColor : 'rgba(255,255,255,0.15)',
                },
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.ctaWrapper, { opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={slide.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>
              {currentIndex === SLIDES.length - 1 ? 'Başlayalım' : 'Devam Et'}
            </Text>
            {currentIndex < SLIDES.length - 1 && (
              <View style={styles.ctaIcon}>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glowTop: {
    position: 'absolute',
    top: -160,
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.12,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 60,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.07,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skipText: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    fontSize: 14,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconOuterRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  iconMidRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 20,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  bottom: {
    paddingHorizontal: 28,
    paddingBottom: 52,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  ctaWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cta: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 10,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  ctaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
