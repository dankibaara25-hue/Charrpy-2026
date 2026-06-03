// Minimal inline time picker — two scrollable wheels (hour + minute) plus an
// AM/PM toggle. Avoids @react-native-community/datetimepicker so the picker
// works inside Expo Go on web previews without extra native deps.

import React, { useMemo, useRef } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors, fonts, radius } from "@/src/theme";

const ITEM_HEIGHT = 48;
const VISIBLE = 5; // odd so the center row is well defined
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE;

const range = (count: number, start: number = 0): number[] =>
  Array.from({ length: count }, (_, i) => i + start);

interface WheelProps {
  data: number[];
  value: number;
  onChange: (v: number) => void;
  pad?: boolean;
  testID?: string;
}

const Wheel: React.FC<WheelProps> = ({
  data,
  value,
  onChange,
  pad,
  testID,
}) => {
  const ref = useRef<FlatList<number>>(null);
  const initialIndex = Math.max(0, data.indexOf(value));

  return (
    <View style={styles.wheel} testID={testID}>
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(it) => `${it}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_d, i) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * i,
          index: i,
        })}
        initialScrollIndex={initialIndex}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(data.length - 1, idx));
          onChange(data[clamped]);
        }}
        renderItem={({ item }) => {
          const isCenter = item === value;
          return (
            <View style={styles.wheelItem}>
              <Text
                style={[
                  styles.wheelText,
                  {
                    color: isCenter ? colors.textMain : colors.textMuted,
                    fontFamily: isCenter ? fonts.bold : fonts.medium,
                    opacity: isCenter ? 1 : 0.55,
                  },
                ]}
              >
                {pad ? `${item}`.padStart(2, "0") : `${item}`}
              </Text>
            </View>
          );
        }}
      />
      <View style={[styles.selectionLine, { pointerEvents: "none" }]} />
    </View>
  );
};

export interface TimeValue {
  hour: number; // 1..12
  minute: number; // 0..59
  meridiem: "AM" | "PM";
}

interface TimePickerInlineProps {
  value: TimeValue;
  onChange: (v: TimeValue) => void;
  style?: ViewStyle;
}

export const TimePickerInline: React.FC<TimePickerInlineProps> = ({
  value,
  onChange,
  style,
}) => {
  const hours = useMemo(() => range(12, 1), []);
  const minutes = useMemo(() => range(60, 0), []);

  return (
    <View style={[styles.container, style]} testID="time-picker-inline">
      <Wheel
        data={hours}
        value={value.hour}
        onChange={(h) => onChange({ ...value, hour: h })}
        testID="time-picker-hours"
      />
      <Text style={styles.colon}>:</Text>
      <Wheel
        data={minutes}
        value={value.minute}
        onChange={(m) => onChange({ ...value, minute: m })}
        pad
        testID="time-picker-minutes"
      />
      <View style={styles.meridiemColumn}>
        {(["AM", "PM"] as const).map((m) => {
          const active = value.meridiem === m;
          return (
            <Pressable
              key={m}
              onPress={() => onChange({ ...value, meridiem: m })}
              style={[
                styles.meridiemBtn,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primaryDark : colors.surface,
                },
              ]}
              testID={`time-picker-${m.toLowerCase()}`}
            >
              <Text
                style={[
                  styles.meridiemText,
                  { color: active ? colors.textMain : colors.textMuted },
                ]}
              >
                {m}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 4,
    borderBottomColor: colors.surfaceShadow,
  },
  wheel: {
    width: 80,
    height: WHEEL_HEIGHT,
    overflow: "hidden",
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelText: {
    fontSize: 28,
  },
  selectionLine: {
    position: "absolute",
    left: 4,
    right: 4,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
  },
  colon: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.textMain,
    paddingHorizontal: 4,
  },
  meridiemColumn: {
    marginLeft: 8,
    gap: 8,
  },
  meridiemBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 60,
    alignItems: "center",
  },
  meridiemText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default TimePickerInline;
