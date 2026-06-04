// Paywall — invokes RevenueCat's prebuilt paywall on first paint and routes
// the user based on the outcome. On platforms where RevenueCat isn't linked
// (Expo Go on web), the Billing.web stub returns "cancelled" immediately and
// we show a small explainer with a CTA into the main app.

import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, space, type } from "@/src/theme";
import {
  isRevenueCatAvailable,
  presentPaywall,
  type PaywallOutcome,
} from "@/src/billing/Billing";

export default function Paywall() {
  const router = useRouter();
  const presented = useRef(false);
  const [outcome, setOutcome] = useState<PaywallOutcome | null>(null);

  useEffect(() => {
    if (presented.current) return;
    presented.current = true;
    (async () => {
      const result = await presentPaywall();
      setOutcome(result);
      if (result === "purchased" || result === "restored") {
        router.replace("/(main)");
      }
      // For "cancelled" / "error" we stay on this screen and show a CTA so
      // the user can still reach the app shell.
    })();
  }, [router]);

  const goMain = () => router.replace("/(main)");

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="paywall-screen"
    >
      <View style={styles.body}>
        {outcome === null && isRevenueCatAvailable() ? (
          <>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.note}>Loading paywall…</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              {isRevenueCatAvailable()
                ? "Maybe later"
                : "Paywall ready for build"}
            </Text>
            <Text style={styles.subtitle}>
              {isRevenueCatAvailable()
                ? "You can upgrade anytime from settings."
                : "The RevenueCat paywall only renders inside a native build (StoreKit / Play Billing). Tap Publish to build a dev client, then this screen will open the real paywall automatically."}
            </Text>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Button3D
          label="Continue to app"
          onPress={goMain}
          testID="paywall-continue-button"
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
  },
  note: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    marginTop: space.md,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
