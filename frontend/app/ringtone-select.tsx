// Ringtone selection — list of locally-bundled clips with radio rows.
// Tapping a row both selects it and previews the audio. Picking another row
// stops the previous preview; leaving the screen stops playback.
//
// Audio lifecycle uses a ref (not state) so:
//   1. Successive rapid taps don't fight stale closures — `playerRef.current`
//      is always the live player on every render.
//   2. We can pause() BEFORE remove() to guarantee the previous clip stops
//      bleeding into the next selection (this fixes the bug where the first
//      audio kept playing under the second).
//   3. Reselecting the same row replays the clip from the top (instead of
//      silently no-op'ing because we left the previous player attached).

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";

import Button3D from "@/src/components/Button3D";
import { ONBOARDING_RINGTONES as RINGTONES } from "@/src/onboarding/ringtones";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";

const DEPTH = 4;

export default function RingtoneSelect() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Live audio player ref. Keeping this off React state means every call to
  // `previewAndSelect` reads + writes the same value without closure issues.
  const playerRef = useRef<AudioPlayer | null>(null);

  const stopCurrent = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.pause();
    } catch {
      /* noop */
    }
    try {
      p.remove();
    } catch {
      /* noop */
    }
    playerRef.current = null;
  }, []);

  // Hard stop on unmount so audio doesn't leak when leaving the screen.
  useEffect(() => stopCurrent, [stopCurrent]);

  const previewAndSelect = (id: string) => {
    const ring = RINGTONES.find((r) => r.id === id);
    if (!ring) return;

    Haptics.selectionAsync().catch(() => {});

    // Tear down the previous clip BEFORE creating the next one. Both calls
    // (pause + remove) tolerate failure — expo-audio occasionally throws if
    // the player was already disposed (e.g. component unmount race).
    stopCurrent();

    setSelected(id);
    setPlayingId(id);

    try {
      const p = createAudioPlayer(ring.source);
      playerRef.current = p;
      const result = p.play();
      // expo-audio on web returns a Promise that rejects when the page
      // hasn't yet received a user gesture — swallow it so no pageerror.
      if (result && typeof (result as Promise<unknown>).catch === "function") {
        (result as Promise<unknown>).catch(() => {});
      }
    } catch (e) {
      console.warn("[ringtone-select] preview failed", e);
      playerRef.current = null;
      setPlayingId(null);
    }
  };

  const handleContinue = async () => {
    if (!selected) return;
    stopCurrent();
    await storage.setItem("charrpy.ringtone.id", selected);
    router.push("/notifications-permission");
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="ringtone-select-screen"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            stopCurrent();
            router.back();
          }}
          hitSlop={12}
          style={styles.backBtn}
          testID="ringtone-select-back-button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.title}>Pick a ringtone</Text>
        <Text style={styles.subtitle}>Tap to preview.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {RINGTONES.map((r) => (
          <RingtoneRow
            key={r.id}
            label={r.label}
            vibe={r.vibe}
            selected={selected === r.id}
            playing={playingId === r.id}
            onPress={() => previewAndSelect(r.id)}
            testID={`ringtone-row-${r.id}`}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button3D
          label="Continue"
          onPress={handleContinue}
          disabled={!selected}
          testID="ringtone-select-continue-button"
        />
      </View>
    </SafeAreaView>
  );
}

interface RingtoneRowProps {
  label: string;
  vibe: string;
  selected: boolean;
  playing: boolean;
  onPress: () => void;
  testID: string;
}

const RingtoneRow: React.FC<RingtoneRowProps> = ({
  label,
  vibe,
  selected,
  playing,
  onPress,
  testID,
}) => {
  const [pressed, setPressed] = useState(false);
  const bg = selected ? "#FFE3BD" : colors.surface;
  const border = selected ? colors.primary : colors.shadow;
  const bottom = selected ? colors.primaryDark : colors.shadow;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      testID={testID}
      style={styles.rowWrap}
    >
      <View
        style={[
          styles.row,
          {
            backgroundColor: bg,
            borderColor: border,
            borderBottomColor: bottom,
            borderBottomWidth: pressed ? 0 : DEPTH,
            marginTop: pressed ? DEPTH : 0,
          },
        ]}
      >
        <View
          style={[
            styles.radio,
            {
              borderColor: selected ? colors.primary : colors.shadow,
              backgroundColor: selected ? colors.primary : "transparent",
            },
          ]}
        >
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowVibe}>{vibe}</Text>
        </View>
        <Ionicons
          name={playing ? "volume-high" : "play"}
          size={22}
          color={selected ? colors.primary : colors.textMuted}
        />
      </View>
    </Pressable>
  );
};

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
  intro: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  title: { ...type.h1, color: colors.textMain, marginBottom: 2 },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
  },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  rowWrap: { width: "100%", marginBottom: 12 },
  row: {
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 64,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textInverse,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textMain,
  },
  rowVibe: {
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
