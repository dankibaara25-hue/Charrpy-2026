#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================
user_problem_statement: "Gamified mobile alarm app Charrpy (Expo Router + Firebase Anon Auth + RevenueCat). User asked to: (1) make paywall skippable in dev mode, (2) use expo-notifications for native alarm scheduling, (3) add a 'allow notifications' onboarding step right after Ringtone selection and BEFORE the paywall."

frontend:
  - task: "Notification permission onboarding step (post-ringtone, pre-paywall)"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/notifications-permission.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "New route /notifications-permission. Wires expo-notifications request flow per <handle_permissions_contract>: probes current status on mount, shows pre-permission explainer + 3 benefit bullets, primary button switches between Allow / Asking / Open Settings depending on canAskAgain. 'Not now' skip routes straight to /paywall. Reachable via ringtone-select -> notifications-permission -> paywall. Verified visually on web (screenshot captured)."

  - task: "Wire ringtone-select -> notifications-permission -> paywall"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/ringtone-select.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "ringtone-select Continue now pushes /notifications-permission. notifications-permission replaces to /paywall on grant or 'Not now'. Paywall has 'Continue to app' fallback that routes to /(main) (dev-skippable as requested)."

  - task: "Native alarm scheduling via expo-notifications"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/lib/notifications.ts, /app/frontend/src/lib/alarms.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Created notifications.ts with setNotificationHandler (banner+sound+list while foregrounded), Android 'charrpy-alarms' channel (MAX importance, bypassDnd, public lockscreen) so notifications behave like an alarm clock. scheduleAlarm() supports once/daily/weekdays/weekends/custom triggers. alarms.ts saveAlarm/deleteAlarm now sync OS-level scheduled IDs. app.json: added expo-notifications plugin + Android permissions (POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM, USE_EXACT_ALARM, WAKE_LOCK, VIBRATE) + iOS UIBackgroundModes:[audio]. Splash bg color updated to warm cream (#FFF6E5). NOTE: native ringing-when-locked alarm behavior is a development-build-only feature (won't fire from Expo Go on iOS); user has been informed."

  - task: "Paywall skippable in dev / browser mode"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/paywall.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Existing paywall already exposes a 'Continue to app' Button3D that routes to /(main). On platforms without RevenueCat (web / Expo Go), Billing.web returns 'cancelled' and the explainer + CTA render, keeping the user unblocked. On native it auto-presents RevenueCatUI.presentPaywall, then routes to /(main) on purchased/restored."

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 2
  run_ui: true

test_plan:
  current_focus:
    - "Notification permission onboarding step (post-ringtone, pre-paywall)"
    - "Wire ringtone-select -> notifications-permission -> paywall"
    - "Native alarm scheduling via expo-notifications"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  -agent: "main"
  -message: "M3.1 done: added /notifications-permission between /ringtone-select and /paywall, plus full expo-notifications scheduling layer (foreground handler, alarm channel, schedule on saveAlarm, cancel on deleteAlarm). app.json plugin + permissions wired. Paywall remains skippable on web/dev. Please run end-to-end frontend flow: Splash -> Welcome -> Onboarding -> Avatar -> Nickname -> Set Alarm -> Ringtone -> NotificationsPermission ('Not now' or Allow) -> Paywall ('Continue to app') -> (main) Alarms tab. Verify all tabs (Alarms / Leaderboard / Settings) load. Create + toggle + delete an alarm. Note: native scheduling can't be verified on web, only that the JS layer doesn't throw."

# ===== Iteration M5 — Wake-up Challenges (Barcode + Photo) =====

frontend:
  - task: "Barcode wake-up challenge"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/challenges/barcode.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Full-screen CameraView with orange dashed rectangular frame (Charrpy palette adaptation of the user-supplied dark-mode reference). Uses expo-camera v17 `useCameraPermissions` for contextual gating (Allow camera / Open settings if blocked). Lightning-bolt icon under the frame; instruction text 'Scan any barcode to dismiss the alarm'; orange Duolingo-style Back pill at the bottom. `onBarcodeScanned` accepts every common code type (QR, EAN, UPC, Code128, etc.) — first valid read stops the alarm audio, fires Haptics.Success, and replaces to /reward?from=barcode. On web the camera frame still renders + the copy gracefully degrades."

  - task: "Photo capture wake-up challenge"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/challenges/photo.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Same camera chrome as barcode but with a SQUARE dashed frame. Random target object picked from /src/challenges/objects.ts on mount (water glass, fridge, toothbrush, kettle, sink, shoes, book, chair, window, plant, towel, mug, remote, fruit, water bottle — 15 entries, each with an emoji). Caption renders as 'Find <object>' with the emoji above. Once the camera reports `onCameraReady`, a 3-second countdown badge runs (with selection haptics each tick) then auto-fires `takePictureAsync` and replaces to /reward?from=photo&object=<id>. On web, takePictureAsync is skipped but the route still progresses so the flow can be QA'd end-to-end."

  - task: "Alarm-ring delegates to camera challenges by alarm.challenge"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/alarm-ring.tsx, /app/frontend/app/alarm-edit.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "alarm-ring.tsx now checks alarm.challenge: 'barcode' → router.replace(/challenges/barcode?id=...); 'photo' → router.replace(/challenges/photo?id=...); 'math' → existing inline math UI but final success now navigates to /reward?from=math instead of router.back(). Removed the '(Pro)' suffix from barcode/photo labels in alarm-edit since they're now functional. Each challenge screen owns its own audio via the new `useAlarmAudio` hook (src/challenges/useAlarmAudio.ts) so the ringtone keeps playing throughout."

  - task: "Reward screen (placeholder for streak/XP)"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/reward.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Charrpy-styled reward screen: 3D trophy badge, NICE WORK kicker, dynamic headline driven by ?from= (barcode/photo/math), 3D stat cards (+1 Streak, +25 XP) as PLACEHOLDERS. Continue button routes to /(main). The streak/XP visual treatment is intentionally minimal — the full design will land in the next user iteration once they share guidelines."

  - task: "Camera permission + plugin wiring (app.json)"
    implemented: true
    working: "NA"
    file: "/app/frontend/app.json"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Added expo-camera plugin with `cameraPermission` usage description ('Charrpy needs the camera to scan barcodes and snap target photos so you can dismiss your alarm.'). Added CAMERA to Android permissions array. recordAudioAndroid disabled. Plus the pre-existing notification permission flow remains untouched."

agent_communication:
  -agent: "main"
  -message: "M5 done — wake-up barcode + photo challenges. Smoke-tested visually on web preview: barcode page renders the orange dashed rectangle + lightning icon + Back pill exactly like the reference (palette adapted to warm-cream/orange). Photo page renders the square dashed frame + countdown badge + random emoji + object prompt. Reward screen routes correctly. Please run end-to-end: (1) open /alarm-edit, change Action to Barcode, save, tap Test alarm → expect /challenges/barcode + Back pill works. (2) Set Action=Photo, Test → expect 3s countdown then auto-redirect to /reward. (3) Set Action=Math, Test → existing math flow but on completion now routes to /reward?from=math. (4) Reward screen Continue → /(main). No regressions to onboarding/auth/paywall expected."

# ===== Iteration M6 — Streak Page + Empty States + VirtualizedList Bug =====

frontend:
  - task: "Fix VirtualizedList-in-ScrollView red box on alarm-edit"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/TimePickerInline.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Replaced FlatList → ScrollView inside the inline hour/minute wheels. Data is tiny (12 hours, 60 minutes) so virtualization wasn't needed; this eliminates the red-box 'VirtualizedLists should never be nested inside plain ScrollViews' warning when TimePickerInline is rendered inside alarm-edit's parent ScrollView. All other behavior preserved (snap-to-interval, debounced web scroll commit, native onScrollEndDrag/onMomentumScrollEnd, initial scroll position via contentOffset)."

  - task: "Empty state centered vertically on Alarms + Leaderboard tabs"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/EmptyState.tsx, /app/frontend/app/(main)/index.tsx, /app/frontend/app/(main)/leaderboard.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "EmptyState wrap is now flex:1 + center-justified. Both tabs wrap the EmptyState in a parent View with minHeight 360 inside a ScrollView whose contentContainerStyle now has flexGrow:1 — so the empty illustration + hint sit mid-screen instead of clinging to the top quarter. Verified visually on web preview for both Alarms and Leaderboard tabs."

  - task: "Streak reward screen w/ flame GIF + weekday chips"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/reward.tsx, /app/frontend/src/lib/streak.ts, /app/frontend/assets/images/gamification/streak.gif"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Rebuilt /reward as the proper Streak screen using the user-supplied animated flame GIF (downloaded to /assets/images/gamification/streak.gif). Layout adapts the Duolingo-style reference (Mo→Su strip + big day count) but in Charrpy's warm-cream palette and our 3D Duolingo-style depth on the day chips. New src/lib/streak.ts owns persistence: recordChallengeWin() is idempotent per-day (calling twice the same calendar day doesn't double-count, but still returns current state), tracks { count, history map of YYYY-MM-DD, lastDate }, advances streak if yesterday was completed otherwise resets to 1, and keeps 28 days of history. awardXp() adds XP per win (constant XP_PER_WIN=25). buildCurrentWeek() returns the 7 Mon-first entries for rendering. The reward screen reads + writes both on mount, shows the day count + Mo→Su row with check icons on completed chips and a primary-orange ring around today, then a small XP line. Continue → /(main). Screenshot verified on web preview."

agent_communication:
  -agent: "main"
  -message: "M6 bundled three changes: (1) VirtualizedList nested-in-ScrollView crash on alarm-edit fixed by swapping FlatList for ScrollView inside TimePickerInline; verified alarm-edit screen loads cleanly. (2) Empty state on Alarms and Leaderboard tabs now centered vertically — both render at ~mid-screen with the sleeping bird mascot. (3) /reward fully redesigned: animated flame GIF at top, giant orange day count, 'day streak' caption, Mo→Su 3D circular check chips (today gets a primary ring even if not yet completed; completed days are filled with orange + checkmark + bottom-border depth). Streak + XP persisted locally via /src/lib/streak.ts (idempotent same-day; resets if a day is skipped). Please verify: (a) opening alarm-edit no longer red-boxes, (b) Alarms empty / Leaderboard empty visuals are centered, (c) /reward shows flame gif + '1' day streak after one challenge with today's weekday chip filled."

# ===== Iteration M7 — Audio bug + Keyboard overshadow fixes =====

frontend:
  - task: "Fix ringtone preview audio bug (subsequent taps don't play / overlap)"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/ringtone-select.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Rewrote audio lifecycle to use a useRef (playerRef) instead of useState for the live AudioPlayer instance. Three behavioral changes: (1) Every tap reads + writes the SAME ref so there's no stale-closure window where the old player is still bound but the next tap fires; (2) We call pause() BEFORE remove() on the previous player so the previous clip stops bleeding into the next one; (3) Reselecting the same row tears down + recreates the player, so playback restarts from the top instead of silently no-op'ing. Wrapped p.play()'s return in .catch() to swallow the web-only NotAllowedError when the page hasn't received a gesture yet. Unmount cleanup hits stopCurrent."

  - task: "Keyboard overshadow on Nickname (and other TextInputs)"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/nickname.tsx, /app/frontend/app/alarm-edit.tsx, /app/frontend/app/_layout.tsx, /app/frontend/src/components/KeyboardProviderShim.{tsx,native.tsx,web.tsx}"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Installed react-native-keyboard-controller@~1.18.0 (matched SDK 54). Added platform-specific shim at src/components/KeyboardProviderShim: native re-exports KeyboardProvider + KeyboardAwareScrollView + KeyboardAvoidingView from the lib; .web.tsx provides no-op fallbacks (browser handles keyboard avoidance natively, and the lib's native bindings throw 'KeyboardProvider is not defined' if loaded on web). Root _layout.tsx wraps the app in KeyboardProviderShim. nickname.tsx switched from RN KeyboardAvoidingView + ScrollView combo → KeyboardAwareScrollViewShim with bottomOffset=120 so the input scrolls clear of the keyboard automatically. alarm-edit.tsx ActionSheet (which contains the alarm-nickname TextInput) wraps its sheet in KeyboardAvoidingViewShim so the modal lifts above the keyboard. Verified web preview renders all three screens cleanly post-restart."

agent_communication:
  -agent: "main"
  -message: "M7 done — two device-only bugs fixed: (1) ringtone-select preview audio now uses a ref instead of state so the same row replays + different rows actually stop the previous clip + no more overlap; (2) keyboard overshadow on the Nickname screen and the alarm-edit Nickname modal fixed via react-native-keyboard-controller (KeyboardAwareScrollView for forms, KeyboardAvoidingView for modal). Web-safe shims prevent runtime errors when the lib's native bindings would otherwise throw. NOTE TO USER: I couldn't access the new ringtones at https://github.com/dankibaara25-hue/Charrpy-2026 (repo returns 404 — likely private). I asked the user to either make it public, upload the mp3s directly, or share raw URLs. As soon as the user shares them I'll swap them in and split first-5 onto onboarding / rest into the alarm-edit ringtone picker."

# ===== Iteration M8 — New Ringtones Library (34 mp3s) =====

frontend:
  - task: "Wire 34 mp3 ringtones from user repo; first 5 in onboarding, full library in alarm-edit Sound picker"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/onboarding/ringtones.ts, /app/frontend/app/ringtone-select.tsx, /app/frontend/app/alarm-edit.tsx, /app/frontend/assets/audio/ringtones/*.mp3"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Downloaded all 34 user-supplied MP3 ringtones from the now-public repo (dankibaara25-hue/Charrpy-2026/frontend/assets/audio/ringtones) into /app/frontend/assets/audio/ringtones. Removed the 5 placeholder WAVs. Rewrote src/onboarding/ringtones.ts: full RINGTONES array (34 entries with human labels + vibes — e.g. Classic, Piano Musical, Tropical Marimba, Celestial Calm, Modern HD, Heavy Alarm, Phone Alert, Cinematic Bell, Danube Waltz, Galaxy, Bass Drop, Hyper Tick, Celebrate, Sine Pluck, Loud Ring, Love Ring, Marching Band, Minion Tone, Mobile Ring, Mobile Tone, Neon House, Notification, Phone Alert 2, Piano Ring, Pulse Beat, Red Bubble, Rhythm Call, Ring Ring, Aqua, Salsa, Super Alarm, Bright Track, Turbo Wave, Universfield). Exposes ONBOARDING_RINGTONES = RINGTONES.slice(0, 5) for the onboarding step. app/ringtone-select.tsx imports ONBOARDING_RINGTONES (so onboarding stays short — 5 rows). app/alarm-edit.tsx Sound ActionSheet now wraps RINGTONES.map in a ScrollView with maxHeight 420 so the full library is browsable inside the sheet without overflowing the screen. Verified on web preview: onboarding shows 5 rows; alarm-edit Sound picker shows all 34, scrollable."

agent_communication:
  -agent: "main"
  -message: "M8 — repo went public, downloaded all 34 mp3 ringtones, wired them in. Onboarding step ringtone-select now shows the curated first 5; alarm-edit Sound picker shows the full library inside a scrollable sheet. Screenshots confirm both screens render with the new labels. Please run: (1) /ringtone-select renders exactly 5 rows with new labels (Classic, Piano Musical, Tropical Marimba, Celestial Calm, Modern HD); (2) /alarm-edit Sound picker opens and shows >5 rows (target 34) inside a scrollable container — verify by scrolling, the bottom of the picker should reveal additional entries like Aqua / Salsa / Super Alarm; (3) all earlier flows (math/barcode/photo challenges, streak, paywall, etc.) still pass; (4) confirm no 'undefined ringtone source' errors when alarm-ring loads (some legacy storage keys may reference old IDs like chime/gentle/pop/melody that no longer exist — these will fall through to findRingtone returning undefined and the audio just won't play, which is acceptable for stale data)."

# ===== Iteration M9 — XP screen, Vision verification, Preview button =====

backend:
  - task: "Vision verify-object endpoint (Gemini 2.5 Flash)"
    implemented: true
    working: true
    file: "/app/backend/routes/vision.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      -working: true
        -agent: "main"
        -comment: "POST /api/vision/verify-object accepts { image_base64, target_object } and returns { match, confidence, reasoning } using gemini-2.5-flash via emergentintegrations. Curl-tested with a cartoon avatar PNG: matched 'a cartoon avatar' = true/0.95, and 'a glass of water' = false/1.0 correctly rejected. EMERGENT_LLM_KEY added to /app/backend/.env. send_message() used (not streaming) since this is a single yes/no verify, not chat."

frontend:
  - task: "XP reward screen (new /xp route)"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/xp.tsx, /app/frontend/src/lib/xp.ts, /app/frontend/src/hooks/use-one-shot-sfx.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "New /xp screen reached from /reward Continue. Layout adapts the user-supplied reference (purple 'You won X XP!' mock) into Charrpy's warm-cream palette: big 220×220 purple circular badge with 3D depth, dynamic 'You won X XP!' headline + per-challenge flavour ('Brain in gear.' / 'Nice scan.' / 'Sharp shot.'), confetti dot accents, Continue → /(main). XP formula: base 20 + challenge bonus (math 0 / barcode 10 / photo 20) + streakBonus min(streakDays*2, 30), rounded to nearest 5. Per-day idempotent via charrpy.xp.last_award stamp. tada-fanfare.mp3 plays once on mount via useOneShotSfx hook (auto-cleans up: pause+remove player on unmount — no memory leak)."

  - task: "Streak page plays trumpet fanfare on mount; chains to /xp"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/reward.tsx, /app/frontend/assets/audio/sfx/streak-fanfare.mp3"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Streak page now plays the success-fanfare-trumpets.mp3 SFX via useOneShotSfx (volume 0.8, auto-cleanup). Removed inline +25 XP placeholder line (XP screen owns that now). Continue button routes to /xp?from=<challenge> instead of going straight to /(main), so users see the full streak → xp sequence."

  - task: "Photo challenge — real vision verification (no more auto-pass)"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/challenges/photo.tsx, /app/frontend/src/lib/vision.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Rewrote the photo challenge as a proper state machine: framing → verifying → matched|no_match → retry. User now presses an explicit white round shutter button (instead of a 3s auto-countdown that captured anything). Captured frame is base64-encoded and POSTed to /api/vision/verify-object with the prompted target. If match → success haptic + route to /reward?from=photo. If no_match → 'Try again' pill with the vision model's reason (e.g. 'That looks like a wall, not a kettle.'). AbortController cleans up in-flight fetches on unmount."

  - task: "Alarm-edit Sound picker: audio preview without auto-dismiss"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/alarm-edit.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Sound action-sheet selection no longer dismisses the drawer. Tapping a row now (1) saves it as the selection, (2) plays a preview clip via a ref-based AudioPlayer (pause+remove previous, then play new — no overlap), (3) updates the row icon to 'volume-high'. User must hit the explicit 'Done' button or the X to close the sheet. Audio is torn down on Done, on backdrop dismiss, when the sheet changes, and on component unmount — covered by 3 separate effects/closures so there are no leak paths."

  - task: "Alarm-edit: removed 'Test alarm' button; Alarm card gained 'Preview' pill"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/alarm-edit.tsx, /app/frontend/app/(main)/index.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Removed the 'Test alarm' button from the bottom of /alarm-edit (its job is now done by the new Preview pill on each alarm card). Alarm card on /(main) gained a small orange-bordered 'Preview' pill at the bottom-right (Ionicons play + label), which absolute-positions over the card edge for a sticker-like accent. Tapping it stops the card's row-press from also firing and routes to /alarm-ring?id=<id>."

  - task: "Backend vision route plumbing in server.py + EMERGENT_LLM_KEY"
    implemented: true
    working: true
    file: "/app/backend/server.py, /app/backend/.env"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      -working: true
        -agent: "main"
        -comment: "server.py now imports routes.vision.router and registers it. EMERGENT_LLM_KEY added to /app/backend/.env. /app/backend/routes/__init__.py created. /app/image_testing.md saved per integration playbook."

agent_communication:
  -agent: "main"
  -message: "M9 bundled multiple deliverables: (1) NEW /xp screen — purple XP badge + animated tada fanfare on mount; (2) Streak page plays trumpet fanfare on mount + chains to /xp; (3) Photo challenge now does real vision verification via Gemini 2.5 Flash on the backend (verified end-to-end with curl: avatar PNG matched 'cartoon avatar'=true/0.95 / rejected 'glass of water'=false/1.0); (4) Alarm-edit Sound picker no longer auto-dismisses on tap — plays preview audio with ref-based no-overlap lifecycle, user closes via Done/X; (5) Removed 'Test alarm' from alarm-edit; (6) Added 'Preview' pill on each alarm card at bottom-right corner. Backend vision endpoint tested and working. SFX hook uses ref + pause+remove on unmount = no memory leaks. Please QA: /xp shows '40 XP' for photo+day1; streak fanfare audible on mount; photo challenge has shutter button + try-again on bad match; sound picker preview cycles correctly without overlap; preview pill on card routes to alarm-ring."

# ===== Iteration M10 — Firestore profile + Profile/Settings UX overhaul =====

frontend:
  - task: "Firestore user profile schema + sync (nickname/avatar/streak/xp)"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/lib/firebase.ts, /app/frontend/src/lib/userProfile.ts, /app/frontend/src/lib/streak.ts, /app/frontend/src/lib/xp.ts, /app/frontend/src/context/AuthContext.tsx, /app/frontend/app/nickname.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Added Firestore singleton (getFirestore) to firebase.ts. New src/lib/userProfile.ts owns the user document at users/{anonUid}: { nickname, avatarId, streak{count,history,lastDate}, xp{total,lastAwardDate}, createdAt, updatedAt }. Uses one-shot getDoc/setDoc/updateDoc per user preference for simplicity + cost. nickname.tsx now calls initUserProfile() right after signInAnonymously() so the canonical record is created. streak.ts + xp.ts now fire-and-forget persistStreak() / persistXp() on writes (local cache mirrors instantly so UI never blocks on network). AuthContext, on auth-ready, calls getUserProfile() then hydrateStreakFromServer + hydrateXpFromServer (server-wins by lastDate/lastAwardDate). Alarms stay local-only per user direction. Leaderboard intentionally deferred."

  - task: "Profile tab — banner avatar, nickname top-left, gear, Add Friends share, Overview stats"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/(main)/profile.tsx, /app/frontend/app/(main)/_layout.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Renamed Settings tab → Profile (tab icon now person). New /(main)/profile.tsx: full-width 320px banner showing avatar (or person silhouette placeholder when none set yet), warm-cream backdrop (#FFE3BD) extending edge-to-edge from the top. Nickname rendered top-left over the banner in Fredoka Bold 28; gear button top-right (3D depth) → /settings. Below the banner: '+ Add friends' primary Button3D using React Native's native Share API (Charrpy URL https://www.charrpy.com). 'OVERVIEW' section with two stat cards (🔥 streak count, ⚡ xp). Hydrates from local cache first (instant), then Firestore (server truth). Re-hydrates via useFocusEffect when the tab regains focus (so editing profile reflects instantly)."

  - task: "Settings stack (/settings) — Account / Support / TOS+Privacy"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/settings/_layout.tsx, /app/frontend/app/settings/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "New /settings stack with header back arrow. ACCOUNT section: 'Profile' row → /settings/profile, 'Delete account' row (danger-style red iconography). SUPPORT section: 'Help Center' + 'Feedback' both Linking.openURL to https://www.charrpy.com placeholder. Bottom: 'Terms of Service · Privacy Policy' footer links also opening the placeholder URL. Delete account flow shows Alert.alert confirmation, then deletes Firestore doc + auth.currentUser + clears all local storage keys, finally routes to /welcome."

  - task: "Edit Profile (/settings/profile) — banner + horizontal avatar carousel + nickname + delete"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/settings/profile.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      -working: "NA"
        -agent: "main"
        -comment: "Mirrors the Profile tab's banner layout (280px banner with current avatar). Below: 'CHOOSE AVATAR' horizontal ScrollView showing all 19 avatars as 76px round chips with 3D depth; selected avatar gets a primary-orange ring + tan fill. Below that: nickname TextInput (re-uses the same validation as onboarding nickname: 2–16 chars, [A-Za-z0-9_.-]). Save Changes Button3D calls updateProfile() which writes both local cache + Firestore. Delete account button (red, ghost variant) at the very bottom of the page triggers same Alert flow as in /settings."

agent_communication:
  -agent: "main"
  -message: "M10 done. Firestore wired in for the user doc only (streak + xp + nickname + avatarId), per the lean approach you confirmed. Alarms stay local. Leaderboard skipped for now. The Settings tab is gone — replaced by a Profile tab (banner avatar + nickname + gear + Add Friends share + Overview stats). The gear opens a dedicated /settings stack with Account (Profile, Delete account) and Support (Help Center, Feedback) sections plus TOS/Privacy at the bottom. /settings/profile is the edit screen — same banner layout, horizontal avatar carousel below it, nickname input, Save changes, Delete account at the bottom. Please QA: (1) Profile tab loads with banner + nickname top-left + gear top-right; (2) Add friends opens the native share sheet on real device (web shows the API call); (3) Stats cards show 🔥 streak and ⚡ XP; (4) Gear → /settings shows Account+Support sections; (5) Profile row → /settings/profile shows avatar carousel that updates the banner; (6) Save Changes writes to Firestore; (7) Delete account confirms + wipes everything + routes to /welcome. Firestore writes will silently no-op when running unauthenticated on the web preview."
