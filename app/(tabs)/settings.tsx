import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';
import { useAuth } from '@/lib/hooks/useAuth';
import { router } from 'expo-router';
import { colors } from '@/lib/constants/design-tokens';
import { getDatabase } from '@/lib/db';
import { exportExpensesCSV } from '@/lib/utils/export';

export default function SettingsScreen() {
  const store = useStore();
  const { settings, updateSetting, clearAllData } = store;
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [dailyLimit, setDailyLimit] = useState(settings.daily_limit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(
    settings.monthly_limit.toString(),
  );
  const [activeInput, setActiveInput] = useState<'daily' | 'monthly' | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const dailyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const monthlyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
        { text: i18n.t('settings.reset_cancel'), style: 'cancel' },
        {
          text: i18n.t('settings.reset_action'),
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              await clearAllData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                i18n.t('settings.reset_success_title'),
                i18n.t('settings.reset_success_message'),
              );
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(i18n.t('common.error'), i18n.t('settings.reset_error'));
            }
          },
        },
      ],
    );
  };

  const handleExportCSV = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);
    try {
      const db = getDatabase();
      await exportExpensesCSV(db);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (error?.message === 'NO_DATA') {
        Alert.alert('Uyari', 'Disa aktarilacak harcama verisi bulunamadi.');
      } else if (error?.message === 'SHARING_UNAVAILABLE') {
        Alert.alert('Hata', 'Paylasim bu cihazda desteklenmiyor.');
      } else {
        Alert.alert('Hata', 'Veriler disa aktarilirken bir sorun olustu.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (dailyTimeoutRef.current) clearTimeout(dailyTimeoutRef.current);
      if (monthlyTimeoutRef.current) clearTimeout(monthlyTimeoutRef.current);
    };
  }, []);

  const SettingRow = ({ icon, iconColor, label, children }: { icon: string; iconColor: string; label: string; children: React.ReactNode }) => (
    <View className="flex-row items-center py-3">
      <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${iconColor}15` }}>
        <Ionicons name={icon as any} size={16} color={iconColor} />
      </View>
      <Text className="flex-1 text-[15px] font-medium" style={{ color: colors.textPrimary }}>{label}</Text>
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <Animated.ScrollView
        entering={FadeInDown.duration(350)}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: insets.top + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
          {i18n.t('settings.title')}
        </Text>

        {/* Limits Section */}
        <Text className="text-xs font-semibold tracking-wider uppercase mb-2 ml-1" style={{ color: colors.textSecondary }}>
          Harcama Limitleri
        </Text>
        <View className="rounded-2xl mb-6 overflow-hidden" style={{ backgroundColor: colors.bgSecondary }}>
          <View className="px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.separatorLight }}>
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${colors.primary}15` }}>
                <Ionicons name="today-outline" size={16} color={colors.primary} />
              </View>
              <Text className="flex-1 text-[15px] font-medium" style={{ color: colors.textPrimary }}>
                {i18n.t('settings.daily_max')}
              </Text>
              <TextInput
                className="text-right text-lg font-bold px-3 py-1.5 rounded-lg"
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.bgTertiary,
                  minWidth: 100,
                  borderWidth: 1,
                  borderColor: activeInput === 'daily' ? colors.primary : 'transparent',
                }}
                keyboardType="numeric"
                value={dailyLimit}
                onChangeText={handleDailyLimitChange}
                onFocus={() => { setActiveInput('daily'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); }}
                onBlur={() => setActiveInput(null)}
                placeholder="0"
                placeholderTextColor={colors.gray600}
              />
            </View>
          </View>
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${colors.warning}15` }}>
                <Ionicons name="calendar-outline" size={16} color={colors.warning} />
              </View>
              <Text className="flex-1 text-[15px] font-medium" style={{ color: colors.textPrimary }}>
                {i18n.t('settings.monthly_max')}
              </Text>
              <TextInput
                className="text-right text-lg font-bold px-3 py-1.5 rounded-lg"
                style={{
                  color: colors.textPrimary,
                  backgroundColor: colors.bgTertiary,
                  minWidth: 100,
                  borderWidth: 1,
                  borderColor: activeInput === 'monthly' ? colors.primary : 'transparent',
                }}
                keyboardType="numeric"
                value={monthlyLimit}
                onChangeText={handleMonthlyLimitChange}
                onFocus={() => { setActiveInput('monthly'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); }}
                onBlur={() => setActiveInput(null)}
                placeholder="0"
                placeholderTextColor={colors.gray600}
              />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <Text className="text-xs font-semibold tracking-wider uppercase mb-2 ml-1" style={{ color: colors.textSecondary }}>
          Hesap
        </Text>
        <View className="rounded-2xl mb-6 overflow-hidden" style={{ backgroundColor: colors.bgSecondary }}>
          {user ? (
            <>
              <View className="px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.separatorLight }}>
                <SettingRow icon="mail-outline" iconColor={colors.primary} label="E-posta">
                  <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>{user.email}</Text>
                </SettingRow>
              </View>
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { await signOut(); router.replace('/auth/login'); } },
                  ]);
                }}
                className="px-4 py-3.5 active:opacity-70"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 8 }} />
                  <Text className="font-semibold" style={{ color: colors.danger }}>Çıkış Yap</Text>
                </View>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/auth/login'); }}
              className="px-4 py-4 active:opacity-70"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${colors.primary}15` }}>
                  <Ionicons name="person-outline" size={16} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold" style={{ color: colors.primary }}>Giriş Yap</Text>
                  <Text className="text-xs font-medium mt-0.5" style={{ color: colors.textSecondary }}>Verilerinizi bulutta saklayın</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Data Section */}
        <Text className="text-xs font-semibold tracking-wider uppercase mb-2 ml-1" style={{ color: colors.textSecondary }}>
          Veri Yönetimi
        </Text>
        <View className="rounded-2xl mb-6 overflow-hidden" style={{ backgroundColor: colors.bgSecondary }}>
          <Pressable
            onPress={handleExportCSV}
            disabled={isExporting}
            className="px-4 py-3.5 active:opacity-70"
            style={{ borderBottomWidth: 1, borderBottomColor: colors.separatorLight }}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${colors.primary}15` }}>
                {isExporting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="download-outline" size={16} color={colors.primary} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-medium" style={{ color: colors.textPrimary }}>
                  Verileri Disa Aktar (CSV)
                </Text>
                <Text className="text-xs font-medium mt-0.5" style={{ color: colors.textTertiary }}>
                  Tum harcamalari CSV dosyasi olarak paylas
                </Text>
              </View>
              {isExporting && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={handleClearData}
            className="px-4 py-3.5 active:opacity-70"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${colors.danger}15` }}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-medium" style={{ color: colors.danger }}>
                  {i18n.t('settings.reset_button')}
                </Text>
                <Text className="text-xs font-medium mt-0.5" style={{ color: colors.textTertiary }}>
                  Tum harcama ve ayar verilerini siler
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* App Info */}
        <View className="items-center mt-4 mb-8">
          <Text className="text-xs font-medium" style={{ color: colors.textTertiary }}>Trace v1.0.0</Text>
          <Text className="text-xs font-medium mt-1" style={{ color: colors.textTertiary }}>Kişisel Harcama Takibi</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
