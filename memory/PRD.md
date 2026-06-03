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
- 19 illustrated avatars (cohesive light-blue background, gamified style)
  bundled under `/app/frontend/assets/images/avatars/`
- Grid screen (`/avatar-select`) with 3-column responsive layout
- Duolingo-style 3D selection treatment: orange ring + checkmark badge +
  thick bottom border on the selected tile
- Selection persisted via `@/src/utils/storage` (`charrpy.avatar.id`)
- Routed into the flow as: commitment slide → `/avatar-select` → `/onboarding-complete`
- Completion screen now hero-renders the chosen avatar

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
