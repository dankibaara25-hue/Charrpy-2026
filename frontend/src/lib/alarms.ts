// Local alarm store. Persists an array of alarms in storage so the user's
// list survives reloads. Will migrate to Firestore in a later milestone, but
// the shape here is already designed to be Firestore-friendly (flat fields,
// JSON-serialisable, no class instances).

import { storage } from "@/src/utils/storage";

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
});

export async function listAlarms(): Promise<Alarm[]> {
  const raw = await storage.getItem(KEY, "");
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw) as Alarm[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAlarm(next: Alarm): Promise<Alarm[]> {
  const all = await listAlarms();
  const idx = all.findIndex((a) => a.id === next.id);
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  await storage.setItem(KEY, JSON.stringify(all));
  return all;
}

export async function deleteAlarm(id: string): Promise<Alarm[]> {
  const all = (await listAlarms()).filter((a) => a.id !== id);
  await storage.setItem(KEY, JSON.stringify(all));
  return all;
}

export async function getAlarm(id: string): Promise<Alarm | undefined> {
  const all = await listAlarms();
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
