// Auth context — listens for Firebase auth state at the root of the app so
// every screen can read the current user without re-subscribing. Also wires
// the authenticated Firebase UID into RevenueCat via Purchases.logIn().

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "@/src/lib/firebase";
import {
  configureRevenueCatOnce,
  identifyRevenueCatUser,
} from "@/src/billing/Billing";
import { getUserProfile } from "@/src/lib/userProfile";
import { hydrateStreakFromServer } from "@/src/lib/streak";
import { hydrateXpFromServer } from "@/src/lib/xp";

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  initializing: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Fire-and-forget — safe on every platform (no-op on web).
    void configureRevenueCatOnce();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
      if (u) {
        void identifyRevenueCatUser(u.uid);
        // Pull the Firestore-resident streak + XP one-shot, then mirror them
        // into the local cache so screens that read locally show server-
        // truth values after the next render.
        void (async () => {
          try {
            const profile = await getUserProfile();
            await hydrateStreakFromServer(profile.streak);
            await hydrateXpFromServer(profile.xp);
          } catch (e) {
            console.warn("[AuthContext] hydration failed", e);
          }
        })();
      }
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => useContext(AuthContext);
