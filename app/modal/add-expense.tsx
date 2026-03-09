import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import {
  CATEGORIES,
  Category,
  categoryConfig,
} from '@/lib/constants/categories';
import { validateDecimal, parseCurrency } from '@/lib/utils/currency';
import { logger } from '@/lib/utils/logger';
import { i18n } from '@/lib/translations/i18n';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors } from '@/lib/constants/design-tokens';

export default function AddExpenseModal() {
  const { addExpense } = useStore();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^\d.,]/g, '');
    const normalized = cleaned.replace(',', '.');

    if (normalized === '' || validateDecimal(normalized)) {
      setAmount(normalized);
    }
  };

  const handleCategorySelect = (selectedCategory: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategory(selectedCategory);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const validateForm = (): string | null => {
    const parsedAmount = parseCurrency(amount);

    if (parsedAmount === 0) {
      return i18n.t('modal.error_amount');
    }

    if (description.trim() === '') {
      return i18n.t('modal.error_desc');
    }

    if (parsedAmount > 1000000) {
      return 'confirm_large_amount';
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();

    if (error === 'confirm_large_amount') {
      Alert.alert(
        i18n.t('modal.confirm_title'),
        i18n.t('modal.confirm_large'),
        [
          { text: i18n.t('modal.cancel'), style: 'cancel' },
          { text: i18n.t('modal.continue'), onPress: () => submitExpense() },
        ],
      );
      return;
    }

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(i18n.t('modal.error_title'), error);
      return;
    }

    await submitExpense();
  };

  const submitExpense = async () => {
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const parsedAmount = parseCurrency(amount);

      await addExpense({
        amount: parsedAmount,
        category,
        description: description.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      logger.error('Add expense failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('modal.error_save'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: colors.bgPrimary }}
    >
      <Animated.View
        entering={FadeInDown.duration(300)}
        className="flex-row items-center justify-between px-6 pt-14 pb-4"
      >
        <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
          {i18n.t('modal.add_title')}
        </Text>
        <Pressable
          onPress={handleClose}
          className="p-2 rounded-full active:opacity-50"
          style={{ backgroundColor: colors.bgTertiary }}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('common.close')}
        >
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.delay(100)}>
          <View className="mb-6">
            <Text className="text-xs font-semibold tracking-wider uppercase mb-2 ml-1" style={{ color: colors.textSecondary }}>
              {i18n.t('modal.amount_label')}
            </Text>
            <TextInput
              value={amount}
              onChangeText={handleAmountChange}
              placeholder={i18n.t('modal.amount_placeholder')}
              placeholderTextColor={colors.gray600}
              keyboardType="decimal-pad"
              autoFocus={true}
              className="w-full text-4xl font-bold p-4 rounded-xl"
              style={{
                color: colors.textPrimary,
                backgroundColor: colors.bgSecondary,
              }}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(180)}>
          <View className="mb-6">
            <Text className="text-xs font-semibold tracking-wider uppercase mb-3 ml-1" style={{ color: colors.textSecondary }}>
              {i18n.t('modal.category_label')}
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const catColor = categoryConfig[cat].color;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => handleCategorySelect(cat)}
                    className="px-4 py-2.5 rounded-xl active:opacity-70"
                    style={{
                      backgroundColor: isSelected ? `${catColor}20` : colors.bgSecondary,
                      borderWidth: 1.5,
                      borderColor: isSelected ? catColor : 'transparent',
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: isSelected ? catColor : colors.textSecondary }}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260)}>
          <View className="mb-8">
            <Text className="text-xs font-semibold tracking-wider uppercase mb-2 ml-1" style={{ color: colors.textSecondary }}>
              {i18n.t('modal.desc_label')}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={i18n.t('modal.desc_placeholder')}
              placeholderTextColor={colors.gray600}
              maxLength={100}
              className="w-full text-base font-medium p-4 rounded-xl"
              style={{
                color: colors.textPrimary,
                backgroundColor: colors.bgSecondary,
              }}
            />
          </View>
        </Animated.View>

        <View className="flex-1" />

        <Animated.View entering={FadeInUp.delay(340)}>
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            className="w-full mt-4 rounded-xl p-4 items-center active:opacity-80"
            style={{
              backgroundColor: colors.primary,
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            <Text className="text-base font-bold" style={{ color: colors.white }}>
              {isSubmitting
                ? i18n.t('modal.saving_button')
                : i18n.t('modal.save_button')}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
