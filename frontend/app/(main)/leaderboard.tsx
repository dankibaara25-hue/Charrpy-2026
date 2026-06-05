import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EmptyState from "@/src/components/EmptyState";
import { colors, fonts, space, type } from "@/src/theme";

export default function Leaderboard() {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
      testID="leaderboard-screen"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Coming soon.</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <EmptyState
          hint="Nothing here at this time."
          testID="leaderboard-empty"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  title: {
    ...type.h1,
    color: colors.textMain,
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
  body: { padding: space.lg, paddingBottom: 120 },
});
