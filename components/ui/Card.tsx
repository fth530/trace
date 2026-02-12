// Glassmorphic Card Component
// Based on ROADMAP §4 Component Inventory

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blur?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  blur = true,
}) => {
  const t = useThemeColors();

  if (blur) {
    return (
      <BlurView
        intensity={60}
        tint={t.scheme}
        style={[styles.container, { backgroundColor: t.surfaceGlass }, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.surface }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: shadows.md.offset,
    shadowOpacity: shadows.md.opacity,
    shadowRadius: shadows.md.radius,
    elevation: shadows.md.elevation,
  },
});
