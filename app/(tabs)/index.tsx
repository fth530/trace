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
import { colors } from '@/lib/constants/design-tokens';
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
  if (hour < 12) return 'Günaydın 👋';
  if (hour < 18) return 'İyi günler 👋';
  return 'İyi akşamlar 👋';
};

const getFormattedDate = () => {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const getWeather = (todayTotal: number, dailyLimit: number) => {
  if (dailyLimit <= 0) return { icon: 'analytics-outline', label: 'Limit yok', color: colors.textSecondary, bg: colors.bgSecondary };
  const pct = (todayTotal / dailyLimit) * 100;
  if (pct >= 100) return { icon: 'thunderstorm-outline', label: 'Limit aşıldı', color: colors.danger, bg: `${colors.danger}15` };
  if (pct >= 80) return { icon: 'rainy-outline', label: 'Dikkat!', color: colors.warning, bg: `${colors.warning}15` };
  if (pct >= 50) return { icon: 'partly-sunny-outline', label: 'Orta', color: colors.warning, bg: `${colors.warning}10` };
  return { icon: 'sunny-outline', label: 'Harika', color: colors.success, bg: `${colors.success}12` };
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

  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState<Category>('Diğer');
  const [quickDesc, setQuickDesc] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const amountRef = useRef<TextInput>(null);

  useEffect(() => { init(); }, []);
  useEffect(() => { checkLimits(); }, [todayTotal, monthTotal, settings.daily_limit, settings.monthly_limit]);

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
    } finally { setRefreshing(false); }
  };

  const handleDelete = useCallback(async (id: number) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteExpense(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Delete failed:', error);
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
    } finally { setIsQuickAdding(false); }
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgPrimary }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dailyRemaining = settings.daily_limit > 0 ? settings.daily_limit - todayTotal : 0;
  const weather = getWeather(todayTotal, settings.daily_limit);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
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

      <Animated.View style={{ flex: 1 }} entering={FadeInDown.duration(350)}>
        <ExpenseList
          expenses={todayExpenses}
          onDelete={handleDelete}
          emptyMessage={i18n.t('home.empty_encouraging')}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />
          }
          ListHeaderComponent={
            <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 4 }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {getFormattedDate()}
                  </Text>
                  <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textPrimary }}>
                    {getGreeting()}
                  </Text>
                </View>

                {/* Weather badge */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 14,
                  backgroundColor: weather.bg,
                  borderWidth: 1,
                  borderColor: `${weather.color}20`,
                  gap: 6,
                }}>
                  <Ionicons name={weather.icon as any} size={16} color={weather.color} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: weather.color }}>
                    {weather.label}
                  </Text>
                </View>
              </View>

              {/* Daily Total Card */}
              <DailyTotal amount={todayTotal} limit={settings.daily_limit} isToday={true} />

              {/* Stats Row */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <View style={{
                  flex: 1,
                  borderRadius: 16,
                  padding: 14,
                  backgroundColor: colors.bgSecondary,
                  borderWidth: 1,
                  borderColor: colors.separator,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                    <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary }}>AYLIK</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
                    {formatCurrency(monthTotal)}
                  </Text>
                </View>

                {settings.daily_limit > 0 && (
                  <View style={{
                    flex: 1,
                    borderRadius: 16,
                    padding: 14,
                    backgroundColor: colors.bgSecondary,
                    borderWidth: 1,
                    borderColor: colors.separator,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                      <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: dailyRemaining >= 0 ? `${colors.success}15` : `${colors.danger}15`, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="wallet-outline" size={13} color={dailyRemaining >= 0 ? colors.success : colors.danger} />
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary }}>KALAN</Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: dailyRemaining >= 0 ? colors.success : colors.danger }}>
                      {formatCurrency(Math.abs(dailyRemaining))}
                    </Text>
                  </View>
                )}
              </View>

              {/* Limit Progress */}
              <View style={{ marginBottom: 14 }}>
                <LimitProgress current={todayTotal} limit={settings.daily_limit} type="daily" />
                <LimitProgress current={monthTotal} limit={settings.monthly_limit} type="monthly" />
              </View>

              {/* Quick Add */}
              {!showQuickAdd ? (
                <Pressable
                  onPress={() => { setShowQuickAdd(true); setTimeout(() => amountRef.current?.focus(), 100); }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 18,
                    backgroundColor: pressed ? colors.bgTertiary : colors.bgSecondary,
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: `${colors.primary}35`,
                    gap: 10,
                  })}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="flash" size={16} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                    Hızlı harcama ekle...
                  </Text>
                </Pressable>
              ) : (
                <View style={{
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 18,
                  backgroundColor: colors.bgSecondary,
                  borderWidth: 1,
                  borderColor: `${colors.primary}25`,
                }}>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                    <TextInput
                      ref={amountRef}
                      value={quickAmount}
                      onChangeText={handleAmountChange}
                      placeholder="0,00"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="decimal-pad"
                      style={{
                        flex: 1,
                        fontSize: 22,
                        fontWeight: '800',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        color: colors.textPrimary,
                        backgroundColor: colors.bgTertiary,
                      }}
                    />
                    <TextInput
                      value={quickDesc}
                      onChangeText={setQuickDesc}
                      placeholder="Açıklama"
                      placeholderTextColor={colors.textTertiary}
                      style={{
                        flex: 1.6,
                        fontSize: 14,
                        fontWeight: '500',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        color: colors.textPrimary,
                        backgroundColor: colors.bgTertiary,
                      }}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                      {CATEGORIES.slice(0, 5).map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => { setQuickCategory(cat); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 10,
                            backgroundColor: quickCategory === cat ? `${categoryConfig[cat].color}20` : colors.bgTertiary,
                            borderWidth: 1,
                            borderColor: quickCategory === cat ? categoryConfig[cat].color : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '700', color: quickCategory === cat ? categoryConfig[cat].color : colors.textTertiary }}>
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8, marginLeft: 10 }}>
                      <Pressable
                        onPress={() => { setShowQuickAdd(false); setQuickAmount(''); setQuickDesc(''); Keyboard.dismiss(); }}
                        style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: colors.bgTertiary, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Ionicons name="close" size={18} color={colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        onPress={handleQuickAdd}
                        disabled={isQuickAdding || !quickAmount}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 11,
                          backgroundColor: quickAmount ? colors.primary : colors.bgTertiary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: isQuickAdding ? 0.5 : 1,
                        }}
                      >
                        <Ionicons name="checkmark" size={18} color={quickAmount ? '#fff' : colors.textTertiary} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}

              {/* Section title */}
              {todayExpenses.length > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>
                    Bugünkü Harcamalar
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary }}>
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
        style={{ position: 'absolute', bottom: insets.bottom + 82, right: 20, zIndex: 10 }}
      >
        <Pressable
          onPress={handleAddExpense}
          style={({ pressed }) => ({
            width: 58,
            height: 58,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            opacity: pressed ? 0.85 : 1,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.55,
            shadowRadius: 20,
            elevation: 12,
          })}
          accessibilityRole="button"
          accessibilityLabel="Harcama ekle"
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </Animated.View>
    </View>
  );
}
