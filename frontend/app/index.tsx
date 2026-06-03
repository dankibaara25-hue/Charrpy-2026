// Splash screen for Charrpy.
// Shows the mascot face + lowercase wordmark over the brand-orange background,
// then auto-routes to the welcome screen after 3s.

import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const SPLASH_DURATION_MS = 3000;
const BRAND_ORANGE = "#FF9500";

export default function SplashIndex() {
  const router = useRouter();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    const t = setTimeout(() => {
      router.replace("/welcome");
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [opacity, router]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container} testID="splash-screen">
      <StatusBar style="dark" />
      <Animated.View style={[styles.imageWrap, animatedStyle]}>
        <Image
          source={require("../assets/images/mascot-splash.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrap: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
