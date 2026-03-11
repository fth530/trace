import React, { ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/utils/logger';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

const DefaultFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <View className="flex-1 bg-zinc-950 items-center justify-center px-6">
      <View className="items-center mb-8">
        <View
          className="w-24 h-24 rounded-full bg-red-500/20 items-center justify-center mb-6"
          style={{
            shadowColor: '#F43F5E',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          }}
        >
          <Ionicons name="warning" size={48} color="#F43F5E" />
        </View>

        <Text className="text-white text-2xl font-bold mb-2 text-center">
          Bir Şeyler Ters Gitti
        </Text>
        <Text className="text-slate-400 text-center mb-6">
          Uygulama beklenmeyen bir hatayla karşılaştı
        </Text>
      </View>

      {__DEV__ && error && (
        <ScrollView className="w-full max-h-48 mb-6 bg-slate-900/50 rounded-xl p-4">
          <Text className="text-red-400 text-xs font-mono">
            {error.toString()}
          </Text>
        </ScrollView>
      )}

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          resetErrorBoundary();
        }}
        className="bg-slate-800 px-8 py-4 rounded-xl active:bg-slate-700"
      >
        <Text className="text-white font-semibold text-base">
          Tekrar Dene
        </Text>
      </Pressable>
    </View>
  );
};

export const ErrorBoundary = ({ children, fallback }: Props) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : DefaultFallback}
      onError={(error, info) => {
        logger.error('ErrorBoundary caught an error:', error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
