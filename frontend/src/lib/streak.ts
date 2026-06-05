// Streak + XP storage. Persists locally for now (AsyncStorage / SecureStore
// shim via the existing storage util). Will migrate to Firestore alongside
// the rest of the user schema in a later milestone.

import { storage } from "@/src/utils/storage";

const KEY_STREAK = "charrpy.streak";
const KEY_XP = "charrpy.xp";

// Award XP per challenge completion. Tunable in one place.
export const XP_PER_WIN = 25;

const WEEK_DAYS_MON_FIRST = [
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
  "Su",
] as const;

export type WeekdayLabel = (typeof WEEK_DAYS_MON_FIRST)[number];

export interface StreakState {
  // Total consecutive days completed.
  count: number;
  // Map of YYYY-MM-DD → true, only for days the user actually completed a
  // wake-up challenge. We keep ~14 days to render the weekly view + handle
  // streak grace edge cases.
  history: Record<string, true>;
  // The most recent completed date (YYYY-MM-DD), used to decide whether
  // today should extend the streak or reset it.
  lastDate?: string;
}

const EMPTY: StreakState = { count: 0, history: {} };

const todayIso = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDays = (iso: string, n: number): string => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayIso(dt);
};

const trimHistory = (
  history: Record<string, true>,
): Record<string, true> => {
  // Keep last 28 entries so we always have plenty of context for the weekly
  // strip, even across long stretches.
  const keys = Object.keys(history).sort();
  if (keys.length <= 28) return history;
  const keep = keys.slice(-28);
  const next: Record<string, true> = {};
  for (const k of keep) next[k] = true;
  return next;
};

export async function readStreak(): Promise<StreakState> {
  const raw = await storage.getItem(KEY_STREAK, "");
  if (!raw || typeof raw !== "string") return { ...EMPTY };
  try {
    const parsed = JSON.parse(raw) as StreakState;
    return {
      count: typeof parsed.count === "number" ? parsed.count : 0,
      history: parsed.history ?? {},
      lastDate: parsed.lastDate,
    };
  } catch {
    return { ...EMPTY };
  }
}

export async function readXp(): Promise<number> {
  const raw = await storage.getItem(KEY_XP, "");
  if (typeof raw === "number") return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export async function awardXp(delta = XP_PER_WIN): Promise<number> {
  const current = await readXp();
  const next = Math.max(0, current + delta);
  await storage.setItem(KEY_XP, `${next}`);
  return next;
}

export interface StreakResult {
  state: StreakState;
  // Whether this call actually advanced the streak (false if the user
  // already completed today's challenge earlier).
  advanced: boolean;
}

// Idempotent: calling twice in the same calendar day is a no-op for the
// counter but still returns the current state so the reward screen can
// re-render after a refresh.
export async function recordChallengeWin(
  now: Date = new Date(),
): Promise<StreakResult> {
  const state = await readStreak();
  const today = todayIso(now);

  if (state.history[today]) {
    return { state, advanced: false };
  }

  const yesterday = addDays(today, -1);
  const continued = state.lastDate === yesterday;
  const nextCount = continued ? state.count + 1 : 1;

  const nextState: StreakState = {
    count: nextCount,
    history: trimHistory({ ...state.history, [today]: true }),
    lastDate: today,
  };

  await storage.setItem(KEY_STREAK, JSON.stringify(nextState));
  return { state: nextState, advanced: true };
}

// Returns the 7 days of the current week (Mon..Sun) with each entry's
// ISO date + whether it was completed.
export interface WeekDayEntry {
  iso: string;
  label: WeekdayLabel;
  completed: boolean;
  isToday: boolean;
}

export function buildCurrentWeek(
  state: StreakState,
  now: Date = new Date(),
): WeekDayEntry[] {
  const today = todayIso(now);
  // Find Monday of the current week. getDay() returns 0 for Sun..6 for Sat.
  const dow = now.getDay();
  const daysSinceMonday = (dow + 6) % 7; // 0 if Mon, 1 if Tue, ..., 6 if Sun
  const mondayIso = addDays(today, -daysSinceMonday);

  return WEEK_DAYS_MON_FIRST.map((label, i) => {
    const iso = addDays(mondayIso, i);
    return {
      iso,
      label,
      completed: !!state.history[iso],
      isToday: iso === today,
    };
  });
}

export { WEEK_DAYS_MON_FIRST };
