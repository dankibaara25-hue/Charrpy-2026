// Camera permission step \u2014 mirrors notifications-permission.tsx in layout
// (uses the shared PermissionScreen component) but drives the native
// expo-camera popup. Sits between the notifications screen and the
// paywall during onboarding, and is also pushed on-demand from save flows
// (e.g. /alarm-edit) when the permission was previously skipped.
//
// Reads `?next=...` so the caller controls where to go after the user
// either allows, opens settings, or skips.

import React, { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getCameraPermissionsAsync,
  requestCameraPermissionsAsync,
} from "expo-camera";

import PermissionScreen, {
  type PermissionUiStatus,
} from "@/src/components/PermissionScreen";

const ART = require("../assets/images/onboarding/ringtone.png");

const BULLETS = [
  { icon: "qr-code" as const, text: "Scan barcodes to dismiss" },
  { icon: "camera" as const, text: "Snap a household item to verify" },
  { icon: "lock-closed" as const, text: "Used only to verify \u2014 never stored" },
];

const DEFAULT_NEXT = "/paywall";

export default function CameraPermission() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const target = typeof next === "string" && next.length > 0 ? next : DEFAULT_NEXT;

  const [status, setStatus] = useState<PermissionUiStatus>("undetermined");
  const [busy, setBusy] = useState(false);

  const probe = useCallback(async () => {
    try {
      const r = await getCameraPermissionsAsync();
      if (r.status === "granted") setStatus("granted");
      else if (r.status === "denied" && r.canAskAgain === false)
        setStatus("denied-blocked");
      else if (r.status === "denied") setStatus("denied-can-ask");
      else setStatus("undetermined");
    } catch {
      setStatus("undetermined");
    }
  }, []);

  useEffect(() => {
    void probe();
  }, [probe]);

  const proceed = useCallback(() => {
    router.replace(target as never);
  }, [router, target]);

  const handleAllow = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await requestCameraPermissionsAsync();
      if (r.status === "granted") {
        setStatus("granted");
        setTimeout(proceed, 150);
      } else if (r.status === "denied" && r.canAskAgain === false) {
        setStatus("denied-blocked");
      } else {
        setStatus("denied-can-ask");
      }
    } finally {
      setBusy(false);
    }
  }, [busy, proceed]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(() => {});
  }, []);

  return (
    <PermissionScreen
      testID="camera-permission-screen"
      art={ART}
      title="Camera access"
      subtitle="To scan QR codes and verify your wake-up photo challenge, Charrpy needs the camera."
      bullets={BULLETS}
      status={status}
      busy={busy}
      allowLabel="Allow camera"
      onAllow={handleAllow}
      onOpenSettings={handleOpenSettings}
      onContinue={proceed}
      blockedHint="Camera is blocked."
    />
  );
}
