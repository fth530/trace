import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { migrateAllLocalData } from '../../lib/firebase/migration';
import { useStore } from '../../lib/store';
import { i18n } from '../../lib/translations/i18n';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/constants/design-tokens';

export default function LoginScreen() {
  const { signIn, signInAnonymously, loading } = useAuth();
  const { todayExpenses } = useStore();

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await signIn();

    if (!result.success && result.error?.includes('not available')) {
      Alert.alert(
        'Firebase Yok',
        'Expo Go ile Firebase kullanilamaz. Giris yapmadan devam edebilirsiniz.',
      );
      return;
    }

    if (result.success) {
      const hasLocalData = todayExpenses.length > 0;

      if (hasLocalData) {
        Alert.alert(i18n.t('auth.sync_title'), i18n.t('auth.sync_message'), [
          {
            text: i18n.t('common.no'),
            style: 'cancel',
            onPress: () => router.replace('/(tabs)'),
          },
          {
            text: i18n.t('common.yes'),
            style: 'default',
            onPress: async () => {
              const migrationResult = await migrateAllLocalData();

              if (migrationResult.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  i18n.t('auth.migration_success_title'),
                  i18n.t('auth.migration_success_message'),
                );
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert(
                  i18n.t('common.error'),
                  i18n.t('auth.migration_error'),
                );
              }
              router.replace('/(tabs)');
            },
          },
        ]);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        i18n.t('common.error'),
        result.error || i18n.t('auth.login_error'),
      );
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.bgPrimary }}>
      <Animated.View
        entering={FadeInDown.duration(350)}
        className="items-center mb-16 w-full"
      >
        <View
          className="w-20 h-20 rounded-2xl items-center justify-center mb-6"
          style={{ backgroundColor: `${colors.primary}15` }}
        >
          <Ionicons name="wallet" size={40} color={colors.primary} />
        </View>

        <Text className="text-4xl font-black mb-2" style={{ color: colors.textPrimary }}>
          Trace
        </Text>
        <Text className="text-center text-base font-medium" style={{ color: colors.textSecondary }}>
          Harcamalarinizi kolayca{'\n'}takip edin ve analiz edin.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(150).duration(300)}
        className="w-full"
        style={{ gap: 12 }}
      >
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading}
          className="rounded-xl p-4 flex-row items-center justify-center active:opacity-80"
          style={{ backgroundColor: colors.white }}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <>
              <Ionicons name="logo-google" size={22} color="black" style={{ marginRight: 10 }} />
              <Text className="text-base font-bold" style={{ color: colors.black }}>
                Google ile Giris Yap
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          disabled={loading}
          className="rounded-xl p-4 flex-row items-center justify-center active:opacity-70"
          style={{ backgroundColor: colors.bgSecondary }}
        >
          <Text className="font-semibold text-base" style={{ color: colors.textSecondary }}>
            Giris Yapmadan Devam Et
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(250).duration(300)}
        className="absolute bottom-10"
      >
        <Text className="text-xs text-center leading-5" style={{ color: colors.textTertiary }}>
          Giris yaparak verilerinizi bulutta saklayin{'\n'}ve tum cihazlarinizla senkronize edin
        </Text>
      </Animated.View>
    </View>
  );
}
