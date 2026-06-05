// Notification permission step — sits between ringtone selection and the
// paywall in onboarding. Provides a contextual pre-permission explainer
// (per <handle_permissions_contract>) so the native OS popup only appears
// after the user taps "Allow notifications". If the user denies once and we
// can ask again, we soft-retry; if blocked, we surface an Open Settings CTA.

import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, radius, space, type } from "@/src/theme";
import {
  getPermissionStatus,
  requestPermission,
  ensureAlarmChannel,
  configureForegroundHandler,
  type PermissionStatus,
} from "@/src/lib/notifications";

// Reuse one of the bundled onboarding illustrations for visual continuity.
const ART = require("../assets/images/onboarding/ringtone.png");

export default function NotificationsPermission() {
  const router = useRouter();
  const [status, setStatus] = useState<PermissionStatus>("undetermined");
  const [canAsk, setCanAsk] = useState(true);
  const [busy, setBusy] = useState(false);

  // Initial probe so we know whether we should ask directly or jump to the
  // "Open Settings" branch.
  useEffect(() => {
    configureForegroundHandler();
    void ensureAlarmChannel();
    (async () => {
      const cur = await getPermissionStatus();
      setStatus(cur.status);
      setCanAsk(cur.canAskAgain);
    })();
  }, []);

  const proceed = useCallback(() => {
    router.replace("/paywall");
  }, [router]);

  const handleAllow = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await requestPermission();
      setStatus(res.status);
      setCanAsk(res.canAskAgain);
      if (res.status === "granted") {
        // Tiny delay so the OS popup dismissal animation finishes cleanly.
        setTimeout(proceed, 150);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, proceed]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(() => {});
  }, []);

  const blocked = status === "denied" && !canAsk;
  const granted = status === "granted";

  const primaryLabel = granted
    ? "Continue"
    : blocked
      ? "Open settings"
      : busy
        ? "Asking…"
        : "Allow notifications";

  const primaryAction = granted
    ? proceed
    : blocked
      ? handleOpenSettings
      : handleAllow;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="notifications-permission-screen"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          testID="notifications-permission-back-button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.artWrap}>
          <Image source={ART} style={styles.art} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Let Charrpy wake you up</Text>
        <Text style={styles.subtitle}>
          Turn on notifications so your alarm can ring loud and clear, even on
          silent.
        </Text>

        <View style={styles.bullets}>
          <Bullet icon="alarm" text="Reliable alarm delivery" />
          <Bullet icon="volume-high" text="Plays your chosen ringtone" />
          <Bullet icon="trophy" text="Streak & reward reminders" />
        </View>

        {blocked ? (
          <Text style={styles.blockedHint}>
            Notifications are blocked.{" "}
            {Platform.OS === "ios"
              ? "Open Settings → Charrpy → Notifications to enable."
              : "Open Settings → Apps → Charrpy → Notifications to enable."}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button3D
          label={primaryLabel}
          onPress={primaryAction}
          disabled={busy}
          testID="notifications-permission-primary-button"
        />
        {!granted ? (
          <Pressable
            onPress={proceed}
            style={styles.skip}
            hitSlop={8}
            testID="notifications-permission-skip-button"
          >
            <Text style={styles.skipText}>Not now</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const Bullet: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}> = ({ icon, text }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletIcon}>
      <Ionicons name={icon} size={18} color={colors.textInverse} />
    </View>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

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
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    alignItems: "center",
  },
  artWrap: {
    width: "70%",
    aspectRatio: 1,
    maxHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  art: { width: "100%", height: "100%" },
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
    marginBottom: space.lg,
    paddingHorizontal: space.sm,
  },
  bullets: {
    width: "100%",
    gap: 10,
    marginTop: space.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 4,
    borderBottomColor: colors.shadow,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  bulletIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    borderBottomWidth: 3,
    borderBottomColor: colors.primaryDark,
  },
  bulletText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textMain,
    flex: 1,
  },
  blockedHint: {
    ...type.caption,
    color: colors.danger,
    textAlign: "center",
    marginTop: space.md,
    paddingHorizontal: space.sm,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
  skip: {
    alignSelf: "center",
    marginTop: space.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    ...type.caption,
    color: colors.textMuted,
    fontFamily: fonts.semibold,
  },
});
