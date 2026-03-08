// S-Class Add Expense Modal
// Based on Antigravity Protocol

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
import { LinearGradient } from 'expo-linear-gradient';
import { i18n } from '@/lib/translations/i18n';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  gradients,
  neonColors,
  placeholderColor,
  neonShadow,
} from '@/lib/constants/design-tokens';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

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
      className="flex-1 bg-zinc-950"
    >
      {/* Background S-Class Gradient */}
      <View className="absolute top-0 w-full h-full opacity-60 pointer-events-none">
        <LinearGradient
          colors={gradients.modal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <Animated.View
        entering={FadeInDown.duration(600).springify().damping(16).stiffness(100)}
        className="flex-row items-center justify-between px-6 pt-12 pb-4"
      >
        <Text className="text-white text-3xl font-black tracking-tighter">
          {i18n.t('modal.add_title')}
        </Text>
        <Pressable
          onPress={handleClose}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 active:scale-90 active:bg-white/10 transition-all backdrop-blur-md"
          accessibilityRole="button"
          accessibilityLabel={i18n.t('common.close')}
        >
          <Ionicons name="close" size={24} color={neonColors.white} />
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
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)}>
          {/* Amount Input */}
          <View className="mb-7">
            <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-3 ml-1">
              {i18n.t('modal.amount_label')}
            </Text>
            <TextInput
              value={amount}
              onChangeText={handleAmountChange}
              placeholder={i18n.t('modal.amount_placeholder')}
              placeholderTextColor={placeholderColor}
              keyboardType="decimal-pad"
              autoFocus={true}
              className="w-full text-white text-5xl font-black p-5 bg-black/60 border border-white/5 rounded-3xl backdrop-blur-xl"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify().damping(14)}>
          {/* Category Chips */}
          <View className="mb-7">
            <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-4 ml-1">
              {i18n.t('modal.category_label')}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const catColor = categoryConfig[cat].color;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => handleCategorySelect(cat)}
                    className={`px-5 py-3 rounded-2xl border active:scale-90 transition-all overflow-hidden`}
                    style={
                      isSelected
                        ? {
                          borderColor: catColor,
                          backgroundColor: `${catColor}30`,
                        }
                        : {
                          borderColor: 'rgba(255,255,255,0.05)',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                        }
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Kategori: ${cat}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    {isSelected && (
                      <View
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: catColor }}
                      />
                    )}
                    <Text
                      className={`text-sm font-semibold tracking-wide`}
                      style={
                        isSelected
                          ? { color: '#FAFAFA' }
                          : { color: neonColors.slateDark }
                      }
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify().damping(14)}>
          {/* Description Input */}
          <View className="mb-8">
            <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-3 ml-1">
              {i18n.t('modal.desc_label')}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={i18n.t('modal.desc_placeholder')}
              placeholderTextColor={placeholderColor}
              maxLength={100}
              className="w-full text-white text-lg font-medium p-5 bg-black/60 border border-white/5 rounded-3xl backdrop-blur-xl"
            />
          </View>
        </Animated.View>

        <View className="flex-1" />

        <Animated.View entering={FadeInUp.delay(400).springify().damping(14)}>
          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            className="w-full mt-4 overflow-hidden rounded-full active:scale-95 transition-all outline-none"
            style={neonShadow(neonColors.mint, 'md')} // Updated to mint from S-Class
          >
            <View
              className="p-5 items-center justify-center opacity-90"
              style={{ backgroundColor: neonColors.mint }} // Using Mint direct accent
            >
              <Text className="text-black text-lg font-black tracking-widest uppercase">
                {isSubmitting
                  ? i18n.t('modal.saving_button')
                  : i18n.t('modal.save_button')}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
