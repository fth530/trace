// Settings Screen (Ayarlar)
// Based on ROADMAP §6.5 Settings Screen Specification & Antigravity Protocol

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
import { i18n } from '@/lib/translations/i18n';
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

  const [dailyLimit, setDailyLimit] = useState(settings.daily_limit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(
    settings.monthly_limit.toString(),
  );

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
    <View className="flex-1 bg-zinc-950">
      {/* Universal Antigravity Background Glow */}
      <View className="absolute top-0 w-full h-full opacity-20 pointer-events-none">
        <LinearGradient
          colors={gradients.main}
          locations={gradientLocations.main}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
      >
        {/* Limits Section */}
        <View className="mb-10">
          <Text className="text-white text-xl font-bold mb-4 tracking-wide ml-1">
            {i18n.t('settings.title')}
          </Text>

          <View className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 mb-2">
            <View className="mb-6">
              <Text className="text-slate-400 font-medium text-sm mb-2 ml-1 tracking-widest uppercase">
                {i18n.t('settings.daily_max')}
              </Text>
              <TextInput
                className="text-white text-3xl font-black p-4 bg-black/40 border border-white/5 rounded-2xl"
                keyboardType="numeric"
                value={dailyLimit}
                onChangeText={handleDailyLimitChange}
                placeholder="500"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View>
              <Text className="text-slate-400 font-medium text-sm mb-2 ml-1 tracking-widest uppercase">
                {i18n.t('settings.monthly_max')}
              </Text>
              <TextInput
                className="text-white text-3xl font-black p-4 bg-black/40 border border-white/5 rounded-2xl"
                keyboardType="numeric"
                value={monthlyLimit}
                onChangeText={handleMonthlyLimitChange}
                placeholder="10000"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>
          <Text className="text-slate-500 text-xs ml-3">
            {i18n.t('settings.limit_hint')}
          </Text>
        </View>

        {/* Danger Zone */}
        <View className="mb-12 mt-4">
          <Text className="text-rose-500/80 text-xl font-bold mb-4 tracking-wide ml-1">
            {i18n.t('settings.danger_zone')}
          </Text>
          <Pressable
            onPress={handleClearData}
            className="rounded-2xl overflow-hidden active:scale-95 transition-all outline-none"
            style={neonShadow(neonColors.rose, 'md')}
          >
            <LinearGradient
              colors={gradients.danger}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5 items-center justify-center opacity-90"
            >
              <Text className="text-white text-lg font-black tracking-widest uppercase">
                {i18n.t('settings.reset_button')}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Versiyon bilgisi kullanıcı isteği üzerine kaldırıldı */}
      </ScrollView>
    </View>
  );
}
