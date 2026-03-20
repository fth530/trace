import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { colors } from '@/lib/constants/design-tokens';
import { useNetwork } from '@/lib/hooks/useNetwork';
import { BlurView } from 'expo-blur';

function TabIcon({ name, label, focused }: { name: any; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIconWrapper}>
      {focused ? (
        <View style={styles.tabIconActive}>
          <Ionicons name={name.replace('-outline', '')} size={20} color="#fff" />
        </View>
      ) : (
        <Ionicons name={name} size={20} color={colors.textTertiary} />
      )}
    </View>
  );
}

export default function TabLayout() {
  const isOnline = useNetwork();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 76;

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
            height: tabBarHeight,
            paddingBottom: Platform.OS === 'ios' ? 28 : 14,
            paddingTop: 10,
            backgroundColor: 'transparent',
          },
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill, styles.tabBarBg]}>
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, styles.tabBarOverlay]} />
              <View style={styles.tabBarBorder} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.2,
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
            tabBarIcon: ({ focused }) => (
              <TabIcon name="home-outline" label="Bugün" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            headerShown: false,
            title: 'Geçmiş',
            tabBarIcon: ({ focused }) => (
              <TabIcon name="calendar-outline" label="Geçmiş" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            headerShown: false,
            title: 'Analiz',
            tabBarIcon: ({ focused }) => (
              <TabIcon name="bar-chart-outline" label="Analiz" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            title: 'Ayarlar',
            tabBarIcon: ({ focused }) => (
              <TabIcon name="settings-outline" label="Ayarlar" focused={focused} />
            ),
          }}
        />
      </Tabs>

      {!isOnline && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOutUp.duration(300)}
          style={[styles.offlineBanner, { top: (insets.top || 44) + 8 }]}
        >
          <Ionicons name="cloud-offline" size={16} color="#000" style={{ marginRight: 8 }} />
          <Text style={styles.offlineText}>Çevrimdışı — Yerel mod aktif</Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tabBarBg: {
    overflow: 'hidden',
  },
  tabBarOverlay: {
    backgroundColor: 'rgba(13,13,18,0.65)',
  },
  tabBarBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(150,150,255,0.1)',
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 36,
  },
  tabIconActive: {
    width: 40,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  offlineBanner: {
    position: 'absolute',
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
  },
  offlineText: {
    fontWeight: '700',
    color: '#000',
    fontSize: 12,
    flex: 1,
  },
});
