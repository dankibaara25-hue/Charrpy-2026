// Set alarm — dedicated time picker right before the paywall (the high-intent
// moment). Lean layout per spec: no icon badge above, no preview pill below.

import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Button3D from "@/src/components/Button3D";
import TimePickerInline, {
  TimeValue,
} from "@/src/components/TimePickerInline";
import { colors, fonts, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";

const DEFAULT_TIME: TimeValue = { hour: 7, minute: 0, meridiem: "AM" };

export default function SetAlarm() {
  const router = useRouter();
  const [time, setTime] = useState<TimeValue>(DEFAULT_TIME);

  const handleContinue = async () => {
    await storage.setItem(
      "charrpy.alarm.time",
      `${time.hour}:${String(time.minute).padStart(2, "0")} ${time.meridiem}`,
    );
    router.push("/ringtone-select");
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="set-alarm-screen"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          testID="set-alarm-back-button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Set your alarm</Text>
        <Text style={styles.subtitle}>This is tomorrow&apos;s win.</Text>

        <View style={styles.pickerWrap}>
          <TimePickerInline value={time} onChange={setTime} />
        </View>
      </View>

      <View style={styles.footer}>
        <Button3D
          label="Lock it in"
          onPress={handleContinue}
          testID="set-alarm-continue-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: space.xl,
  },
  pickerWrap: { width: "100%" },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
