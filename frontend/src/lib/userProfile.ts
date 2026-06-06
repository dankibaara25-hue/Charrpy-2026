// User profile + gamification document store.
//
// Firestore doc shape (collection "users", id = anonymous UID):
//   {
//     nickname: string,
//     avatarId: string,
//     streak: { count: number, history: { [YYYY-MM-DD]: true }, lastDate?: string },
//     xp: { total: number, lastAwardDate?: string },
//     createdAt: Timestamp,
//     updatedAt: Timestamp
//   }
//
// We use one-shot getDoc / setDoc / updateDoc (no live snapshots) per the
// user's preference for simplicity + low cost. The local AsyncStorage
// cache still mirrors the canonical Firestore values so the UI feels
// instant even when offline.

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";

import { auth, db } from "@/src/lib/firebase";
import { storage } from "@/src/utils/storage";

export interface StreakDoc {
  count: number;
  history: Record<string, true>;
  lastDate?: string;
}

export interface XpDoc {
  total: number;
  lastAwardDate?: string;
}

export interface UserProfile {
  nickname: string;
  avatarId: string;
  streak: StreakDoc;
  xp: XpDoc;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const EMPTY_PROFILE: UserProfile = {
  nickname: "",
  avatarId: "",
  streak: { count: 0, history: {} },
  xp: { total: 0 },
};

const LOCAL_NICK = "charrpy.nickname";
const LOCAL_AVATAR = "charrpy.avatar.id";

const getUid = (): string | null => auth.currentUser?.uid ?? null;

const userRef = (uid: string) => doc(db, "users", uid);

const toProfile = (data: DocumentData | undefined): UserProfile => {
  if (!data) return { ...EMPTY_PROFILE };
  const streak = (data.streak ?? {}) as Partial<StreakDoc>;
  const xp = (data.xp ?? {}) as Partial<XpDoc>;
  return {
    nickname: typeof data.nickname === "string" ? data.nickname : "",
    avatarId: typeof data.avatarId === "string" ? data.avatarId : "",
    streak: {
      count: typeof streak.count === "number" ? streak.count : 0,
      history: streak.history ?? {},
      lastDate: streak.lastDate,
    },
    xp: {
      total: typeof xp.total === "number" ? xp.total : 0,
      lastAwardDate: xp.lastAwardDate,
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

// Mirror critical fields back to AsyncStorage so screens that already use
// the local cache keep working without a network round-trip.
const writeLocalMirror = async (p: Partial<UserProfile>): Promise<void> => {
  if (typeof p.nickname === "string") {
    await storage.setItem(LOCAL_NICK, p.nickname);
  }
  if (typeof p.avatarId === "string") {
    await storage.setItem(LOCAL_AVATAR, p.avatarId);
  }
};

/** Initialize the user doc on first sign-in. Idempotent (safe to call again). */
export async function initUserProfile(input: {
  uid: string;
  nickname: string;
  avatarId: string;
}): Promise<UserProfile> {
  const ref = userRef(input.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    // Merge in the latest nickname / avatar (user might be re-onboarding).
    await updateDoc(ref, {
      nickname: input.nickname,
      avatarId: input.avatarId,
      updatedAt: serverTimestamp(),
    });
    await writeLocalMirror(input);
    const after = await getDoc(ref);
    return toProfile(after.data());
  }
  const profile: UserProfile = {
    nickname: input.nickname,
    avatarId: input.avatarId,
    streak: { count: 0, history: {} },
    xp: { total: 0 },
  };
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await writeLocalMirror(input);
  return profile;
}

/** Read the user doc. Falls back to local mirror when offline / signed-out. */
export async function getUserProfile(): Promise<UserProfile> {
  const uid = getUid();
  if (!uid) {
    const nickname = (await storage.getItem(LOCAL_NICK, "")) || "";
    const avatarId = (await storage.getItem(LOCAL_AVATAR, "")) || "";
    return {
      ...EMPTY_PROFILE,
      nickname: typeof nickname === "string" ? nickname : "",
      avatarId: typeof avatarId === "string" ? avatarId : "",
    };
  }
  try {
    const snap = await getDoc(userRef(uid));
    return toProfile(snap.data());
  } catch (e) {
    console.warn("[userProfile] getUserProfile failed, using local cache", e);
    const nickname = (await storage.getItem(LOCAL_NICK, "")) || "";
    const avatarId = (await storage.getItem(LOCAL_AVATAR, "")) || "";
    return {
      ...EMPTY_PROFILE,
      nickname: typeof nickname === "string" ? nickname : "",
      avatarId: typeof avatarId === "string" ? avatarId : "",
    };
  }
}

/** Patch profile fields. Updates Firestore + local mirror. */
export async function updateProfile(
  patch: Partial<Pick<UserProfile, "nickname" | "avatarId">>,
): Promise<void> {
  await writeLocalMirror(patch);
  const uid = getUid();
  if (!uid) return;
  try {
    await updateDoc(userRef(uid), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[userProfile] updateProfile failed", e);
  }
}

/** Patch streak subfield. */
export async function persistStreak(next: StreakDoc): Promise<void> {
  const uid = getUid();
  if (!uid) return;
  try {
    await updateDoc(userRef(uid), {
      streak: next,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[userProfile] persistStreak failed", e);
  }
}

/** Patch xp subfield. */
export async function persistXp(next: XpDoc): Promise<void> {
  const uid = getUid();
  if (!uid) return;
  try {
    await updateDoc(userRef(uid), {
      xp: next,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[userProfile] persistXp failed", e);
  }
}

/** Delete the user doc (used by Delete Account). Caller should also call
 *  auth.currentUser.delete() and clear local storage. */
import { deleteDoc } from "firebase/firestore";
export async function deleteUserProfile(): Promise<void> {
  const uid = getUid();
  if (!uid) return;
  try {
    await deleteDoc(userRef(uid));
  } catch (e) {
    console.warn("[userProfile] deleteUserProfile failed", e);
  }
}
