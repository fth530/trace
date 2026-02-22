import { View, Text } from "react-native";
import { formatCurrency } from "@/lib/utils/currency";

interface PeriodSummaryProps {
  weeklyTotal: number;
  monthlyTotal: number;
}

export function PeriodSummary({
  weeklyTotal,
  monthlyTotal,
}: PeriodSummaryProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0">
      {/* Glassmorphic Panel */}
      <View className="bg-black/60 backdrop-blur-2xl border-t border-white/10 px-4 py-8 pointer-events-none">
        <View className="flex-row justify-around items-center">

          <View className="items-center">
            <Text className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-1">
              Son 7 Gün
            </Text>
            <Text className="text-white text-2xl font-black">
              {formatCurrency(weeklyTotal)}
            </Text>
          </View>

          <View className="w-px h-10 bg-white/10" />

          <View className="items-center">
            <Text className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-1">
              Bu Ay
            </Text>
            <Text className="text-white text-2xl font-black">
              {formatCurrency(monthlyTotal)}
            </Text>
          </View>

        </View>
      </View>
    </View>
  );
}
