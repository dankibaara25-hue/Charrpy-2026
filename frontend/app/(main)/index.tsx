// Alarms tab — title top-left + square 3D FAB top-right. Cards list each
// alarm with a per-row enable Switch. Long-press a card to delete.
//
// Two permission-aware behaviours live on this screen:
//
//   1. Post-paywall one-shot: the very first time the user lands here
//      after onboarding (tracked via the `charrpy.perms.postPaywallShown`
//      flag), if any permission they need is still missing we push them
//      through the dedicated permission screens once and only once.
//
//   2. Per-card "i" affordance: each alarm card surfaces a small circular
//      "info" badge in the top-right corner when that specific alarm is
//      missing a permission it actually needs (notifications for every
//      alarm; camera only for barcode/photo challenges). Tapping the
//      badge routes the user through exactly the missing permission
//      screens \u2014 no full-app blocking, no surprise prompts.

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
  hydratePendingAlarm,
  listAlarms,
  repeatLabel,
  saveAlarm,
} from "@/src/lib/alarms";
import {
  AlarmPermissionStatus,
  buildPermissionChain,
  getAlarmPermissionStatus,
  missingForAlarm,
} from "@/src/lib/permissions";
import { storage } from "@/src/utils/storage";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { findRingtone } from "@/src/onboarding/ringtones";

const FAB_DEPTH = 5;
const CARD_DEPTH = 5;

const POST_PAYWALL_FLAG = "charrpy.perms.postPaywallShown";

export default function AlarmsScreen() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [fabPressed, setFabPressed] = useState(false);
  const [permStatus, setPermStatus] = useState<AlarmPermissionStatus | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        // 1. Flush any onboarding draft into the real list (no-op when
        //    there's nothing pending).
        await hydratePendingAlarm().catch((e) =>
          console.warn("[alarms] hydratePendingAlarm failed", e),
        );

        // 2. Reload alarms + live permission status in parallel.
        const [a, ps] = await Promise.all([
          listAlarms(),
          getAlarmPermissionStatus(),
        ]);
        if (!alive) return;
        setAlarms(a);
        setPermStatus(ps);

        // 3. Post-paywall one-shot: only ever runs once. If the user is
        //    missing anything, walk them through the missing screens once
        //    and mark the flag so we never auto-push again. The per-card
        //    "i" icon takes over from here.
        const seen = await storage.getItem(POST_PAYWALL_FLAG, "");
        if (!seen && ps.missing.length > 0) {
          // Mark BEFORE pushing so a hot-reload / fast remount cannot
          // double-trigger the chain.
          await storage.setItem(POST_PAYWALL_FLAG, "1");
          const chain = buildPermissionChain(ps.missing, "/(main)");
          if (chain && alive) {
            router.replace(chain as never);
            return;
          }
        } else if (!seen) {
          // Nothing missing on first paint — still set the flag so we
          // never bother checking again.
          await storage.setItem(POST_PAYWALL_FLAG, "1");
        }
      })();
      return () => {
        alive = false;
      };
    }, [router]),
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

  // Per-card: tap the "i" badge → push the chain of just the screens this
  // alarm actually needs, ending back at /(main).
  const handleFixPermissions = (alarm: Alarm) => {
    if (!permStatus) return;
    const missing = missingForAlarm(permStatus, alarm.challenge);
    const chain = buildPermissionChain(missing, "/(main)");
    if (chain) {
      Haptics.selectionAsync().catch(() => {});
      router.push(chain as never);
    }
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
          alarms.map((a) => {
            const missing = permStatus ? missingForAlarm(permStatus, a.challenge) : [];
            return (
              <AlarmCard
                key={a.id}
                alarm={a}
                missingPermissions={missing.length}
                onPress={() => router.push(`/alarm-edit?id=${a.id}`)}
                onToggle={() => toggleEnabled(a)}
                onDelete={() => handleDelete(a.id)}
                onPreview={() => router.push(`/alarm-ring?id=${a.id}`)}
                onFixPermissions={() => handleFixPermissions(a)}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface AlarmCardProps {
  alarm: Alarm;
  missingPermissions: number;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onFixPermissions: () => void;
}

const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  missingPermissions,
  onPress,
  onToggle,
  onDelete,
  onPreview,
  onFixPermissions,
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

      {/* Small info badge — only when this specific alarm is missing a
          permission it actually needs. Tap to walk through just those. */}
      {missingPermissions > 0 ? (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onFixPermissions();
          }}
          hitSlop={8}
          style={styles.infoBadge}
          testID={`alarm-perm-info-${alarm.id}`}
          accessibilityLabel="Some permissions are missing for this alarm. Tap to fix."
        >
          <Ionicons name="information" size={14} color={colors.textInverse} />
        </Pressable>
      ) : null}

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
  // Small attention badge top-right of the card. Pure 3D depth (bottom
  // shadow only) so it sits cleanly on the cream surface without a
  // heavy black outline competing with the card's own border.
  infoBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderBottomWidth: 3,
    borderBottomColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
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
