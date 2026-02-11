// Reusable Button Component
// Based on ROADMAP §4 Component Inventory

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      // Haptic feedback on press
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.accent.dark,
          },
          text: {
            color: colors.text.primary.dark,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.surface.dark,
            borderWidth: 1,
            borderColor: colors.text.tertiary.dark,
          },
          text: {
            color: colors.text.primary.dark,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.danger.dark,
          },
          text: {
            color: colors.text.primary.dark,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        variantStyles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.text, variantStyles.text, disabled && styles.disabledText]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Accessibility: minimum touch target
  },
  text: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.headline.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
});
