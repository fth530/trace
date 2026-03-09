import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/design-tokens';
import { formatCurrency } from '@/lib/utils/currency';
import type { DaySummary } from '@/lib/store/types';

interface SpendingCalendarProps {
  data: DaySummary[];
  dailyLimit: number;
}

const WEEKDAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

export function SpendingCalendar({ data, dailyLimit }: SpendingCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());
  const [viewYear, setViewYear] = React.useState(today.getFullYear());

  const dataMap = useMemo(() => {
    const map: Record<string, DaySummary> = {};
    data.forEach((d) => { map[d.date] = d; });
    return map;
  }, [data]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    // Pad to complete weeks
    while (days.length % 7 !== 0) days.push(null);

    return days;
  }, [viewMonth, viewYear]);

  const getDayColor = (total: number) => {
    if (total === 0) return 'transparent';
    if (dailyLimit <= 0) {
      if (total > 500) return `${colors.danger}40`;
      if (total > 200) return `${colors.warning}35`;
      return `${colors.success}30`;
    }
    const pct = (total / dailyLimit) * 100;
    if (pct >= 100) return `${colors.danger}45`;
    if (pct >= 70) return `${colors.warning}40`;
    if (pct >= 30) return `${colors.success}35`;
    return `${colors.success}20`;
  };

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const goToNext = () => {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  // Monthly stats
  const monthStats = useMemo(() => {
    let total = 0;
    let count = 0;
    let maxDay = 0;
    calendarDays.forEach((day) => {
      if (!day) return;
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = dataMap[dateStr];
      if (entry) {
        total += entry.total;
        count += entry.count;
        if (entry.total > maxDay) maxDay = entry.total;
      }
    });
    return { total, count, maxDay };
  }, [calendarDays, dataMap, viewYear, viewMonth]);

  return (
    <View className="rounded-2xl p-4 mb-5" style={{ backgroundColor: colors.bgSecondary }}>
      {/* Month Navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={goToPrev} className="p-1.5 rounded-lg active:opacity-50" style={{ backgroundColor: colors.bgTertiary }}>
          <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <Text className="text-base font-bold capitalize" style={{ color: colors.textPrimary }}>
          {monthName}
        </Text>
        <Pressable
          onPress={goToNext}
          className="p-1.5 rounded-lg active:opacity-50"
          style={{ backgroundColor: colors.bgTertiary, opacity: isCurrentMonth ? 0.3 : 1 }}
          disabled={isCurrentMonth}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Weekday Headers */}
      <View className="flex-row mb-2">
        {WEEKDAYS.map((d) => (
          <View key={d} className="flex-1 items-center">
            <Text className="text-[10px] font-semibold" style={{ color: colors.textTertiary }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
          }

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = dataMap[dateStr];
          const total = entry?.total || 0;
          const isToday = dateStr === todayStr;
          const bgColor = getDayColor(total);

          return (
            <View key={dateStr} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
              <View
                className="flex-1 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: bgColor,
                  borderWidth: isToday ? 1.5 : 0,
                  borderColor: isToday ? colors.primary : 'transparent',
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: isToday ? colors.primary : total > 0 ? colors.textPrimary : colors.textTertiary }}
                >
                  {day}
                </Text>
                {total > 0 && (
                  <Text className="text-[8px] font-bold mt-0.5" style={{ color: colors.textSecondary }}>
                    {total >= 1000 ? `${(total / 1000).toFixed(0)}K` : Math.round(total)}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Month Summary */}
      {monthStats.total > 0 && (
        <View className="flex-row mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.separatorLight }}>
          <View className="flex-1 items-center">
            <Text className="text-[10px] font-semibold uppercase" style={{ color: colors.textTertiary }}>Toplam</Text>
            <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(monthStats.total)}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[10px] font-semibold uppercase" style={{ color: colors.textTertiary }}>İşlem</Text>
            <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>{monthStats.count}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[10px] font-semibold uppercase" style={{ color: colors.textTertiary }}>En Çok</Text>
            <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(monthStats.maxDay)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
