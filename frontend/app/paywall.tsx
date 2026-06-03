// Paywall screen — placeholder for the RevenueCat-presented paywall.
//
// IMPORTANT: The native RevenueCat SDK (`react-native-purchases` + the paywall
// UI module) cannot run inside Expo Go or this web preview — it bridges to
// StoreKit / Google Play Billing, which only exist in a real development /
// production build. To keep the flow testable end-to-end *right now* this
// screen is a deliberately-styled stub that documents the next step and
// hands the user off to the main app on "Start free trial".
//
// When you build a custom dev client (Publish → build), drop in:
//   import * as RevenueCatUI from "react-native-purchases-ui";
//   RevenueCatUI.presentPaywall({ onPurchaseCompleted, onDismiss, ... })
// inside the `handleStart` callback below — the surrounding routing already
// matches the flow described in the integration playbook.

import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, radius, space, type } from "@/src/theme";

const BULLETS = [
  "Unlimited alarms & challenges",
  "Cloud-synced streaks & leaderboard",
  "All ringtones, including future packs",
  "Cancel anytime",
];

export default function Paywall() {
  const router = useRouter();

  const handleStart = () => {
    // TODO (dev client): replace with RevenueCatUI.presentPaywall(...)
    // and route to /(main) on onPurchaseCompleted.
    router.replace("/(main)");
  };

  const handleSkip = () => {
    router.replace("/(main)");
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="paywall-screen"
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.crown}>
          <Ionicons name="star" size={36} color={colors.textInverse} />
        </View>

        <Text style={styles.title}>Charrpy Pro</Text>
        <Text style={styles.subtitle}>Win every morning.</Text>

        <View style={styles.card}>
          {BULLETS.map((b) => (
            <View key={b} style={styles.row}>
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              <Text style={styles.bullet}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.pricePrimary}>Free for 7 days</Text>
          <Text style={styles.priceSecondary}>then $4.99 / month</Text>
        </View>

        <View style={styles.noticeWrap}>
          <Image
            source={require("../assets/images/mascot-splash.png")}
            style={styles.noticeMascot}
            resizeMode="cover"
          />
          <Text style={styles.notice}>
            The real RevenueCat paywall unlocks once you publish and run a dev
            build — Expo Go can&apos;t run native billing.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button3D
          label="Start free trial"
          onPress={handleStart}
          testID="paywall-start-button"
        />
        <View style={{ height: 12 }} />
        <Button3D
          label="Maybe later"
          variant="secondary"
          onPress={handleSkip}
          testID="paywall-skip-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    padding: space.lg,
    paddingTop: space.xl,
    alignItems: "center",
  },
  crown: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDark,
    marginBottom: space.lg,
  },
  title: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    ...type.h3,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    marginBottom: space.xl,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 5,
    borderBottomColor: colors.shadow,
    padding: space.md,
    marginBottom: space.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  bullet: {
    ...type.body,
    color: colors.textMain,
    fontFamily: fonts.medium,
    flex: 1,
  },
  priceCard: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 5,
    borderBottomColor: colors.primaryDark,
    padding: space.md,
    marginBottom: space.lg,
    alignItems: "center",
  },
  pricePrimary: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.textInverse,
  },
  priceSecondary: {
    ...type.body,
    color: colors.textInverse,
    fontFamily: fonts.medium,
    opacity: 0.9,
  },
  noticeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.sm,
  },
  noticeMascot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  notice: {
    ...type.small,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
