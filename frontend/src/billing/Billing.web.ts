// Web stub for Billing. Mirrors Billing.native.ts so screens can import from
// `@/src/billing/Billing` without ever pulling `react-native-purchases-ui`
// into the web bundle (it has no browser entrypoint and would crash Metro).

export type PaywallOutcome = "purchased" | "restored" | "cancelled" | "error";

export const isRevenueCatAvailable = (): boolean => false;

export async function configureRevenueCatOnce(): Promise<void> {
  // no-op on web
}

export async function identifyRevenueCatUser(_uid: string): Promise<void> {
  // no-op on web
}

export async function presentPaywall(): Promise<PaywallOutcome> {
  // No native paywall on web. The screen handles this by showing a friendly
  // explanation + a "Continue to app" CTA.
  return "cancelled";
}
