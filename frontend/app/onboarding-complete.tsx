// Landing screen reached after the user picks their avatar. For now this is
// a placeholder until the main app (alarms, leaderboard, settings) lands.

import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Button3D from "@/src/components/Button3D";
import { findAvatar } from "@/src/onboarding/avatars";
import { colors, fonts, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";

export default function OnboardingComplete() {
  const router = useRouter();
  const [avatarId, setAvatarId] = useState<string | null>(null);

  useEffect(() => {
    storage.getItem("charrpy.avatar.id", "").then((v) => {
      if (typeof v === "string" && v) setAvatarId(v);
    });
  }, []);

  const avatar = findAvatar(avatarId);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="onboarding-complete-screen"
    >
      <View style={styles.content}>
        <View style={styles.heroWrap}>
          {avatar ? (
            <Image
              source={avatar.source}
              style={styles.hero}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../assets/images/mascot-splash.png")}
              style={styles.hero}
              resizeMode="cover"
            />
          )}
        </View>
        <Text style={styles.title}>You&apos;re all set!</Text>
        <Text style={styles.subtitle}>
          Your avatar is locked in. Alarms, leaderboard, and settings are next —
          coming very soon.
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
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDark,
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
