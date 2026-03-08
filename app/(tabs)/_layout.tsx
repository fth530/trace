// S-Class Tab Navigator Layout
// Based on Antigravity Protocol

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { neonColors } from '@/lib/constants/design-tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: neonColors.mint,
        tabBarInactiveTintColor: neonColors.slateDark,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          elevation: 0,
          height: Platform.OS === 'ios' ? 95 : 85,
          paddingBottom: Platform.OS === 'ios' ? 35 : 20,
          paddingTop: 15,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="dark"
              intensity={90}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
              ]}
            />
          ),
        headerStyle: {
          backgroundColor: 'black',
          borderBottomWidth: 0,
        },
        headerShadowVisible: false,
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 20,
          letterSpacing: -0.5,
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
  );
}
