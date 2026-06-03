// Rounded onboarding progress bar with orange gradient fill on a white track.
// Animates fluidly when `progress` (0..1) changes.

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { colors, radius } from "@/src/theme";

interface ProgressBarProps {
  progress: number; // 0..1
  testID?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  testID,
}) => {
  const width = useSharedValue(Math.max(0, Math.min(1, progress)));

  useEffect(() => {
    width.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.track} testID={testID}>
      <Animated.View style={[styles.fillWrap, animatedStyle]}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 14,
    width: "100%",
    backgroundColor: colors.track,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  fillWrap: {
    height: "100%",
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  fill: {
    flex: 1,
    borderRadius: radius.pill,
  },
});

export default ProgressBar;
