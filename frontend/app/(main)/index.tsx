// Main app placeholder. Real alarms / leaderboard / settings ship in M3.
// Lives under `(main)` so it can host a bottom-tab navigator without showing
// the segment name in URLs.

import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { findAvatar } from "@/src/onboarding/avatars";
import { useAuth } from "@/src/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useRouter } from "expo-router";

export default function MainHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [nickname, setNickname] = useState<string>("friend");
  const [avatarId, setAvatarId] = useState<string | null>(null);

  useEffect(() => {
    storage.getItem("charrpy.nickname", "").then((v) => {
      if (typeof v === "string" && v) setNickname(v);
    });
    storage.getItem("charrpy.avatar.id", "").then((v) => {
      if (typeof v === "string" && v) setAvatarId(v);
    });
  }, []);

  const avatar = findAvatar(avatarId);

  const handleReset = async () => {
    await signOut(auth).catch(() => {});
    await storage.removeItem("charrpy.uid");
    await storage.removeItem("charrpy.nickname");
    await storage.removeItem("charrpy.avatar.id");
    await storage.removeItem("charrpy.onboarding.completed");
    await storage.removeItem("charrpy.onboarding.answers");
    router.replace("/welcome");
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="main-home-screen"
    >
      <View style={styles.body}>
        {avatar ? (
          <View style={styles.avatarWrap}>
            <Image
              source={avatar.source}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
        ) : null}
        <Text style={styles.hello}>hey {nickname} 👋</Text>
        <Text style={styles.title}>You&apos;re in.</Text>
        <Text style={styles.subtitle}>
          Alarms, leaderboard and settings are next on the way.
        </Text>

        {user ? (
          <View style={styles.uidPill}>
            <Text style={styles.uidLabel}>Anon UID</Text>
            <Text style={styles.uid} numberOfLines={1}>
              {user.uid.slice(0, 16)}…
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button3D
          label="Reset & start over"
          variant="secondary"
          onPress={handleReset}
          testID="main-reset-button"
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
  avatarWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.shadow,
    borderBottomWidth: 6,
    borderBottomColor: colors.shadow,
    marginBottom: space.lg,
  },
  avatar: { width: "100%", height: "100%" },
  hello: {
    ...type.h3,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    marginBottom: space.xs,
  },
  title: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: space.sm,
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: space.xl,
  },
  uidPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.shadow,
  },
  uidLabel: {
    ...type.small,
    fontFamily: fonts.bold,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  uid: { ...type.small, color: colors.textMuted, maxWidth: 140 },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
});
