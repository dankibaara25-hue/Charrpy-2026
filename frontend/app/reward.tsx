// Streak reward screen — shown after a wake-up challenge is beaten. Layout
// adapted from the user-supplied reference (Duolingo-style) but rendered in
// Charrpy's warm-cream palette with our 3D Duolingo treatment on the day
// chips:
//   • Flame GIF up top.
//   • Big day count + "day streak" caption.
//   • Mo→Su strip — completed days = filled orange circle with checkmark
//     + 3D bottom-border depth; pending days = neutral grey circle.
//   • Continue → /(main).
//
// On mount we call `recordChallengeWin()` which is idempotent across same-day
// re-entries, so refreshing the page won't double-count the streak.

import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import Button3D from "@/src/components/Button3D";
import { colors, fonts, space, type } from "@/src/theme";
import {
  WEEK_DAYS_MON_FIRST,
  XP_PER_WIN,
  awardXp,
  buildCurrentWeek,
  readXp,
  recordChallengeWin,
  type WeekDayEntry,
} from "@/src/lib/streak";

const STREAK_GIF = require("../assets/images/gamification/streak.gif");

const CHIP_DEPTH = 5;

export default function Reward() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [count, setCount] = useState<number | null>(null);
  const [week, setWeek] = useState<WeekDayEntry[]>([]);
  const [xp, setXp] = useState<number>(0);

  useEffect(() => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});

    (async () => {
      const { state, advanced } = await recordChallengeWin();
      setCount(state.count);
      setWeek(buildCurrentWeek(state));
      const nextXp = advanced ? await awardXp(XP_PER_WIN) : await readXp();
      setXp(nextXp);
    })();
  }, []);

  const headline = count ?? 0;
  const challengeLabel =
    from === "barcode"
      ? "Barcode scanned!"
      : from === "photo"
        ? "Photo captured!"
        : "Math conquered!";

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="reward-screen"
    >
      <View style={styles.body}>
        <Image
          source={STREAK_GIF}
          style={styles.flame}
          resizeMode="contain"
          testID="reward-streak-flame"
        />

        <Text style={styles.count} testID="reward-streak-count">
          {headline}
        </Text>
        <Text style={styles.kicker}>day streak</Text>

        <View style={styles.weekRow} testID="reward-week-row">
          {(week.length ? week : placeholderWeek()).map((d) => (
            <DayChip key={d.iso} entry={d} />
          ))}
        </View>

        <Text style={styles.challengeLine}>{challengeLabel}</Text>
        <Text style={styles.xpLine}>+{XP_PER_WIN} XP · {xp} total</Text>
      </View>

      <View style={styles.footer}>
        <Button3D
          label="Continue"
          onPress={() => router.replace("/(main)")}
          testID="reward-continue-button"
        />
      </View>
    </SafeAreaView>
  );
}

// Local helper so the screen renders something the moment it mounts, before
// the async storage read resolves.
const placeholderWeek = (): WeekDayEntry[] =>
  WEEK_DAYS_MON_FIRST.map((label) => ({
    iso: label,
    label,
    completed: false,
    isToday: false,
  }));

interface DayChipProps {
  entry: WeekDayEntry;
}

const DayChip: React.FC<DayChipProps> = ({ entry }) => {
  const filled = entry.completed;
  const bg = filled ? colors.primary : colors.surface;
  const border = filled ? colors.primaryDark : colors.shadowSoft;
  return (
    <View style={styles.dayColumn}>
      <Text
        style={[
          styles.dayLabel,
          {
            color: entry.isToday ? colors.primary : colors.textMuted,
            fontFamily: entry.isToday ? fonts.bold : fonts.medium,
          },
        ]}
      >
        {entry.label}
      </Text>
      <View
        style={[
          styles.dayChip,
          {
            backgroundColor: bg,
            borderColor: border,
            borderBottomColor: border,
            borderBottomWidth: CHIP_DEPTH,
          },
          entry.isToday && !filled && styles.dayChipToday,
        ]}
      >
        {filled ? (
          <Ionicons
            name="checkmark"
            size={22}
            color={colors.textInverse}
            style={styles.checkIcon}
          />
        ) : null}
      </View>
    </View>
  );
};

// Re-import the storage XP read directly so the placeholder isn't async on
// load. (Imported lazily to keep the top of the file tidy.)

const CHIP_SIZE = 38;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  flame: {
    width: 160,
    height: 160,
    marginBottom: space.sm,
  },
  count: {
    fontFamily: fonts.bold,
    fontSize: 96,
    lineHeight: 100,
    color: colors.primary,
    textAlign: "center",
    letterSpacing: -1,
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.primary,
    marginBottom: space.xl,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: space.xs,
    marginBottom: space.lg,
  },
  dayColumn: {
    alignItems: "center",
    gap: 6,
  },
  dayLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dayChip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipToday: {
    borderColor: colors.primary,
    borderBottomColor: colors.primary,
  },
  checkIcon: {
    // Nudge the check up by a hair so it visually centers inside the chip
    // with the bottom-border depth.
    marginTop: -2,
  },
  challengeLine: {
    ...type.body,
    color: colors.textMain,
    fontFamily: fonts.semibold,
    textAlign: "center",
  },
  xpLine: {
    ...type.caption,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
