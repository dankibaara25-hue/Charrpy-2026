// Settings menu — Account + Support sections, TOS + Privacy links at
// the bottom. Reached via the gear icon on the Profile tab.

import React, { useCallback } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

import { auth } from "@/src/lib/firebase";
import { deleteUserProfile } from "@/src/lib/userProfile";
import { storage } from "@/src/utils/storage";
import { colors, fonts, radius, space, type } from "@/src/theme";

const WEB_URL = "https://www.charrpy.com";

export default function SettingsMenu() {
  const router = useRouter();

  const openExternal = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete account?",
      "This permanently removes your nickname, avatar, streak, and XP. Your alarms (saved locally) will also be cleared. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserProfile();
            } catch (e) {
              console.warn("[settings] deleteUserProfile failed", e);
            }
            try {
              await auth.currentUser?.delete();
            } catch {
              await signOut(auth).catch(() => {});
            }
            await Promise.all([
              storage.removeItem("charrpy.uid"),
              storage.removeItem("charrpy.nickname"),
              storage.removeItem("charrpy.avatar.id"),
              storage.removeItem("charrpy.onboarding.completed"),
              storage.removeItem("charrpy.onboarding.answers"),
              storage.removeItem("charrpy.alarms"),
              storage.removeItem("charrpy.alarm.time"),
              storage.removeItem("charrpy.ringtone.id"),
              storage.removeItem("charrpy.streak"),
              storage.removeItem("charrpy.xp"),
              storage.removeItem("charrpy.xp.last_award"),
            ]);
            router.replace("/welcome");
          },
        },
      ],
    );
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]} testID="settings-screen">
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          testID="settings-back-button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel>Account</SectionLabel>
        <Row
          icon="person"
          label="Profile"
          onPress={() => router.push("/settings/profile")}
          testID="settings-profile-row"
        />

        <SectionLabel>Support</SectionLabel>
        <Row
          icon="help-circle"
          label="Help Center"
          onPress={() => openExternal(WEB_URL)}
          testID="settings-help-row"
        />
        <Row
          icon="chatbubble-ellipses"
          label="Feedback"
          onPress={() => openExternal(WEB_URL)}
          testID="settings-feedback-row"
        />

        <View style={styles.footerLinks}>
          <Pressable onPress={() => openExternal(WEB_URL)} hitSlop={8}>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.footerSep}>•</Text>
          <Pressable onPress={() => openExternal(WEB_URL)} hitSlop={8}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.section}>{children}</Text>
);

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: "default" | "danger";
  testID?: string;
}

const Row: React.FC<RowProps> = ({ icon, label, onPress, variant, testID }) => {
  const danger = variant === "danger";
  return (
    <Pressable onPress={onPress} style={styles.row} testID={testID}>
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? "#FFE0E0" : colors.surfaceMuted },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.danger : colors.textMain}
        />
      </View>
      <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textMuted}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...type.h1,
    color: colors.textMain,
    flex: 1,
    textAlign: "center",
  },
  body: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  section: {
    ...type.caption,
    color: colors.primary,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: space.md,
    marginBottom: space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 4,
    borderBottomColor: colors.shadow,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    marginBottom: 10,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textMain,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: space.xl,
  },
  footerLink: {
    ...type.caption,
    color: colors.textMuted,
    fontFamily: fonts.semibold,
  },
  footerSep: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
  },
});
