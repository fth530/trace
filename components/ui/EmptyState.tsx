import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { neonColors, neonShadow } from "@/lib/constants/design-tokens";
import { i18n } from "@/lib/translations/i18n";

interface EmptyStateProps {
    message?: string;
    subMessage?: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
    message = i18n.t('empty.title'),
    subMessage = i18n.t('empty.no_expenses'),
    icon = "wallet-outline",
}: EmptyStateProps) {
    return (
        <Animated.View
            entering={FadeInDown.duration(600).springify().damping(12)}
            className="flex-1 items-center justify-center py-24"
        >
            <View
                className="w-24 h-24 rounded-full items-center justify-center mb-6 border border-white/5 bg-slate-900/50 backdrop-blur-md"
                style={neonShadow(neonColors.cyan, 'sm')}
            >
                <Ionicons name={icon} size={48} color={neonColors.sky} />
            </View>

            <Text className="text-white text-xl font-bold tracking-widest mb-2 text-center">
                {message}
            </Text>

            <Text className="text-slate-500 font-medium text-sm text-center px-10">
                {subMessage}
            </Text>
        </Animated.View>
    );
}
