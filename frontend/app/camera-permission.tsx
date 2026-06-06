// Camera permission step. Sits between /choose-action and /ringtone-select
// in onboarding, and is also re-pushed from /(main) (post-paywall one-shot
// and the per-alarm "i" icon) when the user previously skipped.
//
// UX rules:
//   • CTA "Continue" always fires the native popup. Whatever the user
//     picks, we advance — the OS now owns the permission state, not us.
//   • "Not now" advances too (skips the prompt entirely).
//   • Reads `?next=...` to know where to land after the user acts.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getCameraPermissionsAsync,
  requestCameraPermissionsAsync,
} from "expo-camera";

import PermissionScreen from "@/src/components/PermissionScreen";

const ART = require("../assets/images/onboarding/camera-permission.png");

const DEFAULT_NEXT = "/ringtone-select";

export default function CameraPermission() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const target = typeof next === "string" && next.length > 0 ? next : DEFAULT_NEXT;

  const [busy, setBusy] = useState(false);
  // Track mount state so we don't setState after the screen has been
  // replaced as part of the chain.
  const mountedRef = useRef(true);
  // Hold the navigation timeout so we can cancel it on unmount and not
  // leak a pending setTimeout that fires into an unmounted component.
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // If the user already granted on a previous visit, skip straight
    // through. This lets the post-paywall one-shot harmlessly include
    // already-granted permissions without flashing the screen.
    (async () => {
      try {
        const r = await getCameraPermissionsAsync();
        if (r.status === "granted" && mountedRef.current) {
          navTimerRef.current = setTimeout(() => {
            if (mountedRef.current) router.replace(target as never);
          }, 0);
        }
      } catch {
        /* noop */
      }
    })();
    return () => {
      mountedRef.current = false;
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
        navTimerRef.current = null;
      }
    };
  }, [router, target]);

  const advance = useCallback(() => {
    if (!mountedRef.current) return;
    router.replace(target as never);
  }, [router, target]);

  const handleContinue = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Fire the OS popup. We don't branch on the result — whatever the
      // user chose, the system has the truth now and we move on.
      await requestCameraPermissionsAsync().catch(() => {});
    } finally {
      if (mountedRef.current) setBusy(false);
      // Tiny delay so the popup animation finishes before we transition.
      navTimerRef.current = setTimeout(advance, 120);
    }
  }, [busy, advance]);

  return (
    <PermissionScreen
      testID="camera-permission-screen"
      art={ART}
      title="Snap to wake"
      subtitle="You'll dismiss the alarm with a photo or barcode."
      busy={busy}
      onContinue={handleContinue}
      onSkip={advance}
    />
  );
}
