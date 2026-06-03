// Welcome screen — first dark-themed surface a user sees after the splash.
// Renders mascot hero + headline + Continue button + legal footer links.

import React from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, space, type } from "@/src/theme";

// Apple's standard EULA (auto-applied when a developer doesn't provide one).
// Source: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
const TOS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
// Placeholder privacy URL — replace once a hosted page is live.
const PRIVACY_URL = "https://www.apple.com/legal/privacy/en-ww/";

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="welcome-screen"
    >
      <View style={styles.heroWrap}>
        <Image
          source={require("../assets/images/mascot-splash.png")}
          style={styles.hero}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>welcome to</Text>
        <Text style={styles.title}>charrpy</Text>
        <Text style={styles.subtitle}>
          The alarm that makes you actually get up. Beat a quick challenge to
          silence it — and finally win the morning.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button3D
          label="Continue"
          onPress={() => router.push("/onboarding")}
          testID="welcome-continue-button"
        />
        <Text style={styles.legal} testID="welcome-legal-text">
          By continuing, you agree to our{" "}
          <Pressable
            onPress={() => Linking.openURL(TOS_URL)}
            testID="welcome-tos-link"
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </Pressable>{" "}
          and{" "}
          <Pressable
            onPress={() => Linking.openURL(PRIVACY_URL)}
            testID="welcome-privacy-link"
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
          .
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.primary,
    overflow: "hidden",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  hero: { width: "100%", height: "100%" },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  eyebrow: {
    ...type.body,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textTransform: "lowercase",
    letterSpacing: 1,
    marginBottom: space.xs,
  },
  title: {
    ...type.display,
    color: colors.primary,
    textTransform: "lowercase",
    marginBottom: space.md,
  },
  subtitle: {
    ...type.h3,
    color: colors.textMain,
    fontFamily: fonts.regular,
    opacity: 0.85,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
  legal: {
    ...type.small,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: space.md,
  },
  legalLink: {
    ...type.small,
    color: colors.textMain,
    fontFamily: fonts.semibold,
    textDecorationLine: "underline",
  },
});
