// Home Screen (Bugün)
// Based on ROADMAP §6.1 Home Screen Specification & Antigravity Final Protocol

import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useStore } from "@/lib/store";
import { DailyTotal } from "@/components/expense/DailyTotal";
import { ExpenseList } from "@/components/expense/ExpenseList";
import { LimitProgress } from "@/components/limit/LimitProgress";
import { LimitBanner } from "@/components/limit/LimitBanner";
import { getLimitStatus } from "@/lib/utils/limits";

import { logger } from "@/lib/utils/logger";
import { LinearGradient } from "expo-linear-gradient";
import { i18n } from "@/lib/translations/i18n";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const {
    todayExpenses,
    todayTotal,
    monthTotal,
    settings,
    isLoading,
    init,
    deleteExpense,
  } = useStore();


  const [refreshing, setRefreshing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerData, setBannerData] = useState<{
    percentage: number;
    type: "daily" | "monthly";
    limit: number;
    message: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    checkLimits();
  }, [todayTotal, monthTotal, settings.daily_limit, settings.monthly_limit]);

  const checkLimits = () => {
    const dailyStatus = getLimitStatus(
      todayTotal,
      settings.daily_limit,
      "daily",
      'dark',
    );

    if (dailyStatus.shouldShowBanner) {
      setBannerData({
        percentage: dailyStatus.percentage,
        type: "daily",
        limit: settings.daily_limit,
        message: dailyStatus.message || "",
        color: dailyStatus.color,
      });
      setShowBanner(true);
      return;
    }

    const monthlyStatus = getLimitStatus(
      monthTotal,
      settings.monthly_limit,
      "monthly",
      'dark',
    );

    if (monthlyStatus.shouldShowBanner) {
      setBannerData({
        percentage: monthlyStatus.percentage,
        type: "monthly",
        limit: settings.monthly_limit,
        message: monthlyStatus.message || "",
        color: monthlyStatus.color,
      });
      setShowBanner(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await init();
    } catch (error) {
      logger.error("Refresh failed:", error);
      Alert.alert(i18n.t('common.error'), i18n.t('home.refresh_error'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteExpense(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error("Delete failed:", error);
      Alert.alert(i18n.t('common.error'), i18n.t('home.delete_error'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/modal/add-expense");
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Background Glow */}
      <View className="absolute top-0 w-full h-80 opacity-40">
        <LinearGradient
          colors={["#5925f480", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

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

      {/* Main List - Replaces ScrollView for better performance */}
      <ExpenseList
        expenses={todayExpenses}
        onDelete={handleDelete}
        emptyMessage={i18n.t('home.empty')}
        ListHeaderComponent={
          <View>
            <DailyTotal
              amount={todayTotal}
              limit={settings.daily_limit}
              isToday={true}
            />

            <View className="mb-6 px-4">
              <LimitProgress
                current={todayTotal}
                limit={settings.daily_limit}
                type="daily"
              />
              <LimitProgress
                current={monthTotal}
                limit={settings.monthly_limit}
                type="monthly"
              />
            </View>
          </View>
        }
      />

      <Pressable
        onPress={handleAddExpense}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center border border-white/20 shadow-2xl active:scale-95 transition-all outline-none"
        style={{
          shadowColor: "#f4258c", // Neon pink glow
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.8,
          shadowRadius: 20,
          elevation: 15,
        }}
        accessibilityRole="button"
        accessibilityLabel={i18n.t('common.add_label')}
      >
        {/* FAB Glass Gradient */}
        <LinearGradient
          colors={["#FCA5A5", "#f4258c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 32,
            opacity: 0.9,
          }}
        />
        <Ionicons name="add" size={36} color="white" />
      </Pressable>
    </View>
  );
}
