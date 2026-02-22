import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

interface EmptyStateProps {
    message?: string;
    subMessage?: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
    message = "Bulunamadı",
    subMessage = "Burada henüz bir hareket yok.",
    icon = "wallet-outline",
}: EmptyStateProps) {
    return (
        <Animated.View
            entering={FadeInDown.duration(600).springify().damping(12)}
            className="flex-1 items-center justify-center py-24"
        >
            <View
                className="w-24 h-24 rounded-full items-center justify-center mb-6 border border-white/5 bg-slate-900/50 backdrop-blur-md"
                style={{
                    shadowColor: "#0ea5e9", // Neon Sky
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 5,
                }}
            >
                <Ionicons name={icon} size={48} color="#38bdf8" />
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
