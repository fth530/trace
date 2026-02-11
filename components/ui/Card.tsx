// Glassmorphic Card Component
// Based on ROADMAP §4 Component Inventory

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blur?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style,
  blur = true 
}) => {
  if (blur) {
    return (
      <BlurView
        intensity={60}
        tint="dark"
        style={[styles.container, styles.blur, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, styles.solid, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: shadows.md.offset,
    shadowOpacity: shadows.md.opacity,
    shadowRadius: shadows.md.radius,
    elevation: shadows.md.elevation,
  },
  blur: {
    backgroundColor: colors.surfaceGlass.dark,
  },
  solid: {
    backgroundColor: colors.surface.dark,
  },
});
