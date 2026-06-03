// Selectable option chip with Duolingo-style 3D bottom border.
// Used for single-choice and multi-choice onboarding questions.

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
import { Ionicons } from "@expo/vector-icons";

import { colors, fonts, radius } from "@/src/theme";

interface Chip3DProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
  multi?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DEPTH = 4;

export const Chip3D: React.FC<Chip3DProps> = ({
  label,
  selected = false,
  onPress,
  testID,
  multi = false,
  style,
}) => {
  const [pressed, setPressed] = useState(false);

  const bg = selected ? "rgba(255, 149, 0, 0.12)" : colors.surface;
  const borderColor = selected ? colors.primary : colors.surface;
  const bottomColor = selected ? colors.primaryDark : colors.surfaceShadow;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        setPressed(true);
        Haptics.selectionAsync().catch(() => {});
      }}
      onPressOut={() => setPressed(false)}
      testID={testID}
      style={[styles.wrapper, style]}
    >
      <View
        style={[
          styles.inner,
          {
            backgroundColor: bg,
            borderColor,
            borderBottomColor: bottomColor,
            borderBottomWidth: pressed ? 0 : DEPTH,
            marginTop: pressed ? DEPTH : 0,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: selected ? colors.textMain : colors.textMain },
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.indicator,
            multi ? styles.indicatorSquare : styles.indicatorRound,
            {
              borderColor: selected ? colors.primary : colors.surfaceHighlight,
              backgroundColor: selected ? colors.primary : "transparent",
            },
          ]}
        >
          {selected ? (
            <Ionicons
              name={multi ? "checkmark" : "checkmark"}
              size={16}
              color={colors.textMain}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginBottom: 12 },
  inner: {
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textMain,
    flex: 1,
    paddingRight: 12,
  },
  indicator: {
    width: 26,
    height: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorRound: { borderRadius: 13 },
  indicatorSquare: { borderRadius: 6 },
});

export default Chip3D;
