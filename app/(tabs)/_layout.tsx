import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { colors } from '@/lib/constants/design-tokens';
import { useNetwork } from '@/lib/hooks/useNetwork';

function TabIcon({ name, color, size, focused }: { name: any; color: string; size: number; focused: boolean }) {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {focused && (
        <View style={{
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${colors.primary}15`,
        }} />
      )}
      <Ionicons name={focused ? name.replace('-outline', '') : name} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const isOnline = useNetwork();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
            height: Platform.OS === 'ios' ? 88 : 72,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 8,
            backgroundColor: 'transparent',
          },
          tabBarBackground: () => (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colors.bgPrimary,
                  borderTopWidth: 1,
                  borderTopColor: colors.separator,
                },
              ]}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
          headerStyle: {
            backgroundColor: colors.bgPrimary,
          },
          headerShadowVisible: false,
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Bugün',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home-outline" color={color} size={22} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            headerShown: false,
            title: 'Geçmiş',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="calendar-outline" color={color} size={22} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            headerShown: false,
            title: 'Analiz',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="bar-chart-outline" color={color} size={22} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            title: 'Ayarlar',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="settings-outline" color={color} size={22} focused={focused} />
            ),
          }}
        />
      </Tabs>

      {!isOnline && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOutUp.duration(300)}
          style={{
            position: 'absolute',
            top: (insets.top || 44) + 8,
            left: 20,
            right: 20,
            backgroundColor: colors.warning,
            padding: 12,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: colors.warning,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
            zIndex: 999,
          }}
        >
          <Ionicons name="cloud-offline" size={18} color="#000" style={{ marginRight: 8 }} />
          <Text style={{ fontWeight: '700', color: '#000', fontSize: 12, flex: 1 }}>
            Çevrimdışı — Yerel mod aktif
          </Text>
        </Animated.View>
      )}
    </>
  );
}
