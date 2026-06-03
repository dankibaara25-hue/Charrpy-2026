// Duolingo-style 3D button. Thick bottom border compresses on press for
// authentic "depress" feedback. Keeps a constant footprint via marginTop.

import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import * as Haptics from "expo-haptics";

import { colors, fonts, radius } from "@/src/theme";

type Variant = "primary" | "secondary";

interface Button3DProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const DEPTH = 6;

export const Button3D: React.FC<Button3DProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  testID,
  style,
}) => {
  const [pressed, setPressed] = useState(false);

  const palette = disabled
    ? {
        bg: colors.surfaceHighlight,
        border: colors.surfaceShadow,
        text: colors.textMuted,
      }
    : variant === "primary"
      ? { bg: colors.primary, border: colors.primaryDark, text: colors.textMain }
      : {
          bg: colors.surface,
          border: colors.surfaceShadow,
          text: colors.textMain,
        };

  const handlePressIn = () => {
    if (disabled) return;
    setPressed(true);
    Haptics.selectionAsync().catch(() => {});
  };
  const handlePressOut = () => setPressed(false);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      style={[styles.wrapper, style]}
    >
      <View
        style={[
          styles.inner,
          {
            backgroundColor: palette.bg,
            borderBottomColor: palette.border,
            borderBottomWidth: pressed ? 0 : DEPTH,
            marginTop: pressed ? DEPTH : 0,
            borderWidth: variant === "secondary" ? 2 : 0,
            borderColor: variant === "secondary" ? palette.border : "transparent",
            opacity: disabled ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  inner: {
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

export default Button3D;
