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
import { CATEGORIES, Category, categoryConfig } from '@/lib/constants/categories';
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
    if (normalized === '' || validateDecimal(normalized)) setAmount(normalized);
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
    if (parsedAmount === 0) return i18n.t('modal.error_amount');
    if (description.trim() === '') return i18n.t('modal.error_desc');
    if (parsedAmount > 1000000) return 'confirm_large_amount';
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error === 'confirm_large_amount') {
      Alert.alert(i18n.t('modal.confirm_title'), i18n.t('modal.confirm_large'), [
        { text: i18n.t('modal.cancel'), style: 'cancel' },
        { text: i18n.t('modal.continue'), onPress: () => submitExpense() },
      ]);
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
      await addExpense({ amount: parseCurrency(amount), category, description: description.trim() });
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

  const selectedCat = category ? categoryConfig[category] : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 56,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.separator,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
            YENİ KAYIT
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>
            {i18n.t('modal.add_title')}
          </Text>
        </View>
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 11,
            backgroundColor: pressed ? colors.bgTertiary : colors.bgSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.separator,
          })}
        >
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount */}
        <Animated.View entering={FadeInUp.delay(80)}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 }}>
            {i18n.t('modal.amount_label')}
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 18,
            padding: 20,
            backgroundColor: colors.bgSecondary,
            borderWidth: 1.5,
            borderColor: amount ? `${colors.primary}40` : colors.separator,
            marginBottom: 22,
          }}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: colors.primary, marginRight: 4 }}>₺</Text>
            <TextInput
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0,00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              autoFocus
              style={{
                flex: 1,
                fontSize: 40,
                fontWeight: '800',
                color: colors.textPrimary,
                letterSpacing: -1,
              }}
            />
          </View>
        </Animated.View>

        {/* Category */}
        <Animated.View entering={FadeInUp.delay(160)}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 2 }}>
            {i18n.t('modal.category_label')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              const catColor = categoryConfig[cat].color;
              const catIcon = categoryConfig[cat].icon;
              return (
                <Pressable
                  key={cat}
                  onPress={() => handleCategorySelect(cat)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 14,
                    gap: 6,
                    backgroundColor: isSelected ? `${catColor}15` : colors.bgSecondary,
                    borderWidth: 1.5,
                    borderColor: isSelected ? catColor : colors.separator,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Ionicons name={catIcon as any} size={15} color={isSelected ? catColor : colors.textTertiary} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isSelected ? catColor : colors.textSecondary }}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInUp.delay(240)}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 }}>
            {i18n.t('modal.desc_label')}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={i18n.t('modal.desc_placeholder')}
            placeholderTextColor={colors.textTertiary}
            maxLength={100}
            style={{
              fontSize: 16,
              fontWeight: '600',
              padding: 18,
              borderRadius: 16,
              marginBottom: 32,
              color: colors.textPrimary,
              backgroundColor: colors.bgSecondary,
              borderWidth: 1,
              borderColor: description ? `${colors.primary}30` : colors.separator,
            }}
          />
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Save button */}
        <Animated.View entering={FadeInUp.delay(320)}>
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            style={({ pressed }) => ({
              borderRadius: 18,
              padding: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: selectedCat ? selectedCat.color : colors.primary,
              opacity: isSubmitting ? 0.6 : pressed ? 0.88 : 1,
              shadowColor: selectedCat ? selectedCat.color : colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 18,
              elevation: 10,
            })}
          >
            {!isSubmitting && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff' }}>
              {isSubmitting ? i18n.t('modal.saving_button') : i18n.t('modal.save_button')}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
