// Notification permission + scheduling helpers. Handles the contextual permission
// flow and exposes high-level helpers for scheduling alarm notifications via
// expo-notifications. Native alarm-clock-style channel is configured on
// Android so the notification rings loudly even when the device is on silent.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const ALARM_CHANNEL_ID = "charrpy-alarms";

let handlerSet = false;
let channelEnsured = false;

export type PermissionStatus = "granted" | "denied" | "undetermined";

const toStatus = (s: Notifications.PermissionStatus): PermissionStatus => {
  if (s === "granted") return "granted";
  if (s === "denied") return "denied";
  return "undetermined";
};

export async function ensureAlarmChannel(): Promise<void> {
  if (channelEnsured) return;
  if (Platform.OS !== "android") {
    channelEnsured = true;
    return;
  }
  try {
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: "Alarms",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF9500",
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
    channelEnsured = true;
  } catch (e) {
    console.warn("[notifications] ensureAlarmChannel failed", e);
  }
}

export function configureForegroundHandler(): void {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function getPermissionStatus(): Promise<{
  status: PermissionStatus;
  canAskAgain: boolean;
}> {
  try {
    const res = await Notifications.getPermissionsAsync();
    return {
      status: toStatus(res.status),
      canAskAgain: res.canAskAgain ?? true,
    };
  } catch {
    return { status: "undetermined", canAskAgain: true };
  }
}

export async function requestPermission(): Promise<{
  status: PermissionStatus;
  canAskAgain: boolean;
}> {
  try {
    await ensureAlarmChannel();
    const res = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    return {
      status: toStatus(res.status),
      canAskAgain: res.canAskAgain ?? true,
    };
  } catch {
    return { status: "denied", canAskAgain: false };
  }
}

// ---- Scheduling helpers --------------------------------------------------

export interface ScheduleAlarmInput {
  id: string;
  hour: number; // 1..12
  minute: number;
  meridiem: "AM" | "PM";
  repeat: "once" | "daily" | "weekdays" | "weekends" | "custom";
  customDays: number[]; // 0=Sun..6=Sat
  title: string;
  body: string;
}

const to24h = (hour: number, meridiem: "AM" | "PM"): number => {
  const h = hour % 12;
  return meridiem === "PM" ? h + 12 : h;
};

const buildContent = (
  input: ScheduleAlarmInput,
): Notifications.NotificationContentInput => ({
  title: input.title,
  body: input.body,
  sound: "default",
  priority: Notifications.AndroidNotificationPriority.MAX,
  data: { alarmId: input.id, type: "alarm" },
  ...(Platform.OS === "android" ? { channelId: ALARM_CHANNEL_ID } : {}),
});

const nextOccurrence = (h: number, m: number, weekday?: number): Date => {
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (typeof weekday === "number") {
    const diff = (weekday - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + diff);
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 7);
  } else if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

export async function scheduleAlarm(
  input: ScheduleAlarmInput,
): Promise<string[]> {
  await ensureAlarmChannel();
  const h = to24h(input.hour, input.meridiem);
  const m = input.minute;
  const content = buildContent(input);
  const ids: string[] = [];

  const schedule = async (
    trigger: Notifications.NotificationTriggerInput,
  ): Promise<string | null> => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      });
      return id;
    } catch (e) {
      console.warn("[notifications] schedule failed", e);
      return null;
    }
  };

  if (input.repeat === "once") {
    const date = nextOccurrence(h, m);
    const id = await schedule({
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    });
    if (id) ids.push(id);
  } else if (input.repeat === "daily") {
    const id = await schedule({
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: h,
      minute: m,
    });
    if (id) ids.push(id);
  } else {
    const weekdays: number[] =
      input.repeat === "weekdays"
        ? [1, 2, 3, 4, 5]
        : input.repeat === "weekends"
          ? [0, 6]
          : input.customDays;
    for (const d of weekdays) {
      // expo-notifications WEEKLY uses 1=Sun..7=Sat
      const expoWeekday = d + 1;
      const id = await schedule({
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: expoWeekday,
        hour: h,
        minute: m,
      });
      if (id) ids.push(id);
    }
  }

  return ids;
}

export async function cancelScheduled(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
}

export async function cancelAllScheduled(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* noop */
  }
}
