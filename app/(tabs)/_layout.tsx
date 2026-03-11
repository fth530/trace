import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { colors } from '@/lib/constants/design-tokens';
import { useNetwork } from '@/lib/hooks/useNetwork';

export default function TabLayout() {
  const isOnline = useNetwork();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.separator,
            elevation: 0,
            height: Platform.OS === 'ios' ? 88 : 70,
            paddingBottom: Platform.OS === 'ios' ? 30 : 12,
            paddingTop: 8,
            backgroundColor: 'transparent',
          },
          tabBarBackground: () =>
            Platform.OS === 'ios' ? (
              <BlurView
                tint="dark"
                intensity={80}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(0, 0, 0, 0.92)' },
                ]}
              />
            ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
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
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            headerShown: false,
            title: 'Geçmiş',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            headerShown: false,
            title: 'Analiz',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pie-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            title: 'Ayarlar',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
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
            top: (insets.top || 40) + 10,
            left: 20,
            right: 20,
            backgroundColor: colors.warning,
            padding: 12,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
            zIndex: 999,
          }}
        >
          <Ionicons name="cloud-offline" size={20} color="#000" style={{ marginRight: 8 }} />
          <Text style={{ fontWeight: '700', color: '#000', fontSize: 13, flex: 1 }}>
            Çevrimdışı (Yerel Mod). İnternete bağlandığınızda verileriniz eklenecektir.
          </Text>
        </Animated.View>
      )}
    </>
  );
}
