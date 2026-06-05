// Photo dismissal challenge — full-screen camera with a SQUARE dashed orange
// frame overlay. App prompts the user to capture a random household object
// (water glass, fridge, toothbrush…). After the camera is ready, we run a
// short framing window and then auto-capture so the experience feels
// "automatic" without requiring on-device object detection. On capture we
// stop the alarm audio and route to /reward.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";

import Button3D from "@/src/components/Button3D";
import {
  BottomPill,
  ChallengeHint,
  DashedFrame,
} from "@/src/challenges/CameraChrome";
import { useAlarmAudio } from "@/src/challenges/useAlarmAudio";
import { pickRandomTarget } from "@/src/challenges/objects";
import { colors, fonts, radius, space, type } from "@/src/theme";

const FRAMING_SECONDS = 3;

export default function PhotoChallenge() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { stop } = useAlarmAudio(id);
  const [permission, requestPermission] = useCameraPermissions();
  const target = useMemo(() => pickRandomTarget(), []);
  const cameraRef = useRef<CameraView | null>(null);
  const handledRef = useRef(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturing, setCapturing] = useState(false);

  const handleBack = useCallback(() => {
    stop();
    router.back();
  }, [router, stop]);

  const performCapture = useCallback(async () => {
    if (handledRef.current) return;
    handledRef.current = true;
    setCapturing(true);
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
    try {
      if (cameraRef.current && Platform.OS !== "web") {
        await cameraRef.current.takePictureAsync({
          quality: 0.6,
          skipProcessing: true,
        });
      }
    } catch (e) {
      console.warn("[photo-challenge] capture failed", e);
    } finally {
      stop();
      router.replace(`/reward?from=photo&object=${encodeURIComponent(target.id)}`);
    }
  }, [router, stop, target.id]);

  // Kick off the framing countdown once the camera is ready & permission
  // is granted. The user has FRAMING_SECONDS to get the target into frame.
  useEffect(() => {
    if (!permission?.granted || !cameraReady) return;
    if (handledRef.current) return;
    setCountdown(FRAMING_SECONDS);
    let n = FRAMING_SECONDS;
    const interval = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(interval);
        setCountdown(0);
        void performCapture();
      } else {
        Haptics.selectionAsync().catch(() => {});
        setCountdown(n);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [permission?.granted, cameraReady, performCapture]);

  // ---------- Permission gating ----------
  if (!permission) {
    return (
      <SafeAreaView style={styles.gateSafe} edges={["top", "bottom"]} />
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.gateSafe}
        edges={["top", "bottom"]}
        testID="photo-permission-gate"
      >
        <View style={styles.gateBody}>
          <View style={styles.gateBadge}>
            <Ionicons name="camera" size={36} color={colors.textInverse} />
          </View>
          <Text style={styles.gateTitle}>Camera needed</Text>
          <Text style={styles.gateSubtitle}>
            Snap a quick photo of a household object to switch off the alarm.
            Nothing is uploaded — the photo stays on your device.
          </Text>
        </View>
        <View style={styles.gateFooter}>
          {permission.canAskAgain ? (
            <Button3D
              label="Allow camera"
              onPress={() => {
                void requestPermission();
              }}
              testID="photo-allow-camera"
            />
          ) : (
            <Button3D
              label="Open settings"
              onPress={() => {
                Linking.openSettings().catch(() => {});
              }}
              testID="photo-open-settings"
            />
          )}
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={styles.gateBack}
            testID="photo-permission-back"
          >
            <Text style={styles.gateBackText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Camera UI ----------
  const hintCopy = `Find ${target.label}`;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="photo-challenge-screen"
    >
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
      />
      <View pointerEvents="none" style={styles.dimOverlay} />

      <View style={styles.content}>
        <View style={styles.topSpacer} />
        <DashedFrame shape="square" testID="photo-frame" />
        <View style={styles.iconSlot}>
          {capturing ? (
            <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
          ) : countdown !== null && countdown > 0 ? (
            <View style={styles.countdownBadge}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          ) : (
            <Ionicons name="aperture-outline" size={28} color="#FFFFFF" />
          )}
        </View>
        <ChallengeHint
          emoji={target.emoji}
          text={
            Platform.OS === "web"
              ? "Web preview can't capture — try a real device."
              : capturing
                ? "Got it!"
                : hintCopy
          }
          testID="photo-hint"
        />
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.bottomBar}>
        <BottomPill
          label="Back"
          onPress={handleBack}
          variant="primary"
          testID="photo-back-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  topSpacer: { height: space.xl },
  iconSlot: {
    marginTop: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 5,
    borderBottomColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownText: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.textInverse,
  },
  bottomBar: {
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    paddingTop: space.sm,
  },
  // Permission gate
  gateSafe: { flex: 1, backgroundColor: colors.background },
  gateBody: {
    flex: 1,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  gateBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDark,
  },
  gateTitle: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: space.xs,
  },
  gateSubtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
    paddingHorizontal: space.sm,
  },
  gateFooter: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
  gateBack: {
    alignSelf: "center",
    marginTop: space.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  gateBackText: {
    ...type.caption,
    color: colors.textMuted,
    fontFamily: fonts.semibold,
  },
});
