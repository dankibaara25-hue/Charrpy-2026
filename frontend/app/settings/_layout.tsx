// Settings stack — reachable from the Profile tab's gear icon. Hosts the
// settings menu (Account / Support sections) and the edit-profile screen.

import React from "react";
import { Stack } from "expo-router";

import { colors } from "@/src/theme";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    />
  );
}
