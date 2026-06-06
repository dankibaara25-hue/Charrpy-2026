// XP awarding formula + persistence helpers.
//
// Formula breakdown:
//   base            = 20  (showing up to the alarm)
//   challengeBonus  = math 0 / barcode 10 / photo 20  (photo is hardest)
//   streakBonus     = min(streakDays * 2, 30)
//   subtotal        = base + challengeBonus + streakBonus
//   total           = round(subtotal / 5) * 5   (nice round numbers)
//
// Examples:
//   math, day 1 streak    → 20 + 0  + 2  = 22  → 20
//   barcode, day 3 streak → 20 + 10 + 6  = 36  → 35
//   photo, day 7 streak   → 20 + 20 + 14 = 54  → 55
//   photo, day 30+ streak → 20 + 20 + 30 = 70  → 70  (streak bonus capped)

import { storage } from "@/src/utils/storage";

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
  const raw = base + challengeBonus + streakBonus;
  return Math.round(raw / 5) * 5;
}

export async function readXp(): Promise<number> {
  const raw = await storage.getItem(KEY_XP, "");
  if (typeof raw === "number") return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export async function awardXp(delta: number): Promise<number> {
  const current = await readXp();
  const next = Math.max(0, current + delta);
  await storage.setItem(KEY_XP, `${next}`);
  return next;
}

// Idempotent per-day record so re-mounting /xp the same day doesn't double-
// award. Stamp is `YYYY-MM-DD`. Returns the (possibly unchanged) totals.
export interface AwardResult {
  awarded: number; // 0 if today was already counted
  total: number;
}

const todayIso = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export async function awardXpIdempotent(
  delta: number,
  now: Date = new Date(),
): Promise<AwardResult> {
  const stamp = todayIso(now);
  const last = await storage.getItem(KEY_LAST_AWARD, "");
  const lastStamp =
    typeof last === "string" ? last : last == null ? "" : String(last);
  if (lastStamp === stamp) {
    const total = await readXp();
    return { awarded: 0, total };
  }
  const total = await awardXp(delta);
  await storage.setItem(KEY_LAST_AWARD, stamp);
  return { awarded: delta, total };
}
