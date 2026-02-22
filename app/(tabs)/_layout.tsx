// Tab Navigator Layout
// Based on ROADMAP §3 Navigation Tree & Antigravity Final Protocol

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#38bdf8", // Sky-400 (Neon Accent)
        tabBarInactiveTintColor: "#64748b", // Slate-500
        tabBarStyle: {
          position: 'absolute', // Ensures bottom blur works
          borderTopWidth: 0,
          elevation: 0, // Remove shadow on Android
          height: Platform.OS === "ios" ? 85 : 70,
          paddingBottom: Platform.OS === "ios" ? 25 : 12,
          paddingTop: 12,
          backgroundColor: Platform.OS === "ios" ? "transparent" : "#09090b", // zinc-950 solid for Android fallback, Blur for iOS
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              tint="dark"
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(9, 9, 11, 0.95)' }]} />
          ),
        headerStyle: {
          backgroundColor: "#09090b", // Zinc-950
          borderBottomWidth: 0, // Clean look
        },
        headerShadowVisible: false,
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          letterSpacing: 0.5,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false, // Hidden for custom Home UI
          title: "Bugün",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Geçmiş",
          headerTitle: "Geçmiş Harcamalar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analiz",
          headerTitle: "Aylık İstatistik",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
