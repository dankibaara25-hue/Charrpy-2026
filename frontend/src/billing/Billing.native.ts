// Native billing module — wraps RevenueCat. Only ever resolved on iOS/Android
// thanks to the .native.ts extension; Metro picks Billing.web.ts on web so
// the bundle never tries to load `react-native-purchases-ui` in the browser.
//
// IMPORTANT: `react-native-purchases` is a native module. It works in a dev
// build (custom development client) but NOT inside Expo Go. The UI variants
// of these calls will simply no-op when StoreKit / Play Billing isn't linked.

import { Platform } from "react-native";
import Purchases, { LogLevel } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const TEST_API_KEY = "test_gGJfkLxxpAaMNUlUDeMfiZXsPvy";

let configured = false;

export const isRevenueCatAvailable = (): boolean =>
  Platform.OS === "ios" || Platform.OS === "android";

export async function configureRevenueCatOnce(): Promise<void> {
  if (!isRevenueCatAvailable() || configured) return;
  try {
    await Purchases.setLogLevel(LogLevel.DEBUG);
    Purchases.configure({ apiKey: TEST_API_KEY });
    configured = true;
  } catch (e) {
    // We swallow the error so dev sessions in Expo Go don't crash on launch.
    // The same call will succeed in a real dev build.
    console.warn("[Billing] Purchases.configure failed", e);
  }
}

export async function identifyRevenueCatUser(uid: string): Promise<void> {
  if (!isRevenueCatAvailable()) return;
  try {
    if (!configured) await configureRevenueCatOnce();
    await Purchases.logIn(uid);
  } catch (e) {
    console.warn("[Billing] Purchases.logIn failed", e);
  }
}

export type PaywallOutcome = "purchased" | "restored" | "cancelled" | "error";

export async function presentPaywall(): Promise<PaywallOutcome> {
  if (!isRevenueCatAvailable()) return "cancelled";
  try {
    if (!configured) await configureRevenueCatOnce();
    const result = await RevenueCatUI.presentPaywall({
      displayCloseButton: true,
    });
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        return "purchased";
      case PAYWALL_RESULT.RESTORED:
        return "restored";
      case PAYWALL_RESULT.CANCELLED:
        return "cancelled";
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      default:
        return "error";
    }
  } catch (e) {
    console.warn("[Billing] presentPaywall failed", e);
    return "error";
  }
}
