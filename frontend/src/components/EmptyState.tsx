// Shared empty-state visual reused by the Alarms + Leaderboard tabs.

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors, fonts, space, type } from "@/src/theme";

interface EmptyStateProps {
  title: string;
  hint: string;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  hint,
  testID,
}) => (
  <View style={styles.wrap} testID={testID}>
    <Image
      source={require("../../assets/images/empty-state.png")}
      style={styles.image}
      resizeMode="contain"
    />
    <Text style={styles.title}>{title}</Text>
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
  image: { width: 220, height: 220, marginBottom: space.md },
  title: {
    ...type.h2,
    color: colors.textMain,
    textAlign: "center",
  },
  hint: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
});

export default EmptyState;
