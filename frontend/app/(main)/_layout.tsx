// Bottom-tab shell. Alarms, Leaderboard (placeholder), Profile (renamed
// from Settings — the gear icon inside Profile opens the dedicated
// /settings stack).

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors, fonts } from "@/src/theme";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 2,
          borderTopColor: colors.shadow,
          height: 76,
          paddingTop: 8,
          paddingBottom: 16,
        },
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: "alarm",
            leaderboard: "trophy",
            profile: "person",
          };
          return (
            <Ionicons
              name={map[route.name] ?? "ellipse"}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Alarms" }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Leaderboard" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
