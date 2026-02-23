import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useStore } from '@/lib/store';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '@/lib/utils/currency';
import { CategorySummary } from '@/lib/store/types';
import { categoryConfig, Category } from '@/lib/constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { i18n } from '@/lib/translations/i18n';
import { gradients, gradientLocations, neonColors, neonShadow } from '@/lib/constants/design-tokens';

const { width } = Dimensions.get('window');

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
        }, [])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const maxTotal = categories.length > 0 ? Math.max(...categories.map(c => c.total)) : 1;

    return (
        <View className="flex-1 bg-zinc-950">
            {/* Universal Antigravity Background Glow */}
            <View className="absolute top-0 w-full h-full opacity-20 pointer-events-none">
                <LinearGradient
                    colors={gradients.main}
                    locations={gradientLocations.main}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ flex: 1 }}
                />
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={neonColors.fuchsia} />
                }
            >
                {/* Total Spending Glass Card */}
                <View
                    className="items-center justify-center p-8 mb-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl"
                    style={neonShadow(neonColors.purple, 'md')}
                >
                    <Text className="text-slate-400 font-medium tracking-widest uppercase mb-2">
                        {i18n.t('analytics.month_total')}
                    </Text>
                    <Text className="text-white text-5xl font-black tracking-tight" style={{ textShadowColor: neonColors.purple, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>
                        {formatCurrency(monthTotal)}
                    </Text>
                </View>

                <Text className="text-white text-xl font-bold mb-6 tracking-wide px-2">{i18n.t('analytics.category_title')}</Text>

                {/* Category Progress Bars */}
                {
                    categories.length === 0 ? (
                        <View className="items-center justify-center py-10">
                            <Text className="text-slate-500 font-medium">{i18n.t('analytics.empty')}</Text>
                        </View>
                    ) : (
                        categories.map((item, index) => {
                            const catName = item.category as Category || 'Diğer' as Category;
                            const config = categoryConfig[catName] || { icon: 'cube-outline', label: catName, color: neonColors.slate };
                            const percentage = (item.total / monthTotal) * 100;
                            const barWidth = (item.total / maxTotal) * 100;

                            return (
                                <View key={index} className="mb-6 px-2">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center flex-1">
                                            <View
                                                className="w-8 h-8 rounded-full items-center justify-center mr-3 border border-white/10"
                                                style={{ backgroundColor: `${config.color}20` }}
                                            >
                                                <Ionicons name={config.icon as any} size={16} color={config.color} />
                                            </View>
                                            <Text className="text-white font-semibold text-base">{config.label}</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-white font-bold text-base">{formatCurrency(item.total)}</Text>
                                            <Text className="text-slate-400 text-xs font-medium">{percentage.toFixed(1)}% ({item.count} {i18n.t('analytics.transaction_count')})</Text>
                                        </View>
                                    </View>

                                    {/* Neon Progress Bar */}
                                    <View className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <View
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${barWidth}%`,
                                                backgroundColor: config.color,
                                                shadowColor: config.color,
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.8,
                                                shadowRadius: 10,
                                                elevation: 5
                                            }}
                                        />
                                    </View>
                                </View>
                            );
                        })
                    )
                }
            </ScrollView >
        </View >
    );
}
