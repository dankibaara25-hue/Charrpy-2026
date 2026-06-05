// Alarm-edit modal — used both for creating a new alarm and editing an
// existing one. Layout reference: the dark mock the user shared (X / ✓ in
// the header, big time wheel, then a stack of row-cards for Action, Repeat,
// Sound, Announcement, Nickname, followed by a Volume slider + Crescendo
// toggle). We keep the Charrpy Duolingo-3D treatment on every card.

import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";

import TimePickerInline from "@/src/components/TimePickerInline";
import Button3D from "@/src/components/Button3D";
import { colors, fonts, radius, space, type } from "@/src/theme";
import {
  Alarm,
  ChallengeKind,
  Repeat,
  defaultAlarm,
  deleteAlarm,
  getAlarm,
  saveAlarm,
} from "@/src/lib/alarms";
import { RINGTONES, findRingtone } from "@/src/onboarding/ringtones";

const CHALLENGES: { id: ChallengeKind; label: string; hint: string }[] = [
  { id: "math", label: "Math", hint: "Solve a quick equation" },
  { id: "barcode", label: "Barcode", hint: "Scan a barcode (Pro)" },
  { id: "photo", label: "Photo", hint: "Snap a target photo (Pro)" },
];

const REPEAT_OPTIONS: { id: Repeat; label: string }[] = [
  { id: "once", label: "Once" },
  { id: "daily", label: "Daily" },
  { id: "weekdays", label: "Weekdays" },
  { id: "weekends", label: "Weekends" },
  { id: "custom", label: "Custom" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AlarmEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [sheet, setSheet] = useState<null | "action" | "repeat" | "sound" | "nickname">(null);

  useEffect(() => {
    (async () => {
      if (id) {
        const existing = await getAlarm(id);
        if (existing) {
          setAlarm(existing);
          return;
        }
      }
      setAlarm(defaultAlarm());
    })();
  }, [id]);

  if (!alarm) {
    return <SafeAreaView style={styles.safe} edges={["top", "bottom"]} />;
  }

  const update = (patch: Partial<Alarm>) =>
    setAlarm((a) => (a ? { ...a, ...patch } : a));

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    await saveAlarm(alarm);
    router.back();
  };

  const handleDelete = async () => {
    if (!id) {
      router.back();
      return;
    }
    await deleteAlarm(id);
    router.back();
  };

  const ringtoneLabel = findRingtone(alarm.ringtoneId)?.label ?? "Pick";
  const challengeLabel =
    CHALLENGES.find((c) => c.id === alarm.challenge)?.label ?? "Pick";

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="alarm-edit-screen"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.iconBtn}
          testID="alarm-edit-close-button"
        >
          <Ionicons name="close" size={28} color={colors.textMain} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {id ? "Edit alarm" : "New alarm"}
        </Text>
        <Pressable
          onPress={handleSave}
          hitSlop={12}
          style={styles.iconBtn}
          testID="alarm-edit-save-button"
        >
          <Ionicons name="checkmark" size={28} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <TimePickerInline
          value={{
            hour: alarm.hour,
            minute: alarm.minute,
            meridiem: alarm.meridiem,
          }}
          onChange={(t) =>
            update({ hour: t.hour, minute: t.minute, meridiem: t.meridiem })
          }
        />

        <View style={{ height: space.lg }} />

        <Row
          label="Action"
          value={challengeLabel}
          onPress={() => setSheet("action")}
          testID="alarm-row-action"
        />
        <Row
          label="Repeat"
          value={
            alarm.repeat === "custom"
              ? alarm.customDays.length
                ? alarm.customDays.sort().map((d) => DAY_NAMES[d][0]).join(" ")
                : "Custom"
              : REPEAT_OPTIONS.find((r) => r.id === alarm.repeat)?.label ?? ""
          }
          onPress={() => setSheet("repeat")}
          testID="alarm-row-repeat"
        />
        <Row
          label="Sound"
          value={ringtoneLabel}
          onPress={() => setSheet("sound")}
          testID="alarm-row-sound"
        />
        <Row
          label="Nickname"
          value={alarm.nickname || "—"}
          onPress={() => setSheet("nickname")}
          testID="alarm-row-nickname"
        />

        <ToggleRow
          label="Announcement"
          hint="Speak the time when the alarm rings"
          value={alarm.announcement}
          onValueChange={(v) => update({ announcement: v })}
          testID="alarm-row-announcement"
        />

        <View style={styles.volumeCard}>
          <View style={styles.volumeHeader}>
            <Ionicons name="volume-high" size={22} color={colors.textMain} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={alarm.volume}
              onValueChange={(v) => update({ volume: v })}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.track}
              thumbTintColor={colors.surface}
              testID="alarm-volume-slider"
            />
          </View>
          <View style={styles.crescendoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Crescendo</Text>
              <Text style={styles.rowHint}>Gradually increase volume</Text>
            </View>
            <Switch
              value={alarm.crescendo}
              onValueChange={(v) => update({ crescendo: v })}
              trackColor={{ false: colors.track, true: colors.primary }}
              thumbColor={colors.surface}
              testID="alarm-crescendo-toggle"
            />
          </View>
        </View>

        {id ? (
          <>
            <View style={{ height: space.lg }} />
            <Button3D
              label="Test alarm"
              variant="secondary"
              onPress={() => router.push(`/alarm-ring?id=${id}`)}
              testID="alarm-test-button"
            />
            <View style={{ height: space.sm }} />
            <Button3D
              label="Delete alarm"
              variant="secondary"
              onPress={handleDelete}
              testID="alarm-delete-button"
            />
          </>
        ) : null}
      </ScrollView>

      <ActionSheet
        visible={sheet === "action"}
        title="Pick a challenge"
        onClose={() => setSheet(null)}
      >
        {CHALLENGES.map((c) => (
          <PickerOption
            key={c.id}
            label={c.label}
            hint={c.hint}
            selected={alarm.challenge === c.id}
            onPress={() => {
              update({ challenge: c.id });
              setSheet(null);
            }}
          />
        ))}
      </ActionSheet>

      <ActionSheet
        visible={sheet === "repeat"}
        title="Repeat"
        onClose={() => setSheet(null)}
      >
        {REPEAT_OPTIONS.map((r) => (
          <PickerOption
            key={r.id}
            label={r.label}
            selected={alarm.repeat === r.id}
            onPress={() => update({ repeat: r.id })}
          />
        ))}
        {alarm.repeat === "custom" ? (
          <View style={styles.daysRow}>
            {DAY_NAMES.map((d, i) => {
              const on = alarm.customDays.includes(i);
              return (
                <Pressable
                  key={d}
                  onPress={() => {
                    const next = on
                      ? alarm.customDays.filter((x) => x !== i)
                      : [...alarm.customDays, i];
                    update({ customDays: next });
                  }}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: on ? colors.primary : colors.surface,
                      borderColor: on ? colors.primaryDark : colors.shadow,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      { color: on ? colors.textInverse : colors.textMain },
                    ]}
                  >
                    {d[0]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <View style={{ height: 8 }} />
        <Button3D label="Done" onPress={() => setSheet(null)} />
      </ActionSheet>

      <ActionSheet
        visible={sheet === "sound"}
        title="Pick a ringtone"
        onClose={() => setSheet(null)}
      >
        {RINGTONES.map((r) => (
          <PickerOption
            key={r.id}
            label={r.label}
            hint={r.vibe}
            selected={alarm.ringtoneId === r.id}
            onPress={() => {
              update({ ringtoneId: r.id });
              setSheet(null);
            }}
          />
        ))}
      </ActionSheet>

      <ActionSheet
        visible={sheet === "nickname"}
        title="Nickname"
        onClose={() => setSheet(null)}
      >
        <TextInput
          value={alarm.nickname}
          onChangeText={(v) => update({ nickname: v })}
          placeholder="Morning run"
          placeholderTextColor={colors.shadowSoft}
          style={styles.nickInput}
          maxLength={32}
          autoFocus
          testID="alarm-nickname-input"
        />
        <View style={{ height: 8 }} />
        <Button3D label="Done" onPress={() => setSheet(null)} />
      </ActionSheet>
    </SafeAreaView>
  );
}

const Row: React.FC<{
  label: string;
  value: string;
  onPress: () => void;
  testID: string;
}> = ({ label, value, onPress, testID }) => (
  <Pressable onPress={onPress} testID={testID} style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </View>
  </Pressable>
);

const ToggleRow: React.FC<{
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  testID: string;
}> = ({ label, hint, value, onValueChange, testID }) => (
  <View style={styles.row} testID={testID}>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.track, true: colors.primary }}
      thumbColor={colors.surface}
    />
  </View>
);

const ActionSheet: React.FC<{
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ visible, title, onClose, children }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMain} />
          </Pressable>
        </View>
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);

const PickerOption: React.FC<{
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, hint, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.pickerOption,
      {
        backgroundColor: selected ? "#FFE3BD" : colors.surface,
        borderColor: selected ? colors.primary : colors.shadow,
      },
    ]}
  >
    <View style={{ flex: 1 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
    </View>
    {selected ? (
      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...type.h3,
    flex: 1,
    textAlign: "center",
    color: colors.textMain,
    fontFamily: fonts.bold,
  },
  body: {
    paddingHorizontal: space.lg,
    paddingBottom: space.massive,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 4,
    borderBottomColor: colors.shadow,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    minHeight: 56,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "55%",
  },
  rowLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textMain,
  },
  rowValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "right",
  },
  rowHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  volumeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 4,
    borderBottomColor: colors.shadow,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    marginTop: 10,
    gap: 14,
  },
  volumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slider: { flex: 1, height: 40 },
  crescendoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(42, 26, 10, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: space.lg,
    borderTopWidth: 3,
    borderTopColor: colors.shadow,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: space.md,
  },
  sheetTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.textMain,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: space.md,
    paddingHorizontal: 4,
    gap: 6,
  },
  dayChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  nickInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.shadow,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.textMain,
  },
});
