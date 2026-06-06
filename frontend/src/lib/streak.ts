// Streak persistence — local AsyncStorage cache + Firestore sync.
//
// The local cache is the source-of-truth for instant UI reads. Writes
// update local first (snappy), then fire-and-forget Firestore upsert. On
// next launch the Firestore value (one-shot getDoc via getUserProfile)
// wins, so if the user wiped local storage but kept their account, the
// streak survives.

import { storage } from "@/src/utils/storage";
import { persistStreak } from "@/src/lib/userProfile";

const KEY_STREAK = "charrpy.streak";

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
  count: number;
  history: Record<string, true>;
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

const trimHistory = (h: Record<string, true>): Record<string, true> => {
  const keys = Object.keys(h).sort();
  if (keys.length <= 28) return h;
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

const writeLocal = (state: StreakState) =>
  storage.setItem(KEY_STREAK, JSON.stringify(state));

/** Hydrate the local cache from a server-side StreakDoc (called once at
 *  app startup once auth resolves). */
export async function hydrateStreakFromServer(server: {
  count: number;
  history: Record<string, true>;
  lastDate?: string;
}): Promise<void> {
  const local = await readStreak();
  // Server wins if it's newer (lastDate strictly greater) OR has a higher
  // count for the same date. Otherwise keep local (offline edits survive).
  const localLast = local.lastDate ?? "";
  const serverLast = server.lastDate ?? "";
  const serverWins =
    serverLast > localLast ||
    (serverLast === localLast && server.count > local.count);
  if (serverWins) await writeLocal(server);
}

export interface StreakResult {
  state: StreakState;
  advanced: boolean;
}

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

  const next: StreakState = {
    count: nextCount,
    history: trimHistory({ ...state.history, [today]: true }),
    lastDate: today,
  };

  await writeLocal(next);
  // Fire-and-forget Firestore sync — UI doesn't wait on the network.
  void persistStreak(next);
  return { state: next, advanced: true };
}

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
  const dow = now.getDay();
  const daysSinceMonday = (dow + 6) % 7;
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
