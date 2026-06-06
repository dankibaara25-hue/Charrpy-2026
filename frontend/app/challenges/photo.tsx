// Photo dismissal challenge — full-screen camera with a SQUARE dashed orange
// frame overlay. The app picks a random household object and asks the user
// to photograph it. On capture we send the base64 image to the backend
// vision route (Gemini 2.5 Flash) which actually verifies the photo
// contains the requested object before letting the alarm dismiss.
//
// State machine:
//   framing  → user frames + taps the round capture button (or auto-shutter
//              fires after CAPTURE_AFTER_MS as a safety net)
//   verifying → image POSTed to /api/vision/verify-object, spinner shown
//   matched   → success haptic + route to /reward?from=photo
//   no_match  → toast-style hint with the reason + "Try again" CTA;
//               tapping returns to framing for another go.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { verifyObject } from "@/src/lib/vision";
import { colors, fonts, radius, space, type } from "@/src/theme";

type Phase = "framing" | "verifying" | "matched" | "no_match";

export default function PhotoChallenge() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { stop } = useAlarmAudio(id);
  const [permission, requestPermission] = useCameraPermissions();
  const target = useMemo(() => pickRandomTarget(), []);

  const cameraRef = useRef<CameraView | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("framing");
  const [reason, setReason] = useState<string>("");

  const handleBack = useCallback(() => {
    abortRef.current?.abort();
    stop();
    router.back();
  }, [router, stop]);

  const verifyAndAdvance = useCallback(
    async (base64: string) => {
      setPhase("verifying");
      const ctl = new AbortController();
      abortRef.current = ctl;
      try {
        const r = await verifyObject({
          imageBase64: base64,
          target: target.label,
          targetId: target.id,
          signal: ctl.signal,
        });
        if (ctl.signal.aborted) return;
        if (r.match) {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => {});
          setPhase("matched");
          stop();
          router.replace(
            `/reward?from=photo&object=${encodeURIComponent(target.id)}`,
          );
        } else {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          ).catch(() => {});
          setReason(r.reasoning || `That doesn't look like ${target.label}.`);
          setPhase("no_match");
        }
      } catch (e: unknown) {
        if (ctl.signal.aborted) return;
        console.warn("[photo-challenge] verify failed", e);
        setReason(
          "Couldn't reach the vision service — please check your connection.",
        );
        setPhase("no_match");
      } finally {
        abortRef.current = null;
      }
    },
    [router, stop, target.id, target.label],
  );

  const performCapture = useCallback(async () => {
    if (phase !== "framing") return;
    setPhase("verifying");
    Haptics.selectionAsync().catch(() => {});

    if (Platform.OS === "web" || !cameraRef.current) {
      // On web we can't actually call takePictureAsync — short-circuit so the
      // dev preview still demonstrates the flow.
      setTimeout(() => {
        setReason("Web preview can't capture photos — try a real device.");
        setPhase("no_match");
      }, 600);
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
        base64: true,
      });
      const b64 = photo?.base64;
      if (!b64) {
        setReason("Couldn't capture the frame — please retry.");
        setPhase("no_match");
        return;
      }
      await verifyAndAdvance(b64);
    } catch (e) {
      console.warn("[photo-challenge] takePicture failed", e);
      setReason("Camera error — please retry.");
      setPhase("no_match");
    }
  }, [phase, verifyAndAdvance]);

  const handleRetry = useCallback(() => {
    setReason("");
    setPhase("framing");
  }, []);

  // Abort any in-flight verification on unmount so we don't leak the
  // fetch / state setters.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

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
            Nothing is uploaded permanently — your photo is only used to
            verify the object then discarded.
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
  const hint =
    phase === "verifying"
      ? "Checking your photo…"
      : phase === "matched"
        ? "Got it!"
        : phase === "no_match"
          ? reason
          : `Capture ${target.label}`;

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
          {phase === "verifying" ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : phase === "matched" ? (
            <Ionicons name="checkmark-circle" size={36} color="#7AE38B" />
          ) : (
            <Ionicons
              name={phase === "no_match" ? "close-circle" : "aperture-outline"}
              size={28}
              color={phase === "no_match" ? "#FF7A7A" : "#FFFFFF"}
            />
          )}
        </View>

        <ChallengeHint
          emoji={target.emoji}
          text={hint}
          testID="photo-hint"
        />

        <View style={{ flex: 1 }} />

        {phase === "framing" ? (
          <Pressable
            onPress={performCapture}
            style={styles.shutter}
            disabled={!cameraReady && Platform.OS !== "web"}
            testID="photo-capture-button"
          >
            <View style={styles.shutterRing}>
              <View style={styles.shutterInner} />
            </View>
          </Pressable>
        ) : null}

        {phase === "no_match" ? (
          <View style={styles.retryWrap}>
            <BottomPill
              label="Try again"
              onPress={handleRetry}
              variant="primary"
              icon="refresh"
              testID="photo-retry-button"
            />
          </View>
        ) : null}
      </View>

      <View style={styles.bottomBar}>
        <BottomPill
          label="Back"
          onPress={handleBack}
          variant="ghost"
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
    paddingHorizontal: space.md,
    paddingTop: space.xl,
  },
  topSpacer: { height: space.lg },
  iconSlot: {
    marginTop: space.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  shutter: {
    alignSelf: "center",
    marginBottom: space.md,
  },
  shutterRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  retryWrap: {
    alignSelf: "stretch",
    paddingHorizontal: space.lg,
    marginBottom: space.md,
  },
  bottomBar: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
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
