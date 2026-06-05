// Shared empty-state visual reused by the Alarms + Leaderboard tabs.
// Subtitle-only by design — the screen's own title already sits above.

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors, fonts, space, type } from "@/src/theme";

interface EmptyStateProps {
  hint: string;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hint, testID }) => (
  <View style={styles.wrap} testID={testID}>
    <Image
      source={require("../../assets/images/empty-state.png")}
      style={styles.image}
      resizeMode="contain"
    />
    <Text style={styles.hint}>{hint}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: space.xxl,
    gap: 8,
  },
  image: { width: 160, height: 160, marginBottom: space.md },
  hint: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    textAlign: "center",
  },
});

export default EmptyState;
