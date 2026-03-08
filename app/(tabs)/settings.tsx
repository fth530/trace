// S-Class Settings Screen
// Based on Antigravity Protocol

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TextInput,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';
import { useAuth } from '@/lib/hooks/useAuth';
import { router } from 'expo-router';
import {
  gradients,
  gradientLocations,
  placeholderColor,
  neonColors,
  neonShadow,
} from '@/lib/constants/design-tokens';

export default function SettingsScreen() {
  const store = useStore();
  const { settings, updateSetting, clearAllData } = store;
  const { user, signOut } = useAuth();

  const [dailyLimit, setDailyLimit] = useState(settings.daily_limit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(
    settings.monthly_limit.toString(),
  );
  const [activeInput, setActiveInput] = useState<'daily' | 'monthly' | null>(null);

  const dailyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const monthlyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    setDailyLimit(settings.daily_limit.toString());
    setMonthlyLimit(settings.monthly_limit.toString());
  }, [settings.daily_limit, settings.monthly_limit, settings.theme]);

  const handleDailyLimitChange = (value: string) => {
    setDailyLimit(value);

    if (dailyTimeoutRef.current) clearTimeout(dailyTimeoutRef.current);

    dailyTimeoutRef.current = setTimeout(() => {
      const numValue = parseFloat(value) || 0;
      if (numValue >= 0) {
        updateSetting('daily_limit', numValue.toString());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 500);
  };

  const handleMonthlyLimitChange = (value: string) => {
    setMonthlyLimit(value);

    if (monthlyTimeoutRef.current) clearTimeout(monthlyTimeoutRef.current);

    monthlyTimeoutRef.current = setTimeout(() => {
      const numValue = parseFloat(value) || 0;
      if (numValue >= 0) {
        updateSetting('monthly_limit', numValue.toString());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 500);
  };

  const handleClearData = () => {
    Alert.alert(
      i18n.t('settings.reset_confirm_title'),
      i18n.t('settings.reset_confirm_message'),
      [
        {
          text: i18n.t('settings.reset_cancel'),
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: i18n.t('settings.reset_action'),
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              await clearAllData();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              Alert.alert(
                i18n.t('settings.reset_success_title'),
                i18n.t('settings.reset_success_message'),
              );
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                i18n.t('common.error'),
                i18n.t('settings.reset_error'),
              );
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    return () => {
      if (dailyTimeoutRef.current) clearTimeout(dailyTimeoutRef.current);
      if (monthlyTimeoutRef.current) clearTimeout(monthlyTimeoutRef.current);
    };
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* S-Class Antigravity Background Glow */}
      <View className="absolute top-0 w-full h-full opacity-40 pointer-events-none">
        <LinearGradient
          colors={gradients.main}
          locations={gradientLocations.main}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <Animated.ScrollView
        entering={FadeInDown.duration(800).springify().damping(16).stiffness(120)}
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Limits Section */}
        <View className="mb-10 mt-6">
          <Text className="text-white text-3xl font-black mb-6 tracking-tighter">
            {i18n.t('settings.title')}
          </Text>

          <View className="bg-black/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 mb-3">
            <View className="mb-8">
              <Text className="text-slate-400 font-bold text-xs mb-3 ml-1 tracking-[0.2em] uppercase">
                {i18n.t('settings.daily_max')}
              </Text>
              <TextInput
                className="text-white text-4xl font-black p-5 bg-black/60 rounded-[20px]"
                style={{
                  borderWidth: 1,
                  borderColor: activeInput === 'daily' ? neonColors.cyan : 'rgba(255,255,255,0.05)',
                  shadowColor: activeInput === 'daily' ? neonColors.cyan : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: activeInput === 'daily' ? 0.3 : 0,
                  shadowRadius: activeInput === 'daily' ? 12 : 0,
                }}
                keyboardType="numeric"
                value={dailyLimit}
                onChangeText={handleDailyLimitChange}
                onFocus={() => {
                  setActiveInput('daily');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }}
                onBlur={() => setActiveInput(null)}
                placeholder="500"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View>
              <Text className="text-slate-400 font-bold text-xs mb-3 ml-1 tracking-[0.2em] uppercase">
                {i18n.t('settings.monthly_max')}
              </Text>
              <TextInput
                className="text-white text-4xl font-black p-5 bg-black/60 rounded-[20px]"
                style={{
                  borderWidth: 1,
                  borderColor: activeInput === 'monthly' ? neonColors.pink : 'rgba(255,255,255,0.05)',
                  shadowColor: activeInput === 'monthly' ? neonColors.pink : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: activeInput === 'monthly' ? 0.3 : 0,
                  shadowRadius: activeInput === 'monthly' ? 12 : 0,
                }}
                keyboardType="numeric"
                value={monthlyLimit}
                onChangeText={handleMonthlyLimitChange}
                onFocus={() => {
                  setActiveInput('monthly');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }}
                onBlur={() => setActiveInput(null)}
                placeholder="10000"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>
          <Text className="text-slate-500 text-xs ml-3 font-medium">
            {i18n.t('settings.limit_hint')}
          </Text>
        </View>

        {/* Account Section */}
        {user && (
          <View className="mb-10">
            <Text className="text-white text-xl font-bold mb-4 tracking-wide ml-1">
              Hesap
            </Text>
            <View className="bg-black/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
              <View className="mb-6">
                <Text className="text-slate-400 text-xs tracking-widest uppercase font-bold mb-2">Email</Text>
                <Text className="text-white text-base font-semibold">{user.email}</Text>
              </View>
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Çıkış Yap',
                    'Çıkış yapmak istediğinize emin misiniz?',
                    [
                      { text: 'İptal', style: 'cancel' },
                      {
                        text: 'Çıkış Yap',
                        style: 'destructive',
                        onPress: async () => {
                          await signOut();
                          router.replace('/auth/login');
                        },
                      },
                    ],
                  );
                }}
                className="bg-white/5 border border-white/5 rounded-2xl p-4 items-center active:scale-[0.98] transition-all"
              >
                <Text className="text-white font-bold tracking-wide">Çıkış Yap</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!user && (
          <View className="mb-10">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/auth/login');
              }}
              className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 items-center active:scale-[0.98] transition-all"
            >
              <Text className="text-cyan-400 font-bold text-lg mb-1 tracking-wide">
                🔐 Giriş Yap
              </Text>
              <Text className="text-slate-400 text-sm font-medium">
                Verilerinizi bulutta saklayın
              </Text>
            </Pressable>
          </View>
        )}

        {/* Danger Zone */}
        <View className="mb-12 mt-4">
          <Text className="text-crimson-500/80 text-lg font-bold mb-4 tracking-wide ml-1" style={{ color: neonColors.crimson }}>
            {i18n.t('settings.danger_zone')}
          </Text>
          <Pressable
            onPress={handleClearData}
            className="rounded-3xl overflow-hidden active:scale-95 transition-all outline-none"
            style={neonShadow(neonColors.crimson, 'md')}
          >
            <View
              className="p-5 items-center justify-center opacity-90"
              style={{ backgroundColor: neonColors.crimson }}
            >
              <Text className="text-black text-lg font-black tracking-widest uppercase">
                {i18n.t('settings.reset_button')}
              </Text>
            </View>
          </Pressable>
        </View>

      </Animated.ScrollView>
    </View>
  );
}
