// Notification permission step. Sits between ringtone selection and the
// camera permission step in onboarding (and is also pushed on-demand from
// save flows when the user previously skipped). Renders the shared
// PermissionScreen component so the layout stays in lock-step with
// camera-permission.tsx, but owns its own request logic against
// expo-notifications.
//
// Reads `?next=...` so the caller can chain it into other permission
// screens. Falls back to /camera-permission so onboarding still flows
// correctly when the param is omitted.

import React, { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import PermissionScreen, {
  type PermissionUiStatus,
} from "@/src/components/PermissionScreen";
import {
  configureForegroundHandler,
  ensureAlarmChannel,
  getPermissionStatus,
  requestPermission,
} from "@/src/lib/notifications";

const ART = require("../assets/images/onboarding/ringtone.png");

const BULLETS = [
  { icon: "alarm" as const, text: "Reliable alarm delivery" },
  { icon: "volume-high" as const, text: "Plays your chosen ringtone" },
  { icon: "trophy" as const, text: "Streak & reward reminders" },
];

const DEFAULT_NEXT = "/camera-permission";

export default function NotificationsPermission() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const target = typeof next === "string" && next.length > 0 ? next : DEFAULT_NEXT;

  const [status, setStatus] = useState<PermissionUiStatus>("undetermined");
  const [busy, setBusy] = useState(false);

  const mapStatus = useCallback(
    (s: "granted" | "denied" | "undetermined", canAsk: boolean): PermissionUiStatus => {
      if (s === "granted") return "granted";
      if (s === "denied" && !canAsk) return "denied-blocked";
      if (s === "denied") return "denied-can-ask";
      return "undetermined";
    },
    [],
  );

  useEffect(() => {
    configureForegroundHandler();
    void ensureAlarmChannel();
    (async () => {
      const cur = await getPermissionStatus();
      setStatus(mapStatus(cur.status, cur.canAskAgain));
    })();
  }, [mapStatus]);

  const proceed = useCallback(() => {
    router.replace(target as never);
  }, [router, target]);

  const handleAllow = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await requestPermission();
      const next = mapStatus(res.status, res.canAskAgain);
      setStatus(next);
      if (next === "granted") {
        setTimeout(proceed, 150);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, mapStatus, proceed]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(() => {});
  }, []);

  return (
    <PermissionScreen
      testID="notifications-permission-screen"
      art={ART}
      title="Let Charrpy wake you up"
      subtitle="Turn on notifications so your alarm can ring loud and clear, even on silent."
      bullets={BULLETS}
      status={status}
      busy={busy}
      allowLabel="Allow notifications"
      onAllow={handleAllow}
      onOpenSettings={handleOpenSettings}
      onContinue={proceed}
      blockedHint="Notifications are blocked."
    />
  );
}
