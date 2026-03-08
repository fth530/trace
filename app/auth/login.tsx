// S-Class Login Screen
// Based on ROADMAP & Antigravity Protocol

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { migrateAllLocalData } from '../../lib/firebase/migration';
import { useStore } from '../../lib/store';
import { i18n } from '../../lib/translations/i18n';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  gradients,
  gradientLocations,
  neonColors,
  neonShadow,
} from '../../lib/constants/design-tokens';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const { signIn, signInAnonymously, loading } = useAuth();
  const { todayExpenses } = useStore();

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await signIn();

    if (result.success) {
      // First login: move local data to cloud
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

    // S-Class Security: Engage Anonymous Auth to preserve architecture
    const result = await signInAnonymously();
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert(i18n.t('common.error'), i18n.t('auth.login_error'));
    }
  };

  return (
    <View className="flex-1 bg-black items-center justify-center px-6">
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

      <Animated.View
        entering={FadeInDown.duration(1000).springify().damping(16).stiffness(100)}
        className="items-center mb-16 w-full"
      >
        <View
          className="w-24 h-24 rounded-full bg-black/60 border border-white/10 items-center justify-center mb-6 overflow-hidden"
          style={neonShadow(neonColors.cyan, 'lg')}
        >
          <Ionicons name="wallet" size={48} color={neonColors.cyan} />
        </View>

        <Text className="text-5xl font-black text-white mb-2 tracking-tighter"
          style={{
            textShadowColor: neonColors.cyan,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 15,
          }}
        >
          Trace
        </Text>
        <Text className="text-slate-400 text-center text-lg font-medium tracking-wide">
          Finansal kontrolünüzü{'\n'}S-Sınıfı seviyeye taşıyın.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(300).duration(800).springify()}
        className="w-full space-y-5"
      >
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading}
          className="bg-white rounded-2xl p-4 flex-row items-center justify-center active:scale-95 transition-all overflow-hidden"
          style={neonShadow(neonColors.white, 'sm')}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="black" style={{ marginRight: 12 }} />
              <Text className="text-black font-black text-lg tracking-wide uppercase">
                Google ile Giriş Yap
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          disabled={loading}
          className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex-row items-center justify-center active:scale-95 transition-all"
        >
          <Text className="text-slate-300 font-bold text-base tracking-wide uppercase">
            Giriş Yapmadan Devam Et
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(600).duration(800).springify()}
        className="absolute bottom-10"
      >
        <Text className="text-slate-500 text-xs text-center tracking-widest leading-loose uppercase">
          GİRİŞ YAPARAK VERİLERİNİZİ BULUTTA SAKLAYIN{'\n'}VE TÜM CİHAZLARINIZLA SENKRONİZE EDİN
        </Text>
      </Animated.View>
    </View>
  );
}
