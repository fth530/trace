// S-Class Category Badge Component
// Based on Antigravity UI Architecture

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, categoryConfig } from '@/lib/constants/categories';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  category: Category;
  size?: BadgeSize;
}

export const Badge: React.FC<BadgeProps> = ({ category, size = 'md' }) => {
  const config = categoryConfig[category];
  const categoryColor = config.color;
  const isSmall = size === 'sm';

  return (
    <View
      className={`flex-row items-center rounded-full border border-white/5 bg-black/60 backdrop-blur-md overflow-hidden ${isSmall ? 'py-1 px-2' : 'py-1.5 px-3'
        }`}
    >
      <View
        className="absolute inset-0 opacity-20"
        style={{ backgroundColor: categoryColor }}
      />
      <Ionicons
        name={config.icon}
        size={isSmall ? 10 : 14}
        color={categoryColor}
        style={{ marginRight: 6 }}
      />
      <Text
        className={`font-semibold tracking-wide ${isSmall ? 'text-[10px]' : 'text-xs'}`}
        style={{ color: '#FAFAFA' }}
      >
        {config.label}
      </Text>
    </View>
  );
};
