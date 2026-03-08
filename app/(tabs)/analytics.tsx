// S-Class Analytics Screen
// Based on Antigravity Protocol

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useStore } from '@/lib/store';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '@/lib/utils/currency';
import { CategorySummary } from '@/lib/store/types';
import { categoryConfig, Category } from '@/lib/constants/categories';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import Animated, { FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { i18n } from '@/lib/translations/i18n';
import {
  gradients,
  gradientLocations,
  neonColors,
  neonShadow,
} from '@/lib/constants/design-tokens';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const AnimatedProgressBar = ({ barWidth, color, delay = 0 }: { barWidth: number, color: string, delay: number }) => {
  const widthResult = useSharedValue(0);

  useEffect(() => {
    widthResult.value = withDelay(delay, withSpring(barWidth, { damping: 14, stiffness: 90 }));
  }, [barWidth, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, widthResult.value)}%`,
  }));

  return (
    <Animated.View
      className="h-full rounded-full"
      style={[
        animatedStyle,
        {
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 15,
          elevation: 8,
        }
      ]}
    />
  );
};

export default function AnalyticsScreen() {
  const { monthTotal, loadMonthCategoryData } = useStore();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await loadMonthCategoryData();
    setCategories(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const maxTotal =
    categories.length > 0 ? Math.max(...categories.map((c) => c.total)) : 1;

  return (
    <View className="flex-1 bg-black">
      {/* S-Class Antigravity Background Glow */}
      <View className="absolute top-0 w-full h-full opacity-40 pointer-events-none">
        <LinearGradient
          colors={gradients.main}
          locations={gradientLocations.main}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <Animated.ScrollView
        entering={FadeInDown.duration(800).springify().damping(16).stiffness(120)}
        contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={neonColors.cyan}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Total Spending Glass Card */}
        <View
          className="items-center justify-center py-10 mb-10 rounded-[32px] border border-white/5 bg-black/80 backdrop-blur-xl"
          style={neonShadow(neonColors.cyan, 'lg')}
        >
          <Text className="text-slate-400 font-bold tracking-widest uppercase mb-3 text-xs">
            {i18n.t('analytics.month_total')}
          </Text>
          <Text
            className="text-white text-5xl font-black tracking-tighter"
            style={{
              textShadowColor: neonColors.cyan,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 20,
            }}
          >
            {formatCurrency(monthTotal)}
          </Text>
        </View>

        <Text className="text-white text-xl font-black mb-6 tracking-wide px-2">
          {i18n.t('analytics.category_title')}
        </Text>

        {/* Category Progress Bars */}
        {categories.length === 0 ? (
          <EmptyState
            message={i18n.t('empty.title')}
            subMessage={i18n.t('analytics.empty')}
            icon="pie-chart-outline"
          />
        ) : (
          categories.map((item, index) => {
            const catName =
              (item.category as Category) || ('Diğer' as Category);
            const config = categoryConfig[catName] || {
              icon: 'cube-outline',
              label: catName,
              color: neonColors.slateDark,
            };
            const percentage = (item.total / monthTotal) * 100;
            const barWidth = (item.total / maxTotal) * 100;

            return (
              <Animated.View
                entering={FadeInRight.delay(index * 100).springify().damping(14)}
                key={index}
                className="mb-6 px-2"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-4 border border-white/5"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Ionicons
                        name={config.icon as any}
                        size={18}
                        color={config.color}
                      />
                    </View>
                    <Text className="text-white font-bold tracking-wide text-[15px]">
                      {config.label}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-black text-[15px] tracking-tight">
                      {formatCurrency(item.total)}
                    </Text>
                    <Text className="text-slate-400 text-[11px] font-bold tracking-wider mt-0.5 uppercase">
                      {percentage.toFixed(1)}% ({item.count}{' '}
                      {i18n.t('analytics.transaction_count')})
                    </Text>
                  </View>
                </View>

                {/* S-Class Neon Progress Bar */}
                <View className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <AnimatedProgressBar barWidth={barWidth} color={config.color} delay={index * 100} />
                </View>
              </Animated.View>
            );
          })
        )}
      </Animated.ScrollView>
    </View>
  );
}
