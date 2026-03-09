import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/lib/constants/design-tokens';
import { i18n } from '@/lib/translations/i18n';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  message = i18n.t('empty.title'),
  subMessage = i18n.t('empty.no_expenses'),
  icon = 'wallet-outline',
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(350)}
      className="flex-1 items-center justify-center py-20"
    >
      <View
        className="w-20 h-20 rounded-2xl items-center justify-center mb-6"
        style={{ backgroundColor: colors.bgSecondary }}
      >
        <Ionicons name={icon} size={36} color={colors.textSecondary} />
      </View>

      <Text className="text-lg font-semibold mb-2 text-center px-4" style={{ color: colors.textPrimary }}>
        {message}
      </Text>

      <Text className="text-sm font-medium text-center px-12 leading-5" style={{ color: colors.textSecondary }}>
        {subMessage}
      </Text>
    </Animated.View>
  );
}
