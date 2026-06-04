// Set alarm — last gate before the paywall. Reuses the inline time picker.
// The chosen time + ringtone are stored locally and shown summarised on the
// paywall, so the moment of "high intent" carries forward into conversion.

import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Button3D from "@/src/components/Button3D";
import TimePickerInline, {
  TimeValue,
} from "@/src/components/TimePickerInline";
import { colors, fonts, radius, space, type } from "@/src/theme";
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
    router.push("/paywall");
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
        <View style={styles.iconBadge}>
          <Ionicons name="alarm" size={36} color={colors.textInverse} />
        </View>
        <Text style={styles.title}>Set your alarm</Text>
        <Text style={styles.subtitle}>This is tomorrow&apos;s win.</Text>

        <View style={styles.pickerWrap}>
          <TimePickerInline value={time} onChange={setTime} />
        </View>

        <View style={styles.previewCard}>
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          <Text style={styles.previewText}>
            Wake up at{" "}
            <Text style={styles.previewTime}>
              {time.hour}:{String(time.minute).padStart(2, "0")} {time.meridiem}
            </Text>
          </Text>
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
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDark,
    marginBottom: space.md,
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
    marginBottom: space.lg,
  },
  pickerWrap: { width: "100%", marginBottom: space.lg },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 4,
    borderBottomColor: colors.shadow,
    paddingHorizontal: space.md,
    paddingVertical: 12,
  },
  previewText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMain,
  },
  previewTime: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
