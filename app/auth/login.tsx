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

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const { todayExpenses, settings } = useStore();

  const handleGoogleSignIn = async () => {
    const result = await signIn();

    if (result.success) {
      // İlk giriş: local verileri cloud'a taşı
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
            onPress: async () => {
              const migrationResult = await migrateAllLocalData();

              if (migrationResult.success) {
                Alert.alert(
                  i18n.t('auth.migration_success_title'),
                  i18n.t('auth.migration_success_message'),
                );
              } else {
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
        router.replace('/(tabs)');
      }
    } else {
      Alert.alert(
        i18n.t('common.error'),
        result.error || i18n.t('auth.login_error'),
      );
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View className="items-center mb-12">
        <Text className="text-4xl font-bold text-gray-900 mb-2">
          💰 Expense Tracker
        </Text>
        <Text className="text-gray-600 text-center">
          Harcamalarınızı takip edin, bütçenizi kontrol altında tutun
        </Text>
      </View>

      <View className="w-full space-y-4">
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading}
          className="bg-white border-2 border-gray-300 rounded-xl p-4 flex-row items-center justify-center active:bg-gray-50"
        >
          {loading ? (
            <ActivityIndicator color="#4285F4" />
          ) : (
            <>
              <Text className="text-xl mr-2">🔐</Text>
              <Text className="text-gray-900 font-semibold text-base">
                Google ile Giriş Yap
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          className="p-4"
        >
          <Text className="text-gray-500 text-center">
            Giriş yapmadan devam et
          </Text>
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-8">
        <Text className="text-gray-400 text-sm text-center">
          Giriş yaparak verilerinizi güvende tutun{'\n'}
          ve tüm cihazlarınızda erişin
        </Text>
      </View>
    </View>
  );
}
