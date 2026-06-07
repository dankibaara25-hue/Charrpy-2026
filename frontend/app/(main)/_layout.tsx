// Bottom-tab shell. Alarms, Leaderboard (placeholder), Profile (renamed
// from Settings — the gear icon inside Profile opens the dedicated
// /settings stack).
//
// Tab bar height respects the device's bottom safe-area inset so the
// nav items never sit underneath the iPhone home indicator / Android
// system gesture bar. The inner content area is also tall enough that
// icons + labels live in the vertical middle, well clear of the
// hardware affordances.

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts } from "@/src/theme";

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  // Inner content area for icon + label. We pick 72 px (≈10 px taller
  // than before) so the items have proper breathing room without
  // dominating short screens.
  const CONTENT_HEIGHT = 72;
  // Add a sensible floor for Android phones that report 0 here.
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.bold,
          fontSize: 12,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarItemStyle: {
          // Vertically center icon + label inside the content area.
          paddingVertical: 8,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 2,
          borderTopColor: colors.shadow,
          height: CONTENT_HEIGHT + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
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
