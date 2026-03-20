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

const SectionLabel = ({ label }: { label: string }) => (
  <Text style={{
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textTertiary,
    marginBottom: 8,
    marginLeft: 4,
  }}>
    {label}
  </Text>
);

const SettingCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={{
    borderRadius: 20,
    marginBottom: 22,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.separator,
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </View>
);

const Divider = () => (
  <View style={{ height: 1, backgroundColor: colors.separatorLight, marginHorizontal: 16 }} />
);

export default function SettingsScreen() {
  const store = useStore();
  const { settings, updateSetting, clearAllData } = store;
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [dailyLimit, setDailyLimit] = useState(settings.daily_limit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(settings.monthly_limit.toString());
  const [activeInput, setActiveInput] = useState<'daily' | 'monthly' | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const dailyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const monthlyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setDailyLimit(settings.daily_limit.toString());
    setMonthlyLimit(settings.monthly_limit.toString());
  }, [settings.daily_limit, settings.monthly_limit]);

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
              Alert.alert(i18n.t('settings.reset_success_title'), i18n.t('settings.reset_success_message'));
            } catch {
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
        Alert.alert('Uyarı', 'Dışa aktarılacak harcama verisi bulunamadı.');
      } else {
        Alert.alert('Hata', 'Veriler dışa aktarılırken bir sorun oluştu.');
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

  const LimitRow = ({
    icon,
    iconColor,
    label,
    value,
    onChange,
    inputKey,
  }: {
    icon: string;
    iconColor: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    inputKey: 'daily' | 'monthly';
  }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: `${iconColor}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Ionicons name={icon as any} size={17} color={iconColor} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{label}</Text>
      <TextInput
        style={{
          textAlign: 'right',
          fontSize: 17,
          fontWeight: '800',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          color: colors.textPrimary,
          backgroundColor: colors.bgTertiary,
          minWidth: 110,
          borderWidth: 1.5,
          borderColor: activeInput === inputKey ? colors.primary : 'transparent',
        }}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        onFocus={() => { setActiveInput(inputKey); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); }}
        onBlur={() => setActiveInput(null)}
        placeholder="0"
        placeholderTextColor={colors.textTertiary}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <Animated.ScrollView
        entering={FadeInDown.duration(350)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: insets.top + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
            UYGULAMA
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>
            {i18n.t('settings.title')}
          </Text>
        </View>

        {/* Limits */}
        <SectionLabel label="Harcama Limitleri" />
        <SettingCard>
          <LimitRow
            icon="today-outline"
            iconColor={colors.primary}
            label={i18n.t('settings.daily_max')}
            value={dailyLimit}
            onChange={handleDailyLimitChange}
            inputKey="daily"
          />
          <Divider />
          <LimitRow
            icon="calendar-outline"
            iconColor={colors.warning}
            label={i18n.t('settings.monthly_max')}
            value={monthlyLimit}
            onChange={handleMonthlyLimitChange}
            inputKey="monthly"
          />
        </SettingCard>

        {/* Account */}
        <SectionLabel label="Hesap" />
        <SettingCard>
          {user ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
                <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="person" size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary, marginBottom: 2 }}>E-POSTA</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{user.email}</Text>
                </View>
              </View>
              <Divider />
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { await signOut(); router.replace('/auth/login'); } },
                  ]);
                }}
                style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 14, opacity: pressed ? 0.7 : 1 })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${colors.danger}12`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="log-out-outline" size={17} color={colors.danger} />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>Çıkış Yap</Text>
                </View>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/auth/login'); }}
              style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 16, opacity: pressed ? 0.7 : 1 })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="person-outline" size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>Giriş Yap</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textTertiary, marginTop: 2 }}>Verilerinizi bulutta saklayın</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </View>
            </Pressable>
          )}
        </SettingCard>

        {/* Data */}
        <SectionLabel label="Veri Yönetimi" />
        <SettingCard>
          <Pressable
            onPress={handleExportCSV}
            disabled={isExporting}
            style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 14, opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${colors.success}15`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                {isExporting
                  ? <ActivityIndicator size="small" color={colors.success} />
                  : <Ionicons name="download-outline" size={17} color={colors.success} />
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>Verileri Dışa Aktar</Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textTertiary, marginTop: 2 }}>CSV dosyası olarak paylaş</Text>
              </View>
            </View>
          </Pressable>
          <Divider />
          <Pressable
            onPress={handleClearData}
            style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 14, opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${colors.danger}12`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="trash-outline" size={17} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>{i18n.t('settings.reset_button')}</Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textTertiary, marginTop: 2 }}>Tüm harcama ve ayar verilerini siler</Text>
              </View>
            </View>
          </Pressable>
        </SettingCard>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: colors.bgSecondary,
            borderWidth: 1,
            borderColor: colors.separator,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textTertiary }}>Trace</Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textTertiary, marginTop: 2 }}>v1.0.0 · Kişisel Harcama Takibi</Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
