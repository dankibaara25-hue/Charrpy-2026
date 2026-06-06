// XP persistence — local cache + Firestore sync. Mirrors streak.ts shape.

import { storage } from "@/src/utils/storage";
import { persistXp } from "@/src/lib/userProfile";

const KEY_XP = "charrpy.xp";
const KEY_LAST_AWARD = "charrpy.xp.last_award";

export type ChallengeKind = "math" | "barcode" | "photo" | string;

const CHALLENGE_BONUS: Record<string, number> = {
  math: 0,
  barcode: 10,
  photo: 20,
};

export function computeXpAward(
  challenge: ChallengeKind,
  streakDays: number,
): number {
  const base = 20;
  const challengeBonus = CHALLENGE_BONUS[challenge] ?? 0;
  const streakBonus = Math.min(Math.max(0, streakDays) * 2, 30);
  return Math.round((base + challengeBonus + streakBonus) / 5) * 5;
}

export async function readXp(): Promise<number> {
  const raw = await storage.getItem(KEY_XP, "");
  if (typeof raw === "number") return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

const readLastAward = async (): Promise<string> => {
  const raw = await storage.getItem(KEY_LAST_AWARD, "");
  return typeof raw === "string" ? raw : raw == null ? "" : String(raw);
};

const todayIso = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export interface AwardResult {
  awarded: number;
  total: number;
}

export async function awardXpIdempotent(
  delta: number,
  now: Date = new Date(),
): Promise<AwardResult> {
  const stamp = todayIso(now);
  const last = await readLastAward();
  if (last === stamp) {
    return { awarded: 0, total: await readXp() };
  }
  const current = await readXp();
  const next = Math.max(0, current + delta);
  await storage.setItem(KEY_XP, `${next}`);
  await storage.setItem(KEY_LAST_AWARD, stamp);
  void persistXp({ total: next, lastAwardDate: stamp });
  return { awarded: delta, total: next };
}

/** Hydrate local from server values at app startup. */
export async function hydrateXpFromServer(server: {
  total: number;
  lastAwardDate?: string;
}): Promise<void> {
  const localTotal = await readXp();
  const localStamp = await readLastAward();
  const serverStamp = server.lastAwardDate ?? "";
  const serverWins =
    serverStamp > localStamp ||
    (serverStamp === localStamp && server.total > localTotal);
  if (serverWins) {
    await storage.setItem(KEY_XP, `${server.total}`);
    if (serverStamp) await storage.setItem(KEY_LAST_AWARD, serverStamp);
  }
}
