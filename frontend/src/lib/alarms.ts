// Local alarm store + native scheduler. Persists an array of alarms in
// storage so the user's list survives reloads, and keeps the OS-level
// notification schedule in sync via expo-notifications. Will migrate the
// persistence layer to Firestore in a later milestone, but the shape here
// is already designed to be Firestore-friendly (flat fields, JSON-
// serialisable, no class instances).

import { storage } from "@/src/utils/storage";
import {
  cancelScheduled,
  scheduleAlarm,
  type ScheduleAlarmInput,
} from "@/src/lib/notifications";

export type Meridiem = "AM" | "PM";
export type Repeat = "once" | "daily" | "weekdays" | "weekends" | "custom";
export type ChallengeKind = "math" | "barcode" | "photo";

export interface Alarm {
  id: string;
  hour: number; // 1..12
  minute: number; // 0..59
  meridiem: Meridiem;
  enabled: boolean;
  repeat: Repeat;
  customDays: number[]; // 0=Sun .. 6=Sat (used when repeat=custom)
  ringtoneId: string;
  challenge: ChallengeKind;
  nickname: string;
  announcement: boolean;
  volume: number; // 0..1
  crescendo: boolean;
  createdAt: number;
  // IDs returned by expo-notifications for the live OS-level schedule. We
  // keep them here so we can cancel + reschedule when the alarm is edited
  // or disabled.
  notifIds?: string[];
}

const KEY = "charrpy.alarms";

const newId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const defaultAlarm = (ringtoneId = "classic"): Alarm => ({
  id: newId(),
  hour: 7,
  minute: 0,
  meridiem: "AM",
  enabled: true,
  repeat: "daily",
  customDays: [],
  ringtoneId,
  challenge: "math",
  nickname: "",
  announcement: false,
  volume: 0.7,
  crescendo: false,
  createdAt: Date.now(),
  notifIds: [],
});

const readAll = async (): Promise<Alarm[]> => {
  const raw = await storage.getItem(KEY, "");
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw) as Alarm[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = async (all: Alarm[]): Promise<void> => {
  await storage.setItem(KEY, JSON.stringify(all));
};

export async function listAlarms(): Promise<Alarm[]> {
  return readAll();
}

const buildSchedulePayload = (a: Alarm): ScheduleAlarmInput => ({
  id: a.id,
  hour: a.hour,
  minute: a.minute,
  meridiem: a.meridiem,
  repeat: a.repeat,
  customDays: a.customDays,
  title: a.nickname ? `🐤 ${a.nickname}` : "🐤 Time to rise!",
  body: "Tap to complete your wake-up challenge.",
});

const syncSchedule = async (a: Alarm): Promise<Alarm> => {
  // Always cancel previous OS-level schedule for this alarm.
  if (a.notifIds && a.notifIds.length) {
    await cancelScheduled(a.notifIds);
  }
  if (!a.enabled) return { ...a, notifIds: [] };
  const ids = await scheduleAlarm(buildSchedulePayload(a));
  return { ...a, notifIds: ids };
};

export async function saveAlarm(next: Alarm): Promise<Alarm[]> {
  const all = await readAll();
  const idx = all.findIndex((a) => a.id === next.id);
  // If we're editing, fold in the previous notifIds so syncSchedule can
  // cancel the stale ones.
  const previousIds = idx >= 0 ? all[idx].notifIds ?? [] : [];
  const synced = await syncSchedule({
    ...next,
    notifIds: [...previousIds, ...(next.notifIds ?? [])],
  });
  if (idx >= 0) all[idx] = synced;
  else all.unshift(synced);
  await writeAll(all);
  return all;
}

export async function deleteAlarm(id: string): Promise<Alarm[]> {
  const all = await readAll();
  const target = all.find((a) => a.id === id);
  if (target?.notifIds?.length) {
    await cancelScheduled(target.notifIds);
  }
  const next = all.filter((a) => a.id !== id);
  await writeAll(next);
  return next;
}

export async function getAlarm(id: string): Promise<Alarm | undefined> {
  const all = await readAll();
  return all.find((a) => a.id === id);
}

export const formatTime = (a: Pick<Alarm, "hour" | "minute" | "meridiem">) =>
  `${a.hour}:${String(a.minute).padStart(2, "0")} ${a.meridiem}`;

export const repeatLabel = (a: Pick<Alarm, "repeat" | "customDays">) => {
  switch (a.repeat) {
    case "once":
      return "Once";
    case "daily":
      return "Daily";
    case "weekdays":
      return "Weekdays";
    case "weekends":
      return "Weekends";
    case "custom":
      if (!a.customDays.length) return "Custom";
      const names = ["S", "M", "T", "W", "T", "F", "S"];
      return a.customDays
        .slice()
        .sort()
        .map((d) => names[d])
        .join(" ");
  }
};
