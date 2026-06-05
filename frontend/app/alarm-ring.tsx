// Alarm-ring screen — full-screen takeover when an alarm fires (or when the
// user taps the "Test alarm" button from alarm-edit). Plays the alarm's
// ringtone in a loop while the screen is mounted, hosts the per-challenge
// UI (Math today, Barcode/Photo to come), and only routes back when the
// user beats the challenge.
//
// Audio lifecycle: createAudioPlayer once on first paint, set loop=true,
// release on unmount. We hold the player in a ref so re-renders don't leak.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";

import Button3D from "@/src/components/Button3D";
import ProgressBar from "@/src/components/ProgressBar";
import { colors, fonts, radius, space, type } from "@/src/theme";
import {
  Alarm,
  defaultAlarm,
  formatTime,
  getAlarm,
} from "@/src/lib/alarms";
import { findRingtone } from "@/src/onboarding/ringtones";
import {
  Equation,
  generateChallenge,
  reshuffleAt,
} from "@/src/challenges/math";

const REQUIRED_CORRECT = 3;

export default function AlarmRing() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [alarm, setAlarm] = useState<Alarm | null>(null);

  // Audio kept in a ref so re-renders don't tear it down.
  const playerRef = useRef<AudioPlayer | null>(null);
  const stoppedRef = useRef(false);

  // Challenge state
  const [equations, setEquations] = useState<Equation[]>(() =>
    generateChallenge(REQUIRED_CORRECT),
  );
  const [solvedIdx, setSolvedIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);

  // Load alarm + start ringtone.
  useEffect(() => {
    let alive = true;
    (async () => {
      const a = id ? await getAlarm(id) : undefined;
      const target = a ?? defaultAlarm();
      if (!alive) return;
      setAlarm(target);

      const ring = findRingtone(target.ringtoneId);
      if (!ring) return;
      try {
        const p = createAudioPlayer(ring.source);
        p.loop = true;
        p.volume = target.crescendo ? 0.15 : target.volume;
        p.play();
        playerRef.current = p;
      } catch (e) {
        console.warn("[ring] audio start failed", e);
      }
    })();
    return () => {
      alive = false;
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Optional crescendo ramp.
  useEffect(() => {
    if (!alarm?.crescendo) return;
    const start = Date.now();
    const target = Math.max(0.2, Math.min(1, alarm.volume));
    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const elapsed = (Date.now() - start) / 1000;
      const next = Math.min(target, 0.15 + elapsed * 0.05);
      try {
        p.volume = next;
      } catch {
        /* noop */
      }
      if (next >= target) clearInterval(interval);
    }, 600);
    return () => clearInterval(interval);
  }, [alarm?.crescendo, alarm?.volume]);

  const stopAudio = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    try {
      playerRef.current?.pause();
      playerRef.current?.remove();
    } catch {
      /* noop */
    }
    playerRef.current = null;
  }, []);

  const currentEquation = equations[solvedIdx];
  const progress =
    REQUIRED_CORRECT === 0 ? 1 : solvedIdx / REQUIRED_CORRECT;

  const handleDigit = (d: string) => {
    if (input.length >= 5) return;
    Haptics.selectionAsync().catch(() => {});
    setFeedback(null);
    setInput((s) => (s === "" && d === "0" ? "0" : s + d));
  };

  const handleClear = () => {
    Haptics.selectionAsync().catch(() => {});
    setInput("");
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!currentEquation || input === "") return;
    const guess = Number(input);
    if (Number.isNaN(guess)) return;

    if (guess === currentEquation.answer) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
      setFeedback("ok");
      const nextSolved = solvedIdx + 1;
      setInput("");
      if (nextSolved >= REQUIRED_CORRECT) {
        // All done — kill audio + leave.
        stopAudio();
        setTimeout(() => router.back(), 400);
      } else {
        setTimeout(() => {
          setSolvedIdx(nextSolved);
          setFeedback(null);
        }, 320);
      }
    } else {
      // Reshuffle the current slot per spec — no penalty, new equation.
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      ).catch(() => {});
      setFeedback("bad");
      setInput("");
      setTimeout(() => {
        setEquations((eqs) => reshuffleAt(eqs, solvedIdx));
        setFeedback(null);
      }, 320);
    }
  };

  const handleBack = () => {
    stopAudio();
    router.back();
  };

  const numpad = useMemo(
    () => [
      ["7", "8", "9"],
      ["4", "5", "6"],
      ["1", "2", "3"],
      ["clear", "0", "submit"] as const,
    ],
    [],
  );

  if (!alarm) {
    return <SafeAreaView style={styles.safe} edges={["top", "bottom"]} />;
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="alarm-ring-screen"
    >
      <View style={styles.header}>
        <Text style={styles.time}>{formatTime(alarm)}</Text>
        <Text style={styles.kicker}>
          QUESTION {Math.min(solvedIdx + 1, REQUIRED_CORRECT)} OF{" "}
          {REQUIRED_CORRECT}
        </Text>
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} testID="alarm-ring-progress" />
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.equation} testID="alarm-ring-equation">
          {currentEquation?.expression ?? ""}
        </Text>
        <View
          style={[
            styles.answerBox,
            feedback === "ok" && { borderColor: colors.success },
            feedback === "bad" && { borderColor: colors.danger },
          ]}
        >
          <Text style={styles.answerText} testID="alarm-ring-answer">
            {input === "" ? "0" : input}
          </Text>
        </View>
      </View>

      <View style={styles.pad}>
        {numpad.map((row, ri) => (
          <View key={`r-${ri}`} style={styles.padRow}>
            {row.map((k) => {
              if (k === "clear") {
                return (
                  <PadKey
                    key="clear"
                    variant="secondary"
                    onPress={handleClear}
                    testID="alarm-ring-key-clear"
                  >
                    <Ionicons
                      name="refresh"
                      size={26}
                      color={colors.textMain}
                    />
                  </PadKey>
                );
              }
              if (k === "submit") {
                return (
                  <PadKey
                    key="submit"
                    variant="submit"
                    onPress={handleSubmit}
                    testID="alarm-ring-key-submit"
                  >
                    <Ionicons
                      name="send"
                      size={24}
                      color={colors.textInverse}
                    />
                  </PadKey>
                );
              }
              return (
                <PadKey
                  key={k}
                  onPress={() => handleDigit(k)}
                  testID={`alarm-ring-key-${k}`}
                >
                  <Text style={styles.padDigit}>{k}</Text>
                </PadKey>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button3D
          label="Back"
          variant="secondary"
          onPress={handleBack}
          testID="alarm-ring-back-button"
        />
      </View>
    </SafeAreaView>
  );
}

type KeyVariant = "primary" | "secondary" | "submit";

const PadKey: React.FC<{
  variant?: KeyVariant;
  onPress: () => void;
  testID?: string;
  children: React.ReactNode;
}> = ({ variant = "primary", onPress, testID, children }) => {
  const [pressed, setPressed] = useState(false);
  const palette =
    variant === "submit"
      ? { bg: colors.primary, border: colors.primaryDark }
      : variant === "secondary"
        ? { bg: colors.surface, border: colors.shadow }
        : { bg: colors.surface, border: colors.shadow };
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        setPressed(true);
        Haptics.selectionAsync().catch(() => {});
      }}
      onPressOut={() => setPressed(false)}
      testID={testID}
      style={[
        styles.padKey,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderBottomColor: palette.border,
          borderBottomWidth: pressed ? 0 : 5,
          marginTop: pressed ? 5 : 0,
        },
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
    alignItems: "flex-start",
  },
  time: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.primary,
    marginBottom: 4,
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: space.sm,
  },
  progressWrap: { width: "100%" },
  questionCard: {
    marginHorizontal: space.lg,
    marginTop: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 5,
    borderBottomColor: colors.shadow,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  equation: {
    fontFamily: fonts.semibold,
    fontSize: 36,
    color: colors.textMain,
    textAlign: "left",
    marginBottom: space.md,
  },
  answerBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.shadow,
    paddingHorizontal: space.md,
    paddingVertical: 14,
  },
  answerText: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    color: colors.textMain,
  },
  pad: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  padRow: {
    flexDirection: "row",
    gap: 12,
  },
  padKey: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  padDigit: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.textMain,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});

// Force-reference unused type imports so TS doesn't drop them.
export type _Unused = typeof type;
