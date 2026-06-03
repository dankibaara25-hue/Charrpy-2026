// Firebase singleton — modular Web SDK, configured for the charrpy-2026
// project. Web SDK works inside Expo Go and the web preview without any
// native build step. Initialization is guarded via getApps() so Fast Refresh
// doesn't try to re-initialize on every save.

import { Platform } from "react-native";
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  // @ts-expect-error — the type for getReactNativePersistence isn't yet exported
  // from "firebase/auth" in the modular bundle, but the runtime symbol exists.
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDye79Z1kv2XT0JXVn-NLboFbiBIpMmFYQ",
  authDomain: "charrpy-2026.firebaseapp.com",
  projectId: "charrpy-2026",
  storageBucket: "charrpy-2026.firebasestorage.app",
  messagingSenderId: "1043467995301",
  appId: "1:1043467995301:web:bceafc0c3e5bf6aaa1e54c",
  measurementId: "G-XP8ZRX8Y3W",
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let authInstance: Auth;
if (Platform.OS === "web") {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Already initialized in this JS context (Fast Refresh).
    authInstance = getAuth(app);
  }
}

export const firebaseApp = app;
export const auth = authInstance;
