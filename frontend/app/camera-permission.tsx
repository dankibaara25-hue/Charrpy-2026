// Camera permission step. Sits between /choose-action and /ringtone-select
// in onboarding, and is also re-pushed from /(main) (post-paywall one-shot
// and the per-alarm "i" badge) when previously skipped.
//
// UX rules:
//   • Always render the screen — we do NOT auto-skip on mount even if
//     the permission is already granted, because the user wants every
//     route in the onboarding chain to be visible. The post-paywall
//     one-shot only pushes permissions that are actually missing (see
//     buildPermissionChain in src/lib/permissions.ts), so already-granted
//     perms are pre-filtered out at chain construction time.
//   • "Let's go" fires the native popup. Whatever the user picks (allow
//     OR deny OR blocked), we advance. The OS owns the truth.
//   • "Not now" also advances.
//   • Reads `?next=...` so the caller controls the next route.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { requestCameraPermissionsAsync } from "expo-camera";

import PermissionScreen from "@/src/components/PermissionScreen";

const ART = require("../assets/images/onboarding/camera-permission.png");

const BULLETS = [
  { icon: "barcode" as const, text: "Scan barcodes to dismiss" },
  { icon: "camera" as const, text: "Snap a household item to verify" },
  { icon: "lock-closed" as const, text: "Used only in the moment \u2014 never stored" },
];

const DEFAULT_NEXT = "/ringtone-select";

export default function CameraPermission() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const target = typeof next === "string" && next.length > 0 ? next : DEFAULT_NEXT;

  const [busy, setBusy] = useState(false);
  const mountedRef = useRef(true);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
        navTimerRef.current = null;
      }
    };
  }, []);

  const advance = useCallback(() => {
    if (!mountedRef.current) return;
    router.replace(target as never);
  }, [router, target]);

  const handleContinue = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Fire the OS popup. We never branch on the result — whatever the
      // user chose, the system has the truth now and we move on.
      await requestCameraPermissionsAsync().catch(() => {});
    } finally {
      if (mountedRef.current) setBusy(false);
      navTimerRef.current = setTimeout(advance, 120);
    }
  }, [busy, advance]);

  return (
    <PermissionScreen
      testID="camera-permission-screen"
      art={ART}
      title="Let Charrpy see"
      subtitle="Allow the camera so you can scan a barcode or snap an object to dismiss the alarm."
      bullets={BULLETS}
      busy={busy}
      continueLabel="Let's go"
      onContinue={handleContinue}
      onSkip={advance}
    />
  );
}
