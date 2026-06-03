# Charrpy — Product Requirements

## Vision
Charrpy is a gamified alarm app for iOS/Android (Expo / React Native) that
makes users complete a quick challenge — solve a math equation, scan a
barcode, or take a picture of something — before the alarm turns off. Cute
mascot, Duolingo-style 3D playful UI, dark theme with vibrant orange accents.

## Tech stack (locked by user)
- **Frontend**: React Native + Expo (SDK 54), expo-router, Reanimated, Fredoka font
- **Auth + Storage**: Firebase (to be wired in a later milestone)
- **Payments / subscriptions**: RevenueCat (to be wired in a later milestone)
- **NO MongoDB, no Node/Express backend for app data** — Firebase only

## Milestones

### M1 — Onboarding (shipped) ✅
- 3-second splash screen with mascot artwork + lowercase wordmark
- Welcome screen: mascot hero, headline, orange 3D Continue button, TOS +
  Privacy footer links (Apple's standard EULA + placeholder privacy URL)
- 15-step onboarding flow with a gradient orange progress bar (white track,
  rounded radius):
  1. Info: Set the time
  2. Info: Select a ringtone
  3. Info: Complete the action
  4. Info: Win the day
  5. Single-choice: biggest morning struggle
  6. Fun fact: 66-day habit research
  7. Single-choice: how often do you snooze
  8. Time picker: target wake-up time
  9. Fun fact: consistent wake times → focus/mood
  10. Multi-choice: morning goals
  11. Single-choice: preferred wake-up challenge
  12. Social proof: testimonials
  13. Fun fact: snoozing fragments sleep
  14. Gratitude: thanks for trusting us
  15. Commitment: ready to win your mornings
- Answers persisted to local storage on completion
- Onboarding-complete placeholder screen

### M2 — Avatar selection ✅
### M2.5 — UI refresh + Firebase Anonymous Auth ✅
- All onboarding screens migrated from dark BG to warm cream palette so the
  Duolingo-style 3D depth reads strongly. Strong dark-brown bottom shadow on
  every Button3D / Chip3D, both at rest and pressed.
- Welcome and avatar screens slimmed to title + ≤3-word subtitle. Onboarding
  subtitles trimmed to ≤6 words.
- Custom illustrations (welcome / set-alarm / ringtone / win-the-day /
  thank-you) PNG-rasterised from user-provided SVGs (transparent background
  enforced post-render so the cream BG shows through).
- Firebase modular Web SDK initialised in `src/lib/firebase.ts` against the
  `charrpy-2026` project. AuthProvider wraps the whole app and listens for
  `onAuthStateChanged`. Splash now routes returning anonymous users straight
  to `/(main)`, new users to `/welcome`.
- New `/nickname` route after avatar-select: validates a `[A-Za-z0-9_.-]{2,16}`
  handle and calls `signInAnonymously()` → routes to `/paywall`.
- New `/paywall` route — Charrpy Pro stub with feature card + price card.
  RevenueCat native SDK can't run in Expo Go (per integration playbook), so
  both buttons currently route to `/(main)`. The stub has explanatory copy
  for the user, and the file's top comment documents how to swap in
  `RevenueCatUI.presentPaywall` in a dev build.
- New `/(main)` placeholder for the eventual alarms / leaderboard / settings.
  Greets `hey {nickname}`, shows avatar + truncated UID, has a reset button.

### M3 — Main app screens (next)
- Alarms (CRUD)
- Leaderboard
- Settings

### M4 — Wake-up challenges
- Math equation
- Barcode scan
- Photo capture

### M5 — Auth + subscriptions
- Firebase Auth
- Firestore for user data
- RevenueCat paywall + entitlement gating

## Design system
- Theme: dark "Vibrant Play" with orange gradient accents (`#FF9500 → #FFC000`)
- Font: Fredoka (400/500/600/700)
- Button3D / Chip3D: thick bottom border, compresses on press for 3D feel
- ProgressBar: gradient orange fill, white rounded track
- SafeAreaProvider + SafeAreaView strictly applied to every screen
- All interactive elements have `testID` (kebab-case, by role)

## Open questions / dependencies
- Firebase project credentials (config keys) — needed for M5
- RevenueCat API keys (iOS + Android) — needed for M5
- Avatar artwork — user will provide for M2
- Final privacy policy URL — replace placeholder before App Store submission
