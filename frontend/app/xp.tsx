// XP reveal screen — shown immediately after the streak screen on Continue.
// Visual reference is dark purple "You won 40 XP!" mockup; we translate the
// concept into Charrpy's warm-cream palette + Duolingo-style 3D button so it
// stays coherent with the rest of the app. The big circular XP badge keeps
// the energy of the reference but in our brand colors.
//
// A one-shot "tada" fanfare plays on mount via useOneShotSfx (auto-cleans
// up on unmount — no memory leaks).

import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import Button3D from "@/src/components/Button3D";
import { useOneShotSfx } from "@/src/hooks/use-one-shot-sfx";
import { awardXpIdempotent, computeXpAward, readXp } from "@/src/lib/xp";
import { readStreak } from "@/src/lib/streak";
import { colors, fonts, space, type } from "@/src/theme";

const TADA = require("../assets/audio/sfx/xp-tada.mp3");

export default function XpReward() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  useOneShotSfx(TADA, 0.85);

  const [awarded, setAwarded] = useState<number | null>(null);
  const [total, setTotal] = useState<number>(0);

  const challenge = useMemo(() => (from || "math").toString(), [from]);

  useEffect(() => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
    (async () => {
      const streak = await readStreak();
      const delta = computeXpAward(challenge, streak.count);
      const { awarded: a, total: t } = await awardXpIdempotent(delta);
      // If the day's XP was already counted earlier we still show the user
      // what they WOULD have earned so the page feels meaningful — but the
      // total reflects the real persisted number.
      setAwarded(a > 0 ? a : delta);
      setTotal(a > 0 ? t : (await readXp()));
    })();
  }, [challenge]);

  const xpToShow = awarded ?? 0;

  const flavour =
    challenge === "barcode"
      ? "Nice scan."
      : challenge === "photo"
        ? "Sharp shot."
        : "Brain in gear.";

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="xp-screen"
    >
      <View style={styles.body}>
        <View style={styles.confettiTopLeft} />
        <View style={styles.confettiTopRight} />
        <View style={styles.confettiBottomLeft} />
        <View style={styles.confettiBottomRight} />

        <View style={styles.badgeWrap}>
          <View style={styles.badge}>
            <Text style={styles.badgeText} testID="xp-amount">
              {xpToShow}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>You won {xpToShow} XP!</Text>
        <Text style={styles.subtitle}>
          {flavour} {`\n`}
          {total > 0 ? `${total} XP total — keep that streak alive.` : "Great job!"}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button3D
          label="Continue"
          onPress={() => router.replace("/(main)")}
          testID="xp-continue-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: space.lg,
  },
  badge: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#C593F2", // purple, matches the reference mockup
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 10,
    borderBottomColor: "#8E5DD2",
    borderWidth: 3,
    borderColor: "#8E5DD2",
  },
  badgeText: {
    fontFamily: fonts.bold,
    color: "#FFFFFF",
    fontSize: 96,
    lineHeight: 100,
    letterSpacing: -2,
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
    marginBottom: space.sm,
  },
  // Decorative confetti dots — soft tan blobs evoking the reference's
  // floating particles, in our cream-friendly tones.
  confettiTopLeft: {
    position: "absolute",
    top: 60,
    left: 28,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F4D9A4",
    opacity: 0.6,
  },
  confettiTopRight: {
    position: "absolute",
    top: 90,
    right: 36,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F0C77A",
    opacity: 0.5,
  },
  confettiBottomLeft: {
    position: "absolute",
    bottom: 140,
    left: 48,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F2CCA0",
    opacity: 0.55,
  },
  confettiBottomRight: {
    position: "absolute",
    bottom: 110,
    right: 30,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F4DEBE",
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
