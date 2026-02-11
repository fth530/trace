// Add Expense Modal
// Based on ROADMAP §6.2 Add Expense Modal Specification

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, Category } from '@/lib/constants/categories';
import { validateDecimal, parseCurrency } from '@/lib/utils/currency';

export default function AddExpenseModal() {
  const { addExpense } = useStore();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (text: string) => {
    // Remove non-numeric characters except dot and comma
    const cleaned = text.replace(/[^\d.,]/g, '');
    
    // Replace comma with dot
    const normalized = cleaned.replace(',', '.');
    
    // Validate decimal places (max 2)
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
    // Validate amount
    const parsedAmount = parseCurrency(amount);
    
    if (parsedAmount === 0) {
      return 'Geçerli bir tutar girin';
    }

    // Edge case: Amount > 1,000,000
    if (parsedAmount > 1_000_000) {
      return 'confirm_large_amount';
    }

    // Validate description
    if (description.trim() === '') {
      return 'Açıklama gereklidir';
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();

    if (error === 'confirm_large_amount') {
      Alert.alert(
        'Emin misiniz?',
        'Çok büyük bir tutar girdiniz. Devam etmek istiyor musunuz?',
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Devam Et',
            onPress: () => submitExpense(),
          },
        ]
      );
      return;
    }

    if (error) {
      Alert.alert('Hata', error);
      return;
    }

    await submitExpense();
  };

  const submitExpense = async () => {
    setIsSubmitting(true);

    try {
      const parsedAmount = parseCurrency(amount);

      await addExpense({
        amount: parsedAmount,
        category,
        description: description.trim(),
        date: '', // Will be set by store
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Add expense failed:', error);
      Alert.alert('Hata', 'Harcama eklenirken bir hata oluştu');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Harcama Ekle</Text>
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
        >
          <Ionicons name="close" size={24} color={colors.text.primary.dark} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Amount Input */}
        <View style={styles.section}>
          <Input
            label="Tutar (₺)"
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kategori (Opsiyonel)</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => handleCategorySelect(cat)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                  pressed && styles.categoryChipPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Kategori: ${cat}`}
                accessibilityState={{ selected: category === cat }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Input
            label="Açıklama"
            value={description}
            onChangeText={setDescription}
            placeholder="Ne için harcadın?"
            maxLength={100}
          />
        </View>

        {/* Save Button */}
        <Button
          label={isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          onPress={handleSave}
          variant="primary"
          disabled={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    color: colors.text.primary.dark,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  closeButtonPressed: {
    backgroundColor: colors.surface.dark,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: colors.text.primary.dark,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.dark,
    borderWidth: 1,
    borderColor: colors.text.tertiary.dark,
  },
  categoryChipSelected: {
    backgroundColor: colors.accent.dark,
    borderColor: colors.accent.dark,
  },
  categoryChipPressed: {
    opacity: 0.7,
  },
  categoryChipText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary.dark,
  },
  categoryChipTextSelected: {
    fontWeight: typography.headline.fontWeight,
  },
});
