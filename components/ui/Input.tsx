// Text Input with Floating Label
// Based on ROADMAP §4 Component Inventory

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  KeyboardTypeOptions,
} from 'react-native';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  maxLength,
  error,
}) => {
  const t = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [labelAnimation] = useState(new Animated.Value(value ? 1 : 0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const labelStyle = {
    transform: [
      {
        translateY: labelAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
      {
        scale: labelAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
    ],
    opacity: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    }),
  };

  const labelColor = error
    ? t.danger
    : isFocused
      ? t.accent
      : t.textSecondary;

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.label,
          labelStyle,
          { color: labelColor, backgroundColor: t.surface },
        ]}
      >
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={t.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        style={[
          styles.input,
          {
            backgroundColor: t.surface,
            borderColor: t.textTertiary,
            color: t.textPrimary,
          },
          multiline && styles.multiline,
          isFocused && { borderColor: t.accent, borderWidth: 2 },
          error && { borderColor: t.danger },
        ]}
        accessibilityLabel={label}
        accessibilityHint={placeholder}
      />
      {error && <Text style={[styles.errorText, { color: t.danger }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    position: 'absolute',
    left: spacing.sm,
    top: 0,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.body.fontWeight,
    zIndex: 1,
    paddingHorizontal: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: typography.body.fontSize,
    minHeight: 56,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});
