import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';
import { DailyTotal } from '@/components/expense/DailyTotal';
import { ExpenseList } from '@/components/expense/ExpenseList';
import { LimitProgress } from '@/components/limit/LimitProgress';
import { LimitBanner } from '@/components/limit/LimitBanner';
import { getLimitStatus } from '@/lib/utils/limits';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { logger } from '@/lib/utils/logger';
import { i18n } from '@/lib/translations/i18n';
import { colors, shadow } from '@/lib/constants/design-tokens';
import { formatCurrency } from '@/lib/utils/currency';
import { CATEGORIES, Category, categoryConfig } from '@/lib/constants/categories';
import { validateDecimal, parseCurrency } from '@/lib/utils/currency';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
};

const getFormattedDate = () => {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const getWeather = (todayTotal: number, dailyLimit: number) => {
  if (dailyLimit <= 0) return { icon: 'sunny-outline', label: 'Limit belirleyin', color: colors.textSecondary, bg: colors.bgSecondary };
  const pct = (todayTotal / dailyLimit) * 100;
  if (pct >= 100) return { icon: 'thunderstorm-outline', label: 'Limit aşıldı!', color: colors.danger, bg: `${colors.danger}12` };
  if (pct >= 80) return { icon: 'rainy-outline', label: 'Dikkatli olun', color: colors.warning, bg: `${colors.warning}12` };
  if (pct >= 50) return { icon: 'partly-sunny-outline', label: 'Orta seviye', color: colors.warning, bg: `${colors.warning}10` };
  return { icon: 'sunny-outline', label: 'İyi gidiyorsunuz', color: colors.success, bg: `${colors.success}12` };
};

export default function HomeScreen() {
  const {
    todayExpenses,
    todayTotal,
    monthTotal,
    settings,
    isLoading,
    init,
    deleteExpense,
    addExpense,
  } = useStore();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerData, setBannerData] = useState<{
    percentage: number;
    type: 'daily' | 'monthly';
    limit: number;
    message: string;
    color: string;
  } | null>(null);

  // Quick Add state
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState<Category>('Diğer');
  const [quickDesc, setQuickDesc] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    checkLimits();
  }, [todayTotal, monthTotal, settings.daily_limit, settings.monthly_limit]);

  const checkLimits = () => {
    const dailyStatus = getLimitStatus(todayTotal, settings.daily_limit, 'daily', 'dark');
    if (dailyStatus.shouldShowBanner) {
      setBannerData({ percentage: dailyStatus.percentage, type: 'daily', limit: settings.daily_limit, message: dailyStatus.message || '', color: dailyStatus.color });
      setShowBanner(true);
      return;
    }
    const monthlyStatus = getLimitStatus(monthTotal, settings.monthly_limit, 'monthly', 'dark');
    if (monthlyStatus.shouldShowBanner) {
      setBannerData({ percentage: monthlyStatus.percentage, type: 'monthly', limit: settings.monthly_limit, message: monthlyStatus.message || '', color: monthlyStatus.color });
      setShowBanner(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try { await init(); } catch (error) {
      logger.error('Refresh failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('home.refresh_error'));
    } finally { setRefreshing(false); }
  };

  const handleDelete = useCallback(async (id: number) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteExpense(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Delete failed:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('home.delete_error'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [deleteExpense]);

  const handleQuickAdd = async () => {
    const amount = parseCurrency(quickAmount);
    if (amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setIsQuickAdding(true);
    try {
      await addExpense({
        amount,
        category: quickCategory,
        description: quickDesc.trim() || categoryConfig[quickCategory].label,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setQuickAmount('');
      setQuickDesc('');
      setShowQuickAdd(false);
      Keyboard.dismiss();
    } catch (error) {
      logger.error('Quick add failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^\d.,]/g, '');
    const normalized = cleaned.replace(',', '.');
    if (normalized === '' || validateDecimal(normalized)) {
      setQuickAmount(normalized);
    }
  };

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/modal/add-expense');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dailyRemaining = settings.daily_limit > 0 ? settings.daily_limit - todayTotal : 0;
  const weather = getWeather(todayTotal, settings.daily_limit);

  return (
    <View className="flex-1 bg-black">
      {showBanner && bannerData && (
        <LimitBanner
          percentage={bannerData.percentage}
          type={bannerData.type}
          limit={bannerData.limit}
          message={bannerData.message}
          color={bannerData.color}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <Animated.View
        style={{ flex: 1 }}
        entering={FadeInDown.duration(350)}
      >
        <ExpenseList
          expenses={todayExpenses}
          onDelete={handleDelete}
          emptyMessage={i18n.t('home.empty_encouraging')}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />
          }
          ListHeaderComponent={
            <View style={{ paddingTop: insets.top + 8 }}>
              {/* Header */}
              <View className="flex-row justify-between items-start px-2 mb-2">
                <View>
                  <Text className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                    {getFormattedDate()}
                  </Text>
                  <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                    {getGreeting()}
                  </Text>
                </View>
                {/* Weather Badge */}
                <Pressable
                  className="flex-row items-center px-3 py-2 rounded-xl mt-1"
                  style={{ backgroundColor: weather.bg }}
                >
                  <Ionicons name={weather.icon as any} size={16} color={weather.color} />
                  <Text className="text-xs font-semibold ml-1.5" style={{ color: weather.color }}>
                    {weather.label}
                  </Text>
                </Pressable>
              </View>

              {/* Daily Total Card */}
              <DailyTotal amount={todayTotal} limit={settings.daily_limit} isToday={true} />

              {/* Quick Stats Row */}
              <View className="flex-row gap-3 mb-5 px-1">
                <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.bgSecondary }}>
                  <View className="flex-row items-center mb-2">
                    <View className="w-7 h-7 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: `${colors.primary}15` }}>
                      <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                    </View>
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>Aylık</Text>
                  </View>
                  <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrency(monthTotal)}
                  </Text>
                </View>

                {settings.daily_limit > 0 && (
                  <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.bgSecondary }}>
                    <View className="flex-row items-center mb-2">
                      <View className="w-7 h-7 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: dailyRemaining >= 0 ? `${colors.success}15` : `${colors.danger}15` }}>
                        <Ionicons name="wallet-outline" size={14} color={dailyRemaining >= 0 ? colors.success : colors.danger} />
                      </View>
                      <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>Kalan</Text>
                    </View>
                    <Text className="text-lg font-bold" style={{ color: dailyRemaining >= 0 ? colors.success : colors.danger }}>
                      {formatCurrency(Math.abs(dailyRemaining))}
                    </Text>
                  </View>
                )}
              </View>

              {/* Limit Progress */}
              <View className="mb-4 px-1">
                <LimitProgress current={todayTotal} limit={settings.daily_limit} type="daily" />
                <LimitProgress current={monthTotal} limit={settings.monthly_limit} type="monthly" />
              </View>

              {/* Quick Add Section */}
              {!showQuickAdd ? (
                <Pressable
                  onPress={() => { setShowQuickAdd(true); setTimeout(() => amountRef.current?.focus(), 100); }}
                  className="flex-row items-center rounded-xl p-3.5 mb-5 mx-1"
                  style={{ backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.separator, borderStyle: 'dashed' }}
                >
                  <Ionicons name="flash-outline" size={18} color={colors.primary} />
                  <Text className="text-sm font-medium ml-2" style={{ color: colors.textSecondary }}>
                    Hızlı harcama ekle...
                  </Text>
                </Pressable>
              ) : (
                <View className="rounded-xl p-4 mb-5 mx-1" style={{ backgroundColor: colors.bgSecondary }}>
                  {/* Amount + Description Row */}
                  <View className="flex-row gap-2 mb-3">
                    <TextInput
                      ref={amountRef}
                      value={quickAmount}
                      onChangeText={handleAmountChange}
                      placeholder="0"
                      placeholderTextColor={colors.gray600}
                      keyboardType="decimal-pad"
                      className="flex-1 text-xl font-bold px-3 py-2.5 rounded-lg"
                      style={{ color: colors.textPrimary, backgroundColor: colors.bgTertiary }}
                    />
                    <TextInput
                      value={quickDesc}
                      onChangeText={setQuickDesc}
                      placeholder="Açıklama (opsiyonel)"
                      placeholderTextColor={colors.gray600}
                      className="flex-[2] text-sm font-medium px-3 py-2.5 rounded-lg"
                      style={{ color: colors.textPrimary, backgroundColor: colors.bgTertiary }}
                    />
                  </View>

                  {/* Category chips + Save */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row gap-1.5 flex-1 flex-wrap">
                      {CATEGORIES.map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => { setQuickCategory(cat); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                          className="px-3 py-1.5 rounded-lg"
                          style={{
                            backgroundColor: quickCategory === cat ? `${categoryConfig[cat].color}20` : colors.bgTertiary,
                            borderWidth: 1,
                            borderColor: quickCategory === cat ? categoryConfig[cat].color : 'transparent',
                          }}
                        >
                          <Text className="text-xs font-semibold" style={{ color: quickCategory === cat ? categoryConfig[cat].color : colors.textSecondary }}>
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <View className="flex-row gap-2 ml-2">
                      <Pressable
                        onPress={() => { setShowQuickAdd(false); setQuickAmount(''); setQuickDesc(''); Keyboard.dismiss(); }}
                        className="w-9 h-9 rounded-lg items-center justify-center"
                        style={{ backgroundColor: colors.bgTertiary }}
                      >
                        <Ionicons name="close" size={18} color={colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        onPress={handleQuickAdd}
                        disabled={isQuickAdding || !quickAmount}
                        className="w-9 h-9 rounded-lg items-center justify-center"
                        style={{ backgroundColor: quickAmount ? colors.primary : colors.bgTertiary, opacity: isQuickAdding ? 0.5 : 1 }}
                      >
                        <Ionicons name="checkmark" size={18} color={quickAmount ? colors.white : colors.textTertiary} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}

              {/* Section title */}
              {todayExpenses.length > 0 && (
                <View className="flex-row justify-between items-center mb-3 px-1">
                  <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                    Bugünkü Harcamalar
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    {todayExpenses.length} işlem
                  </Text>
                </View>
              )}
            </View>
          }
        />
      </Animated.View>

      {/* FAB */}
      <Animated.View
        entering={FadeInDown.delay(200)}
        style={{ position: 'absolute', bottom: insets.bottom + 80, right: 20, zIndex: 10 }}
      >
        <Pressable
          onPress={handleAddExpense}
          className="w-14 h-14 rounded-full items-center justify-center active:scale-95"
          style={{ backgroundColor: colors.primary, ...shadow('lg') }}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('common.add_label')}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
