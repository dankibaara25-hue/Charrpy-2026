// Notifications permission step. Sits between /ringtone-select and
// /paywall in onboarding, and is also re-pushed from /(main) (post-paywall
// one-shot and the per-alarm "i" badge) when previously skipped.
//
// UX rules mirror camera-permission.tsx exactly:
//   • Always renders — never auto-skips on mount, even if granted.
//   • "Let's go" fires the popup; we advance regardless.
//   • "Not now" advances too.
//   • Reads `?next=...`.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import PermissionScreen from "@/src/components/PermissionScreen";
import {
  configureForegroundHandler,
  ensureAlarmChannel,
  requestPermission,
} from "@/src/lib/notifications";

const ART = require("../assets/images/onboarding/ringtone.png");

const BULLETS = [
  { icon: "alarm" as const, text: "Reliable alarm delivery" },
  { icon: "volume-high" as const, text: "Plays your chosen ringtone" },
  { icon: "trophy" as const, text: "Streak & reward reminders" },
];

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
      title="Let Charrpy wake you up"
      subtitle="Turn on notifications so your alarm can ring loud and clear, even on silent."
      bullets={BULLETS}
      busy={busy}
      continueLabel="Let's go"
      onContinue={handleContinue}
      onSkip={advance}
    />
  );
}
