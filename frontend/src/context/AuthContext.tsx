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
