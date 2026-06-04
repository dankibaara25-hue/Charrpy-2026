// Welcome screen — lean copy, "Welcome!" above the hero, cream background.

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

const TOS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
const PRIVACY_URL = "https://www.apple.com/legal/privacy/en-ww/";

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="welcome-screen"
    >
      <View style={styles.top}>
        <Text style={styles.eyebrow}>Welcome!</Text>
      </View>

      <View style={styles.heroWrap}>
        <Image
          source={require("../assets/images/onboarding/welcome.png")}
          style={styles.hero}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>charrpy</Text>
        <Text style={styles.subtitle}>Wake up. Win mornings.</Text>
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
  safe: { flex: 1, backgroundColor: colors.background },
  top: {
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    alignItems: "center",
  },
  eyebrow: {
    ...type.h2,
    color: colors.textMain,
    fontFamily: fonts.bold,
  },
  heroWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xl,
    paddingTop: space.md,
  },
  hero: { width: "100%", height: "100%", maxHeight: 340 },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    alignItems: "center",
  },
  title: {
    ...type.display,
    color: colors.primary,
    textTransform: "lowercase",
    marginBottom: space.xs,
  },
  subtitle: {
    ...type.h3,
    color: colors.textMain,
    fontFamily: fonts.medium,
    textAlign: "center",
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
