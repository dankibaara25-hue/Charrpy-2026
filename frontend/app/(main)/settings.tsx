import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";

import Button3D from "@/src/components/Button3D";
import { auth } from "@/src/lib/firebase";
import { findAvatar } from "@/src/onboarding/avatars";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";

export default function Settings() {
  const router = useRouter();
  const [nickname, setNickname] = useState("friend");
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
    await storage.removeItem("charrpy.alarms");
    await storage.removeItem("charrpy.alarm.time");
    await storage.removeItem("charrpy.ringtone.id");
    router.replace("/welcome");
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
      testID="settings-screen"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>You, your way.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {avatar ? (
            <Image source={avatar.source} style={styles.avatar} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{nickname}</Text>
            <Text style={styles.profileMeta}>Anonymous · Charrpy</Text>
          </View>
        </View>

        <Text style={styles.section}>About</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Auth</Text>
          <Text style={styles.rowValue}>Firebase Anon</Text>
        </View>

        <View style={{ height: space.lg }} />

        <Button3D
          label="Reset & start over"
          variant="secondary"
          onPress={handleReset}
          testID="settings-reset-button"
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 5,
    borderBottomColor: colors.shadow,
    padding: space.md,
    marginBottom: space.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceMuted,
  },
  profileName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textMain,
  },
  profileMeta: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    ...type.caption,
    color: colors.primary,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 3,
    borderBottomColor: colors.shadow,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textMain,
  },
  rowValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
});
