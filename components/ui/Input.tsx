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
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';

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

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.label,
          labelStyle,
          {
            color: error
              ? colors.danger.dark
              : isFocused
              ? colors.accent.dark
              : colors.text.secondary.dark,
          },
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
        placeholderTextColor={colors.text.tertiary.dark}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        style={[
          styles.input,
          multiline && styles.multiline,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        accessibilityLabel={label}
        accessibilityHint={placeholder}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    backgroundColor: colors.surface.dark,
    paddingHorizontal: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface.dark,
    borderWidth: 1,
    borderColor: colors.text.tertiary.dark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.text.primary.dark,
    minHeight: 56, // 8px grid: 7 * 8
  },
  multiline: {
    minHeight: 96, // 8px grid: 12 * 8
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: colors.accent.dark,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.danger.dark,
  },
  errorText: {
    color: colors.danger.dark,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});
