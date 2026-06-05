// Compact inline time picker — three scrollable wheels (hour + minute) plus
// an AM/PM toggle. Uses ScrollView (not FlatList) because the data is tiny
// (12 hours, 60 minutes) and avoids the "VirtualizedLists should never be
// nested inside plain ScrollViews" red-box when hosted inside the
// alarm-edit ScrollView. All four borders are visible on the selection box
// so the focused row is obvious on cream BG.

import React, { useEffect, useMemo, useRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { colors, fonts, radius } from "@/src/theme";

const ITEM_HEIGHT = 40;
const VISIBLE = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE;
const WHEEL_WIDTH = 64;

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
  const ref = useRef<ScrollView>(null);
  const initialIndex = Math.max(0, data.indexOf(value));

  // Keep the wheel in sync when the parent forces a new value (e.g. when
  // hydrating an existing alarm for editing).
  useEffect(() => {
    const idx = data.indexOf(value);
    if (idx >= 0) {
      ref.current?.scrollTo({
        y: idx * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [data, value]);

  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    const next = data[clamped];
    if (next !== value) onChange(next);
  };

  // react-native-web doesn't fire onScrollEndDrag/onMomentumScrollEnd
  // reliably for mouse-wheel / trackpad scrolls. Debouncing onScroll handles
  // that path while native uses the regular end handlers.
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const ne = e.nativeEvent;
    const idx = Math.round(ne.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    const next = data[clamped];
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      if (next !== value) onChange(next);
    }, 140);
  };

  return (
    <View style={styles.wheel} testID={testID}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: initialIndex * ITEM_HEIGHT }}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        onMomentumScrollEnd={commit}
        onScrollEndDrag={commit}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        {data.map((item) => {
          const isCenter = item === value;
          return (
            <View key={`${item}`} style={styles.wheelItem}>
              <Text
                style={[
                  styles.wheelText,
                  {
                    color: isCenter ? colors.textMain : colors.textMuted,
                    fontFamily: isCenter ? fonts.bold : fonts.medium,
                    opacity: isCenter ? 1 : 0.45,
                  },
                ]}
              >
                {pad ? `${item}`.padStart(2, "0") : `${item}`}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={[styles.selectionLine, { pointerEvents: "none" }]} />
    </View>
  );
};

export interface TimeValue {
  hour: number;
  minute: number;
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
                  borderColor: active ? colors.primaryDark : colors.shadow,
                },
              ]}
              testID={`time-picker-${m.toLowerCase()}`}
            >
              <Text
                style={[
                  styles.meridiemText,
                  { color: active ? colors.textInverse : colors.textMuted },
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
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 4,
    borderBottomColor: colors.shadow,
  },
  wheel: {
    width: WHEEL_WIDTH,
    height: WHEEL_HEIGHT,
    overflow: "hidden",
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelText: { fontSize: 22 },
  selectionLine: {
    position: "absolute",
    left: 2,
    right: 2,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
  },
  colon: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.textMain,
    paddingHorizontal: 2,
  },
  meridiemColumn: {
    marginLeft: 6,
    gap: 6,
  },
  meridiemBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: 48,
    alignItems: "center",
  },
  meridiemText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

export default TimePickerInline;
