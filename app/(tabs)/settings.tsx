// Settings Screen (Ayarlar)
// Based on ROADMAP §6.5 Settings Screen Specification

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/lib/constants/spacing';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';

export default function SettingsScreen() {
  const store = useStore();
  const { settings, updateSetting, clearAllData } = store;
  
  const [dailyLimit, setDailyLimit] = useState(settings.daily_limit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(settings.monthly_limit.toString());
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(settings.theme);
  
  const dailyTimeoutRef = useRef<NodeJS.Timeout>();
  const monthlyTimeoutRef = useRef<NodeJS.Timeout>();

  // Update local state when store changes
  useEffect(() => {
    setDailyLimit(settings.daily_limit.toString());
    setMonthlyLimit(settings.monthly_limit.toString());
    setTheme(settings.theme);
  }, [settings.daily_limit, settings.monthly_limit, settings.theme]);

  // Debounced save for daily limit (500ms)
  const handleDailyLimitChange = (value: string) => {
    setDailyLimit(value);
    
    if (dailyTimeoutRef.current) {
      clearTimeout(dailyTimeoutRef.current);
    }
    
    dailyTimeoutRef.current = setTimeout(() => {
      const numValue = parseFloat(value) || 0;
      if (numValue >= 0) {
        updateSetting('daily_limit', numValue.toString());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 500);
  };

  // Debounced save for monthly limit (500ms)
  const handleMonthlyLimitChange = (value: string) => {
    setMonthlyLimit(value);
    
    if (monthlyTimeoutRef.current) {
      clearTimeout(monthlyTimeoutRef.current);
    }
    
    monthlyTimeoutRef.current = setTimeout(() => {
      const numValue = parseFloat(value) || 0;
      if (numValue >= 0) {
        updateSetting('monthly_limit', numValue.toString());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 500);
  };

  // Immediate save for theme
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    updateSetting('theme', newTheme);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Clear all data with confirmation
  const handleClearData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Başarılı', 'Tüm veriler silindi');
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Hata', 'Veriler silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dailyTimeoutRef.current) clearTimeout(dailyTimeoutRef.current);
      if (monthlyTimeoutRef.current) clearTimeout(monthlyTimeoutRef.current);
    };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Limits Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Limitler</Text>
        <Card>
          <View style={styles.cardContent}>
            <Input
              label="Günlük Limit (₺)"
              value={dailyLimit}
              onChangeText={handleDailyLimitChange}
              keyboardType="numeric"
              placeholder="500"
            />
            <View style={styles.inputSpacer} />
            <Input
              label="Aylık Limit (₺)"
              value={monthlyLimit}
              onChangeText={handleMonthlyLimitChange}
              keyboardType="numeric"
              placeholder="10000"
            />
          </View>
        </Card>
        <Text style={styles.hint}>
          Limit 0 olarak ayarlanırsa limit kontrolü devre dışı kalır
        </Text>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tema</Text>
        <Card>
          <View style={styles.cardContent}>
            <View style={styles.themeButtons}>
              <Button
                label="Açık"
                onPress={() => handleThemeChange('light')}
                variant={theme === 'light' ? 'primary' : 'secondary'}
              />
              <View style={styles.buttonSpacer} />
              <Button
                label="Koyu"
                onPress={() => handleThemeChange('dark')}
                variant={theme === 'dark' ? 'primary' : 'secondary'}
              />
              <View style={styles.buttonSpacer} />
              <Button
                label="Otomatik"
                onPress={() => handleThemeChange('auto')}
                variant={theme === 'auto' ? 'primary' : 'secondary'}
              />
            </View>
          </View>
        </Card>
        <Text style={styles.hint}>
          Otomatik mod sistem temasını takip eder
        </Text>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tehlikeli Bölge</Text>
        <Button
          label="Tüm Verileri Sil"
          onPress={handleClearData}
          variant="danger"
        />
      </View>

      {/* Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Trace v1.0.0</Text>
        <Text style={styles.versionSubtext}>
          "Ben muhasebeci değilim, sadece bugün ne kadar gitti onu bilmek istiyorum."
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: colors.text.primary.dark,
    marginBottom: spacing.sm,
  },
  cardContent: {
    padding: spacing.sm,
  },
  inputSpacer: {
    height: spacing.md,
  },
  hint: {
    fontSize: typography.caption.fontSize,
    color: colors.text.tertiary.dark,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSpacer: {
    width: spacing.xs,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  versionText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: colors.text.secondary.dark,
    marginBottom: spacing.xs / 2,
  },
  versionSubtext: {
    fontSize: typography.caption.fontSize,
    color: colors.text.tertiary.dark,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: spacing.lg,
  },
});
