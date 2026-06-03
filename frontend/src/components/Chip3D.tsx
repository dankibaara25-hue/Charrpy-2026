// Selectable option chip with Duolingo-style 3D bottom border. Tuned for
// the cream background — strong dark border + bottom shadow when idle so
// the depth is visible at all times.

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

  const bg = selected ? "#FFE3BD" : colors.surface;
  const borderColor = selected ? colors.primary : colors.shadow;
  const bottomColor = selected ? colors.primaryDark : colors.shadow;
  const labelColor = colors.textMain;

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
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <View
          style={[
            styles.indicator,
            multi ? styles.indicatorSquare : styles.indicatorRound,
            {
              borderColor: selected ? colors.primary : colors.shadow,
              backgroundColor: selected ? colors.primary : "transparent",
            },
          ]}
        >
          {selected ? (
            <Ionicons name="checkmark" size={16} color={colors.textInverse} />
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
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
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
