// Notifications permission step. Sits between /ringtone-select and
// /paywall in onboarding, and is also re-pushed from /(main) (post-paywall
// one-shot and the per-alarm "i" icon) when previously skipped.
//
// UX rules mirror camera-permission.tsx exactly:
//   • "Continue" fires the popup; we advance regardless of choice.
//   • "Not now" advances too.
//   • Reads `?next=...`.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import PermissionScreen from "@/src/components/PermissionScreen";
import {
  configureForegroundHandler,
  ensureAlarmChannel,
  getPermissionStatus,
  requestPermission,
} from "@/src/lib/notifications";

const ART = require("../assets/images/onboarding/ringtone.png");

const DEFAULT_NEXT = "/paywall";

export default function NotificationsPermission() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const target = typeof next === "string" && next.length > 0 ? next : DEFAULT_NEXT;

  const [busy, setBusy] = useState(false);
  const mountedRef = useRef(true);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    configureForegroundHandler();
    void ensureAlarmChannel();
    (async () => {
      try {
        const r = await getPermissionStatus();
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
      await requestPermission().catch(() => {});
    } finally {
      if (mountedRef.current) setBusy(false);
      navTimerRef.current = setTimeout(advance, 120);
    }
  }, [busy, advance]);

  return (
    <PermissionScreen
      testID="notifications-permission-screen"
      art={ART}
      title="Loud and clear"
      subtitle="So the alarm rings through silent and locked screens."
      busy={busy}
      onContinue={handleContinue}
      onSkip={advance}
    />
  );
}
