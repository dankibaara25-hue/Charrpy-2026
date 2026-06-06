// Shared permission explainer screen. Both /notifications-permission and
// /camera-permission render this with their own copy + request handler.
// Keeps the layout 1:1 across both screens so the onboarding flow feels
// like one cohesive sequence rather than two unrelated pages.
//
// Honours the <handle_permissions_contract>: caller passes the current
// permission state and an `onAllow` that drives the native popup; we just
// render the right CTA label ("Allow" / "Open settings" / "Continue")
// based on the status the caller hands in.

import React from "react";
import {
  Image,
  ImageSourcePropType,
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

export interface PermissionBullet {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

export type PermissionUiStatus = "undetermined" | "granted" | "denied-can-ask" | "denied-blocked";

export interface PermissionScreenProps {
  testID?: string;
  art: ImageSourcePropType;
  title: string;
  subtitle: string;
  bullets: PermissionBullet[];
  /** Status string driving the primary CTA label. */
  status: PermissionUiStatus;
  /** Set to true while the native popup is in-flight. */
  busy?: boolean;
  /** Labels for the buttons (defaults work for most cases). */
  allowLabel?: string;
  blockedLabel?: string;
  continueLabel?: string;
  skipLabel?: string;
  /** Triggered by primary tap when status is undetermined / denied-can-ask. */
  onAllow: () => void;
  /** Triggered by primary tap when status is denied-blocked (opens Settings). */
  onOpenSettings: () => void;
  /** Triggered by primary tap when status is granted, AND by the skip link. */
  onContinue: () => void;
  /** Optional copy shown only when blocked. */
  blockedHint?: string;
  /** Show the back chevron in the header (default true). */
  showBack?: boolean;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  testID,
  art,
  title,
  subtitle,
  bullets,
  status,
  busy,
  allowLabel = "Allow",
  blockedLabel = "Open settings",
  continueLabel = "Continue",
  skipLabel = "Not now",
  onAllow,
  onOpenSettings,
  onContinue,
  blockedHint,
  showBack = true,
}) => {
  const router = useRouter();
  const granted = status === "granted";
  const blocked = status === "denied-blocked";

  const primaryLabel = granted
    ? continueLabel
    : blocked
      ? blockedLabel
      : busy
        ? "Asking\u2026"
        : allowLabel;

  const primaryAction = granted
    ? onContinue
    : blocked
      ? onOpenSettings
      : onAllow;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID={testID}
    >
      <View style={styles.header}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backBtn}
            testID={testID ? `${testID}-back-button` : undefined}
          >
            <Ionicons name="chevron-back" size={28} color={colors.textMain} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.artWrap}>
          <Image source={art} style={styles.art} resizeMode="contain" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.bullets}>
          {bullets.map((b) => (
            <View key={b.text} style={styles.bulletRow}>
              <View style={styles.bulletIcon}>
                <Ionicons name={b.icon} size={18} color={colors.textInverse} />
              </View>
              <Text style={styles.bulletText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {blocked && blockedHint ? (
          <Text style={styles.blockedHint}>
            {blockedHint}
            {Platform.OS === "ios"
              ? " Open Settings \u2192 Charrpy to re-enable."
              : " Open Settings \u2192 Apps \u2192 Charrpy to re-enable."}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button3D
          label={primaryLabel}
          onPress={primaryAction}
          disabled={!!busy}
          testID={testID ? `${testID}-primary-button` : undefined}
        />
        {!granted ? (
          <Pressable
            onPress={onContinue}
            style={styles.skip}
            hitSlop={8}
            testID={testID ? `${testID}-skip-button` : undefined}
          >
            <Text style={styles.skipText}>{skipLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default PermissionScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    minHeight: 48,
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
