// Pre-flight permission helper. The Alarms feature needs BOTH push
// notifications (so the alarm fires) and the camera (so the wake-up
// challenge — barcode or photo — actually works). This helper centralises
// the check so any save / edit screen can call one function and we route
// the user through the missing permission screens in a stable order.
//
// Routing strategy: each permission screen accepts a `?next=...` query
// param so we can chain them. Example:
//   /notifications-permission?next=%2Fcamera-permission%3Fnext%3D%2F(main)
// would walk Notifications \u2192 Camera \u2192 Alarms tab.

import type { Router } from "expo-router";

import * as Notifications from "expo-notifications";
import { getCameraPermissionsAsync } from "expo-camera";

export type PermissionKind = "notifications" | "camera";

export interface PermissionState {
  granted: boolean;
  canAskAgain: boolean;
}

export async function getNotificationState(): Promise<PermissionState> {
  try {
    const r = await Notifications.getPermissionsAsync();
    return {
      granted: r.status === "granted",
      canAskAgain: r.canAskAgain ?? true,
    };
  } catch {
    return { granted: false, canAskAgain: true };
  }
}

export async function getCameraState(): Promise<PermissionState> {
  try {
    const r = await getCameraPermissionsAsync();
    return {
      granted: r.status === "granted",
      canAskAgain: r.canAskAgain ?? true,
    };
  } catch {
    return { granted: false, canAskAgain: true };
  }
}

export interface AlarmPermissionStatus {
  notifications: PermissionState;
  camera: PermissionState;
  missing: PermissionKind[];
}

export async function getAlarmPermissionStatus(): Promise<AlarmPermissionStatus> {
  const [n, c] = await Promise.all([getNotificationState(), getCameraState()]);
  const missing: PermissionKind[] = [];
  if (!n.granted) missing.push("notifications");
  if (!c.granted) missing.push("camera");
  return { notifications: n, camera: c, missing };
}

const ROUTE_BY_KIND: Record<PermissionKind, string> = {
  notifications: "/notifications-permission",
  camera: "/camera-permission",
};

/**
 * Build a chained URL that walks every missing permission in order and
 * finally lands the user on `finalReturn`. Returns null when no permissions
 * are missing.
 *
 * Example:
 *   buildPermissionChain(["notifications", "camera"], "/(main)")
 *   \u2192 "/notifications-permission?next=%2Fcamera-permission%3Fnext%3D%2F(main)"
 */
export function buildPermissionChain(
  missing: PermissionKind[],
  finalReturn: string,
): string | null {
  if (missing.length === 0) return null;
  // Build from the END of the chain backwards so each step's `next` is the
  // already-encoded URL of the next step.
  let url = finalReturn;
  for (let i = missing.length - 1; i >= 0; i--) {
    const route = ROUTE_BY_KIND[missing[i]];
    url = `${route}?next=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Convenience: if any alarm permission is missing, push the user into the
 * permission chain ending at `finalReturn`. Returns true when we routed
 * (caller should bail out of its own save flow) and false when everything
 * is already granted (caller can proceed normally).
 */
export async function routeIfMissing(
  router: Router,
  finalReturn: string,
): Promise<boolean> {
  const status = await getAlarmPermissionStatus();
  const chain = buildPermissionChain(status.missing, finalReturn);
  if (!chain) return false;
  router.push(chain as never);
  return true;
}
