import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '@/lib/utils/currency';
import { colors } from '@/lib/constants/design-tokens';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface DailyTotalProps {
  amount: number;
  limit: number;
  isToday: boolean;
}

export const DailyTotal: React.FC<DailyTotalProps> = ({ amount, limit, isToday }) => {
  const isOverLimit = limit > 0 && amount > limit;
  const isWarning = limit > 0 && amount > limit * 0.8 && !isOverLimit;
  const percentage = limit > 0 ? Math.min((amount / limit) * 100, 100) : 0;
  const remaining = limit > 0 ? limit - amount : 0;

  let accentColor = '#7C6FFF';
  let accentLight = '#9B8FFF';
  let statusIcon: any = 'checkmark-circle';
  let statusText = 'Her şey yolunda';
  let cardGradient: [string, string, string] = ['#1C1645', '#141130', '#0D0D12'];

  if (isOverLimit) {
    accentColor = '#FF4D6A';
    accentLight = '#FF7A8A';
    statusIcon = 'warning';
    statusText = 'Limit aşıldı!';
    cardGradient = ['#2A0F15', '#1A0A0E', '#0D0D12'];
  } else if (isWarning) {
    accentColor = '#FF9F43';
    accentLight = '#FFBE7A';
    statusIcon = 'alert-circle';
    statusText = 'Limite yaklaşıyorsunuz';
    cardGradient = ['#1E1200', '#150D00', '#0D0D12'];
  } else if (limit === 0) {
    statusText = 'Limit belirlenmedi';
    statusIcon = 'infinite';
  }

  const amountStr = amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <LinearGradient
        colors={cardGradient}
        locations={[0, 0.5, 1]}
        style={styles.card}
      >
        {/* Top accent line */}
        <LinearGradient
          colors={[accentColor, accentLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topLine}
        />

        <View style={styles.inner}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.label}>{isToday ? 'BUGÜNKÜ HARCAMA' : 'TOPLAM'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}30` }]}>
              <Ionicons name={statusIcon} size={12} color={accentColor} />
              <Text style={[styles.statusText, { color: accentColor }]}>{statusText}</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={[styles.amountMain, { color: isOverLimit ? '#FF4D6A' : isWarning ? '#FF9F43' : '#FFFFFF' }]}>
              {amountStr}
            </Text>
            <Text style={styles.amountCurrency}> TL</Text>
          </View>

          {/* Remaining or limit info */}
          {limit > 0 && (
            <View style={styles.remainingRow}>
              <Ionicons
                name={remaining >= 0 ? 'trending-down-outline' : 'trending-up-outline'}
                size={14}
                color={remaining >= 0 ? '#00D68F' : '#FF4D6A'}
              />
              <Text style={[styles.remainingText, { color: remaining >= 0 ? '#00D68F' : '#FF4D6A' }]}>
                {remaining >= 0
                  ? `Kalan ${formatCurrency(remaining)}`
                  : `${formatCurrency(Math.abs(remaining))} aşıldı`}
              </Text>
              <Text style={styles.limitOf}>/ {formatCurrency(limit)} limit</Text>
            </View>
          )}

          {/* Progress bar */}
          {limit > 0 && (
            <View style={styles.progressWrapper}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[accentColor, accentLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${percentage}%` }]}
                />
              </View>
              <Text style={styles.progressPercent}>{Math.round(percentage)}%</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 4,
    marginBottom: 14,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,111,255,0.15)',
  },
  card: {
    borderRadius: 24,
  },
  topLine: {
    height: 3,
  },
  inner: {
    padding: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.35)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  amountMain: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 62,
  },
  amountCurrency: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
    letterSpacing: 0,
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 18,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  limitOf: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '500',
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    minWidth: 32,
    textAlign: 'right',
  },
});
