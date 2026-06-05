// Reward screen — placeholder. Shown after the user beats a wake-up
// challenge (math, barcode, or photo). The full streak / XP visual treatment
// will land in the next user iteration; for now this screen confirms the
// dismissal, lets us measure the flow end-to-end, and routes the user back
// to the Alarms tab.
//
// Routes here as: /reward?from=barcode|photo|math&object=<id?>

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, radius, space, type } from "@/src/theme";

export default function Reward() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string; object?: string }>();

  useEffect(() => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
  }, []);

  const headline =
    from === "barcode"
      ? "Barcode scanned!"
      : from === "photo"
        ? "Photo locked in!"
        : "Wake-up complete!";

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="reward-screen"
    >
      <View style={styles.body}>
        <View style={styles.badge}>
          <Ionicons name="trophy" size={48} color={colors.textInverse} />
        </View>
        <Text style={styles.kicker}>NICE WORK</Text>
        <Text style={styles.title}>{headline}</Text>
        <Text style={styles.subtitle}>
          You&apos;re up. Streak &amp; XP rewards land next — stay tuned.
        </Text>

        <View style={styles.statRow}>
          <Stat icon="flame" label="Streak" value="+1" />
          <Stat icon="star" label="XP" value="+25" />
        </View>
      </View>

      <View style={styles.footer}>
        <Button3D
          label="Continue"
          onPress={() => router.replace("/(main)")}
          testID="reward-continue-button"
        />
      </View>
    </SafeAreaView>
  );
}

const Stat: React.FC<{
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.stat}>
    <View style={styles.statIcon}>
      <Ionicons name={icon} size={22} color={colors.primary} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
    borderBottomWidth: 8,
    borderBottomColor: colors.primaryDark,
  },
  kicker: {
    ...type.caption,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: space.xs,
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: space.xl,
    paddingHorizontal: space.sm,
  },
  statRow: {
    flexDirection: "row",
    gap: space.md,
    width: "100%",
    justifyContent: "center",
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 5,
    borderBottomColor: colors.shadow,
    paddingVertical: space.md,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.textMain,
  },
  statLabel: {
    ...type.caption,
    color: colors.textMuted,
    fontFamily: fonts.medium,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
