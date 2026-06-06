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
const PENDING_KEY = "charrpy.alarm.pending";

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

// ----- Pending alarm draft (onboarding flow) ------------------------------
// While the user walks through set-alarm → ringtone-select → notifications →
// camera → paywall, we don't yet have somewhere to put the alarm (the
// alarms tab isn't reachable until onboarding is done). So we stash a
// partial draft here and flush it into the real list on first focus of the
// Alarms tab. This means an alarm picked during onboarding actually shows
// up in the user's list (was previously falling through).

export type PendingAlarmDraft = Partial<
  Pick<
    Alarm,
    "hour" | "minute" | "meridiem" | "ringtoneId" | "challenge" | "nickname"
  >
>;

export async function readPendingAlarm(): Promise<PendingAlarmDraft | null> {
  const raw = await storage.getItem(PENDING_KEY, "");
  if (!raw || typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as PendingAlarmDraft;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function writePendingAlarm(
  patch: PendingAlarmDraft,
): Promise<PendingAlarmDraft> {
  const current = (await readPendingAlarm()) ?? {};
  const next = { ...current, ...patch };
  await storage.setItem(PENDING_KEY, JSON.stringify(next));
  return next;
}

export async function clearPendingAlarm(): Promise<void> {
  await storage.removeItem(PENDING_KEY);
}

/**
 * Flush any pending onboarding draft into the real alarm list. Idempotent:
 * if no draft exists, returns null. If a draft exists but is missing
 * required fields we fill in sensible defaults so the alarm still saves.
 */
export async function hydratePendingAlarm(): Promise<Alarm | null> {
  const draft = await readPendingAlarm();
  if (!draft) return null;
  // Need at minimum a time. Bail (and clear) if even that's missing so we
  // don't insert a junk alarm.
  if (
    typeof draft.hour !== "number" ||
    typeof draft.minute !== "number" ||
    (draft.meridiem !== "AM" && draft.meridiem !== "PM")
  ) {
    await clearPendingAlarm();
    return null;
  }
  const base = defaultAlarm(draft.ringtoneId);
  const merged: Alarm = {
    ...base,
    hour: draft.hour,
    minute: draft.minute,
    meridiem: draft.meridiem,
    ringtoneId: draft.ringtoneId ?? base.ringtoneId,
    challenge: draft.challenge ?? base.challenge,
    nickname: draft.nickname ?? base.nickname,
  };
  await saveAlarm(merged);
  await clearPendingAlarm();
  return merged;
}
