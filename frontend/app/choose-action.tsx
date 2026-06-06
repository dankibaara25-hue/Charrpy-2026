// Choose-action onboarding step ("how will you switch the alarm off?").
//
// Was previously hidden inside the alarm-edit action sheet. Promoting it
// to its own onboarding screen for two reasons:
//   1. It's the single most important configuration choice in the app, so
//      it deserves a dedicated moment rather than a buried picker.
//   2. Picking the challenge IS the natural priming for the camera
//      permission screen that follows. The user just picked "barcode" or
//      "photo" \u2192 of course we need the camera. Math? No camera step
//      needed, we skip straight to ringtone.
//
// Persists the choice into the pending-alarm draft so it survives the
// rest of onboarding and gets committed into the real list on first
// focus of the Alarms tab.

import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { type ChallengeKind } from "@/src/lib/alarms";
import { writePendingAlarm } from "@/src/lib/alarms";

interface Option {
  id: ChallengeKind;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
}

const OPTIONS: Option[] = [
  {
    id: "math",
    icon: "calculator",
    label: "Solve a sum",
    hint: "A quick equation gets you out of bed",
  },
  {
    id: "barcode",
    icon: "barcode",
    label: "Scan a barcode",
    hint: "Any product in the house counts",
  },
  {
    id: "photo",
    icon: "camera",
    label: "Snap an object",
    hint: "Photograph something you can't reach from bed",
  },
];

export default function ChooseAction() {
  const router = useRouter();
  const [selected, setSelected] = useState<ChallengeKind>("math");

  const handleContinue = async () => {
    await writePendingAlarm({ challenge: selected });
    Haptics.selectionAsync().catch(() => {});
    // If the user picked the math challenge we don't actually need the
    // camera, so we skip that permission step and jump straight to
    // ringtone selection. For barcode / photo challenges the camera step
    // is genuinely required and stays in the chain.
    const next =
      selected === "math"
        ? "/ringtone-select"
        : "/camera-permission?next=" + encodeURIComponent("/ringtone-select");
    router.push(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Switch it off how?</Text>
        <Text style={styles.subtitle}>
          Pick the task you'll do at 7am. You can change it any time.
        </Text>

        <View style={styles.list}>
          {OPTIONS.map((o) => {
            const active = o.id === selected;
            return (
              <Pressable
                key={o.id}
                onPress={() => {
                  setSelected(o.id);
                  Haptics.selectionAsync().catch(() => {});
                }}
                style={({ pressed }) => [
                  styles.card,
                  {
                    borderColor: active ? colors.primary : colors.shadow,
                    borderBottomColor: active
                      ? colors.primaryDark
                      : colors.shadow,
                    borderBottomWidth: pressed ? 0 : 5,
                    marginTop: pressed ? 5 : 0,
                    backgroundColor: active ? colors.surfaceMuted : colors.surface,
                  },
                ]}
                testID={`choose-action-${o.id}`}
              >
                <View
                  style={[
                    styles.iconBubble,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primaryDark : colors.shadow,
                    },
                  ]}
                >
                  <Ionicons
                    name={o.icon}
                    size={22}
                    color={active ? colors.textInverse : colors.textMain}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{o.label}</Text>
                  <Text style={styles.hint}>{o.hint}</Text>
                </View>
                <Ionicons
                  name={active ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={active ? colors.primary : colors.shadow}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button3D
          label="Continue"
          onPress={handleContinue}
          testID="choose-action-continue"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    minHeight: 48,
    justifyContent: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  title: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: space.xs,
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: space.lg,
    paddingHorizontal: space.sm,
  },
  list: {
    gap: 14,
    marginTop: space.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 5,
    borderBottomColor: colors.shadow,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderBottomWidth: 3,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.textMain,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
