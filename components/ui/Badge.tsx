// Category Badge Component
// Based on ROADMAP §4 Component Inventory

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { Category, categoryConfig } from '@/lib/constants/categories';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  category: Category;
  size?: BadgeSize;
}

export const Badge: React.FC<BadgeProps> = ({ category, size = 'md' }) => {
  const t = useThemeColors();
  const config = categoryConfig[category];
  const categoryColor = t.category[category];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: `${categoryColor}20` }, // 20% opacity
        isSmall && styles.containerSmall,
      ]}
    >
      <Ionicons
        name={config.icon}
        size={isSmall ? 12 : 16}
        color={categoryColor}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          { color: categoryColor },
          isSmall && styles.textSmall,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xxs,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.headline.fontWeight,
  },
  textSmall: {
    fontSize: typography.footnote.fontSize,
  },
});
