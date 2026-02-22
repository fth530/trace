// Category Badge Component
// Based on ROADMAP §4 Component Inventory & Antigravity Protocol

import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category, categoryConfig } from "@/lib/constants/categories";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  category: Category;
  size?: BadgeSize;
}

export const Badge: React.FC<BadgeProps> = ({ category, size = "md" }) => {
  const config = categoryConfig[category];
  const categoryColor = config.color;
  const isSmall = size === "sm";

  return (
    <View
      className={`flex-row items-center rounded-lg border border-white/10 ${isSmall ? "py-0.5 px-1.5" : "py-1 px-2.5"
        }`}
      style={{ backgroundColor: `${categoryColor}20` }}
    >
      <Ionicons
        name={config.icon}
        size={isSmall ? 12 : 16}
        color={categoryColor}
        style={{ marginRight: 4 }}
      />
      <Text
        className={`font-bold ${isSmall ? "text-[10px]" : "text-xs"}`}
        style={{ color: categoryColor }}
      >
        {config.label}
      </Text>
    </View>
  );
};

