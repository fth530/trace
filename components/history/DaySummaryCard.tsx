import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDateRelative } from "@/lib/utils/date";

interface DaySummaryCardProps {
  date: string;
  total: number;
  count: number;
}

export function DaySummaryCard({ date, total, count }: DaySummaryCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/history/${date}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="mb-4 rounded-3xl overflow-hidden border border-white/5 active:scale-95 transition-all outline-none"
      style={{
        shadowColor: '#0ea5e9', // Cyber/Neon blue subtle shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${formatDateRelative(date)} günü, ${count} harcama, toplam ${formatCurrency(total)}`}
      accessibilityHint="Günün detaylarını görmek için dokunun"
    >
      <View className="bg-slate-900/60 backdrop-blur-xl p-5 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1 tracking-wide">
            {formatDateRelative(date)}
          </Text>
          <Text className="text-slate-400 text-sm font-medium">
            {count} Harcama
          </Text>
        </View>
        <Text className="text-sky-400 text-xl font-black drop-shadow-md">
          {formatCurrency(total)}
        </Text>
      </View>
    </Pressable>
  );
}
