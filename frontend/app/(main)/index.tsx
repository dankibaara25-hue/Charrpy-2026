// Alarms tab — title top-left + square 3D FAB top-right. Cards list each
// alarm with a per-row enable Switch. Long-press a card to delete.

import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import EmptyState from "@/src/components/EmptyState";
import {
  Alarm,
  deleteAlarm,
  formatTime,
  listAlarms,
  repeatLabel,
  saveAlarm,
} from "@/src/lib/alarms";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { findRingtone } from "@/src/onboarding/ringtones";

const FAB_DEPTH = 5;
const CARD_DEPTH = 5;

export default function AlarmsScreen() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [fabPressed, setFabPressed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      listAlarms().then((a) => {
        if (alive) setAlarms(a);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const toggleEnabled = async (a: Alarm) => {
    Haptics.selectionAsync().catch(() => {});
    const next = await saveAlarm({ ...a, enabled: !a.enabled });
    setAlarms(next);
  };

  const handleDelete = async (id: string) => {
    const next = await deleteAlarm(id);
    setAlarms(next);
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
      testID="alarms-screen"
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Alarms</Text>
          <Text style={styles.subtitle}>
            {alarms.length === 0
              ? "Add your first alarm."
              : `${alarms.length} ${alarms.length === 1 ? "alarm" : "alarms"} set.`}
          </Text>
        </View>
        <Pressable
          style={[styles.fab, fabPressed && styles.fabPressed]}
          onPressIn={() => {
            setFabPressed(true);
            Haptics.selectionAsync().catch(() => {});
          }}
          onPressOut={() => setFabPressed(false)}
          onPress={() => router.push("/alarm-edit")}
          testID="alarms-fab-add"
        >
          <Ionicons name="add" size={28} color={colors.textInverse} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {alarms.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState hint="No alarms yet." testID="alarms-empty" />
          </View>
        ) : (
          alarms.map((a) => (
            <AlarmCard
              key={a.id}
              alarm={a}
              onPress={() => router.push(`/alarm-edit?id=${a.id}`)}
              onToggle={() => toggleEnabled(a)}
              onDelete={() => handleDelete(a.id)}
              onPreview={() => router.push(`/alarm-ring?id=${a.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface AlarmCardProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onPress,
  onToggle,
  onDelete,
  onPreview,
}) => {
  const [pressed, setPressed] = useState(false);
  const ring = findRingtone(alarm.ringtoneId);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={styles.cardWrap}
      testID={`alarm-card-${alarm.id}`}
    >
      <View
        style={[
          styles.card,
          {
            borderBottomWidth: pressed ? 0 : CARD_DEPTH,
            marginTop: pressed ? CARD_DEPTH : 0,
            opacity: alarm.enabled ? 1 : 0.55,
          },
        ]}
      >
        <View style={styles.cardMain}>
          <Text style={styles.cardTime}>{formatTime(alarm)}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {repeatLabel(alarm)} · {ring?.label ?? "Ringtone"} ·{" "}
            {alarm.challenge}
          </Text>
          {alarm.nickname ? (
            <Text style={styles.cardNickname} numberOfLines={1}>
              {alarm.nickname}
            </Text>
          ) : null}
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.track, true: colors.primary }}
          thumbColor={colors.surface}
          testID={`alarm-toggle-${alarm.id}`}
        />
      </View>
      <Pressable
        onPress={(e) => {
          // Stop the row's onPress from also firing (which would route to
          // alarm-edit). Preview should only trigger the preview ring.
          e.stopPropagation?.();
          Haptics.selectionAsync().catch(() => {});
          onPreview();
        }}
        hitSlop={6}
        style={styles.previewBtn}
        testID={`alarm-preview-${alarm.id}`}
      >
        <Ionicons name="play" size={14} color={colors.primary} />
        <Text style={styles.previewLabel}>Preview</Text>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
    gap: space.md,
  },
  headerText: { flex: 1 },
  title: {
    ...type.h1,
    color: colors.textMain,
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: FAB_DEPTH,
    borderBottomColor: colors.shadow,
    alignItems: "center",
    justifyContent: "center",
  },
  fabPressed: {
    borderBottomWidth: 0,
    marginTop: FAB_DEPTH,
  },
  list: { padding: space.lg, paddingBottom: 120, flexGrow: 1 },
  emptyWrap: {
    flex: 1,
    minHeight: 360,
    justifyContent: "center",
  },
  cardWrap: { marginBottom: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomColor: colors.shadow,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardMain: { flex: 1 },
  cardTime: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.textMain,
    lineHeight: 30,
  },
  cardMeta: {
    ...type.caption,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    marginTop: 2,
    textTransform: "capitalize",
  },
  cardNickname: {
    ...type.body,
    color: colors.primary,
    fontFamily: fonts.semibold,
    marginTop: 4,
  },
  previewBtn: {
    position: "absolute",
    right: 12,
    bottom: -10,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: colors.primary,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  previewLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
