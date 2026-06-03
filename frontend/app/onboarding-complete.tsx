// Placeholder reached after onboarding completion. Avatar selection + the
// main app (alarms, leaderboard, settings) will be built in a follow-up pass.

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, space, type } from "@/src/theme";

export default function OnboardingComplete() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="onboarding-complete-screen"
    >
      <View style={styles.content}>
        <View style={styles.heroWrap}>
          <Image
            source={require("../assets/images/mascot-splash.png")}
            style={styles.hero}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>You&apos;re all set!</Text>
        <Text style={styles.subtitle}>
          Up next: pick your avatar, then we&apos;ll head to your alarms,
          leaderboard, and settings. Coming soon.
        </Text>
      </View>
      <View style={styles.footer}>
        <Button3D
          label="Restart onboarding"
          variant="secondary"
          onPress={() => router.replace("/welcome")}
          testID="onboarding-complete-restart-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  heroWrap: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: "hidden",
    backgroundColor: colors.primary,
    marginBottom: space.xl,
  },
  hero: { width: "100%", height: "100%" },
  title: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: space.md,
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
});
