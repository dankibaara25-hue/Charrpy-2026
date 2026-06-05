// Shared visual primitives for camera-based challenges (barcode + photo).
// Renders a dimmed full-screen camera view with a Charrpy-orange dashed
// frame overlay, a small status badge, and a bottom "Back" pill button.
// Pure presentational — challenge logic (capture detection / scanning) is
// owned by the screen that mounts these.

import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, fonts, radius, space } from "@/src/theme";

interface DashedFrameProps {
  shape: "rect" | "square";
  pulse?: boolean;
  testID?: string;
}

export const DashedFrame: React.FC<DashedFrameProps> = ({
  shape,
  pulse: _pulse,
  testID,
}) => {
  const aspect: ViewStyle =
    shape === "square" ? { aspectRatio: 1 } : { aspectRatio: 16 / 9 };
  return (
    <View style={styles.frameWrap} pointerEvents="none" testID={testID}>
      <View
        style={[
          styles.frame,
          aspect,
          shape === "square" ? styles.frameSquare : styles.frameRect,
        ]}
      />
    </View>
  );
};

interface ChallengeHintProps {
  emoji?: string;
  text: string;
  testID?: string;
}

export const ChallengeHint: React.FC<ChallengeHintProps> = ({
  emoji,
  text,
  testID,
}) => (
  <View style={styles.hintWrap} testID={testID}>
    {emoji ? <Text style={styles.hintEmoji}>{emoji}</Text> : null}
    <Text style={styles.hintText}>{text}</Text>
  </View>
);

interface BottomPillProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
}

export const BottomPill: React.FC<BottomPillProps> = ({
  label,
  onPress,
  variant = "primary",
  icon,
  testID,
}) => {
  const [pressed, setPressed] = React.useState(false);
  const bg = variant === "primary" ? colors.primary : "rgba(255,255,255,0.12)";
  const border = variant === "primary" ? colors.primaryDark : "rgba(255,255,255,0.25)";
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      testID={testID}
      style={[
        styles.pill,
        {
          backgroundColor: bg,
          borderColor: border,
          borderBottomColor: border,
          borderBottomWidth: pressed ? 0 : 5,
          marginTop: pressed ? 5 : 0,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={variant === "primary" ? colors.textInverse : "#FFF"}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text
        style={[
          styles.pillText,
          { color: variant === "primary" ? colors.textInverse : "#FFF" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// Renders a single dashed border via overlay nodes. expo / RN doesn't honor
// `borderStyle: dashed` on iOS for large radii, so we use a CSS-style approach
// with 4 absolutely-positioned chunks of `borderStyle: dashed` inside a
// transparent frame. The 2px border is the dash itself; we tile a large
// border so the dash visual matches the reference design.
const FRAME_BORDER_W = 4;

const styles = StyleSheet.create({
  frameWrap: {
    width: "84%",
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: "100%",
    borderColor: colors.primary,
    borderWidth: FRAME_BORDER_W,
    borderStyle: "dashed",
  },
  frameRect: {
    borderRadius: 6,
  },
  frameSquare: {
    borderRadius: 8,
  },
  hintWrap: {
    width: "84%",
    alignItems: "center",
    marginTop: space.lg,
    paddingHorizontal: space.sm,
  },
  hintEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  hintText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
  },
  pill: {
    minHeight: 54,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  pillText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: 0.3,
  },
});
