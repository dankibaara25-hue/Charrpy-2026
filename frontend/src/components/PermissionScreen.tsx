// Shared permission explainer screen. Both /notifications-permission and
// /camera-permission render this with their own copy + request handler.
//
// Behaviour (intentional, per product call):
//   • Primary CTA is ALWAYS "Continue" (never "Open settings").
//   • Tapping Continue fires the native permission popup.
//   • Whatever the user picks (allow OR deny OR blocked), we advance to
//     the next screen. The OS handles the actual permission state; we
//     just make sure the user isn't stuck.
//   • A small "Not now" link below lets them skip entirely.
//
// This component is intentionally dumb — the route screen owns the
// request logic so each permission can talk to its own native API.

import React, { useEffect, useRef } from "react";
import {
  Image,
  ImageSourcePropType,
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

export interface PermissionScreenProps {
  testID?: string;
  art: ImageSourcePropType;
  title: string;
  subtitle: string;
  bullets?: PermissionBullet[];
  /** True while the native popup is open. */
  busy?: boolean;
  /** Fires the native permission request. We advance regardless of result. */
  onContinue: () => void;
  /** User taps "Not now". Usually identical to onContinue (just advances). */
  onSkip: () => void;
  /** Show the back chevron in the header (default true). */
  showBack?: boolean;
  continueLabel?: string;
  skipLabel?: string;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  testID,
  art,
  title,
  subtitle,
  bullets,
  busy,
  onContinue,
  onSkip,
  showBack = true,
  continueLabel = "Continue",
  skipLabel = "Not now",
}) => {
  const router = useRouter();
  // Track mount state so any deferred setState in the parent route can
  // bail safely once the screen unmounts during the chained transition.
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

        {bullets && bullets.length > 0 ? (
          <View style={styles.bullets}>
            {bullets.map((b) => (
              <View key={b.text} style={styles.bulletRow}>
                <View style={styles.bulletIcon}>
                  <Ionicons
                    name={b.icon}
                    size={18}
                    color={colors.textInverse}
                  />
                </View>
                <Text style={styles.bulletText}>{b.text}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button3D
          label={busy ? "Asking\u2026" : continueLabel}
          onPress={onContinue}
          disabled={!!busy}
          testID={testID ? `${testID}-primary-button` : undefined}
        />
        <Pressable
          onPress={onSkip}
          style={styles.skip}
          hitSlop={8}
          testID={testID ? `${testID}-skip-button` : undefined}
          disabled={!!busy}
        >
          <Text style={styles.skipText}>{skipLabel}</Text>
        </Pressable>
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
    width: "78%",
    aspectRatio: 1,
    maxHeight: 260,
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
