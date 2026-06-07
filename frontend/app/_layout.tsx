import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";

import { KeyboardProviderShim } from "@/src/components/KeyboardProviderShim";
import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { useAppFonts } from "@/src/hooks/use-app-fonts";
import { AuthProvider } from "@/src/context/AuthContext";
import { colors } from "@/src/theme";
import { configureForegroundHandler } from "@/src/lib/notifications";

// Keep the native splash visible from cold start until icon fonts register.
SplashScreen.preventAutoHideAsync();

// Configure foreground notification handling once at module load so any
// scheduled alarm that fires while the app is open still shows the OS
// banner + plays a sound.
configureForegroundHandler();

/**
 * Extract the alarm id out of a notification response payload. Defensive:
 * we accept `data.alarmId` as a string OR a stringified number, and only
 * treat the response as an alarm tap when `data.type === "alarm"`.
 */
const alarmIdFromResponse = (
  res: Notifications.NotificationResponse | null,
): string | null => {
  if (!res) return null;
  const data = res.notification?.request?.content?.data as
    | { type?: string; alarmId?: unknown }
    | undefined;
  if (!data || data.type !== "alarm") return null;
  const id = data.alarmId;
  if (typeof id === "string" && id.length > 0) return id;
  if (typeof id === "number") return String(id);
  return null;
};

export default function RootLayout() {
  const [iconsLoaded, iconsError] = useIconFonts();
  const [fontsLoaded, fontsError] = useAppFonts();
  const ready = (iconsLoaded || iconsError) && (fontsLoaded || fontsError);
  const router = useRouter();

  // Cold-start handling must run AT MOST ONCE per app launch \u2014 if the
  // user kills + relaunches the app this naturally resets. Without the
  // ref a hot-reload would re-trigger the route and yank the user back
  // to /alarm-ring even while they're navigating elsewhere.
  const handledColdStartRef = useRef(false);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // ---- Notification \u2192 /alarm-ring routing ---------------------------
  // We honour two distinct entry paths:
  //   1. Cold start: user tapped the alarm notification while the app
  //      was killed. `getLastNotificationResponseAsync` returns that
  //      tap on first read; we route immediately.
  //   2. Warm start: app already alive (in foreground or backgrounded).
  //      A subscription on `addNotificationResponseReceivedListener`
  //      catches the tap and routes the same way.
  //
  // The /alarm-ring screen owns the in-app ringtone playback and the
  // challenge UI, so once we land there the rest of the experience is
  // already wired \u2014 user solves the challenge to actually dismiss.
  useEffect(() => {
    if (!ready) return;

    // 1) Cold-start handler. Wrapped in a tiny timeout so the Stack has
    //    a chance to mount before we replace its first screen.
    const coldStart = async () => {
      if (handledColdStartRef.current) return;
      try {
        const last = await Notifications.getLastNotificationResponseAsync();
        const id = alarmIdFromResponse(last);
        if (id && !handledColdStartRef.current) {
          handledColdStartRef.current = true;
          // Use replace so the back gesture from /alarm-ring doesn't
          // leak the user back into the splash/index route.
          setTimeout(() => router.replace(`/alarm-ring?id=${id}` as never), 50);
        } else {
          // No alarm tap brought us here \u2014 still mark as handled so
          // a later listener invocation can't be confused for a cold
          // start replay.
          handledColdStartRef.current = true;
        }
      } catch (e) {
        console.warn("[notif] cold-start lookup failed", e);
        handledColdStartRef.current = true;
      }
    };
    void coldStart();

    // 2) Warm-start subscription. Fires for every alarm tap while the
    //    app is alive (foreground or background, both platforms).
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const id = alarmIdFromResponse(res);
      if (id) {
        router.push(`/alarm-ring?id=${id}` as never);
      }
    });
    return () => sub.remove();
  }, [ready, router]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProviderShim>
        <SafeAreaProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: "slide_from_right",
              }}
            />
          </AuthProvider>
        </SafeAreaProvider>
      </KeyboardProviderShim>
    </GestureHandlerRootView>
  );
}
