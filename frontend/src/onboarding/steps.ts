// Lean onboarding step list. Subtitles trimmed to <= 6 words.
// Custom illustrations from /app/frontend/assets/images/onboarding/ are
// mapped to info + gratitude steps by `art` key.

import { ImageSourcePropType } from "react-native";

export type OnboardingStep =
  | {
      type: "info";
      title: string;
      subtitle: string;
      art: ImageSourcePropType;
    }
  | {
      type: "single";
      key: string;
      title: string;
      subtitle?: string;
      options: string[];
    }
  | {
      type: "multi";
      key: string;
      title: string;
      subtitle?: string;
      options: string[];
    }
  | {
      type: "time";
      key: string;
      title: string;
      subtitle?: string;
    }
  | {
      type: "fact";
      title: string;
      quote: string;
    }
  | {
      type: "social";
      title: string;
      subtitle: string;
      testimonials: { name: string; quote: string }[];
    }
  | {
      type: "gratitude";
      title: string;
      subtitle: string;
      art: ImageSourcePropType;
    }
  | {
      type: "commitment";
      title: string;
      subtitle: string;
    };

const SET_ALARM = require("../../assets/images/onboarding/set-alarm.png");
const RINGTONE = require("../../assets/images/onboarding/ringtone.png");
const WIN_THE_DAY = require("../../assets/images/onboarding/win-the-day.png");
const THANK_YOU = require("../../assets/images/onboarding/thank-you.png");

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    type: "info",
    title: "Set the time",
    subtitle: "Pick your wake-up.",
    art: SET_ALARM,
  },
  {
    type: "info",
    title: "Select a ringtone",
    subtitle: "Choose your vibe.",
    art: RINGTONE,
  },
  {
    type: "info",
    title: "Complete the action",
    subtitle: "Beat a quick challenge.",
    // Re-use set-alarm art so step 3 has visual continuity until a dedicated
    // illustration ships.
    art: SET_ALARM,
  },
  {
    type: "info",
    title: "Win the day",
    subtitle: "Streaks and rewards.",
    art: WIN_THE_DAY,
  },
  {
    type: "single",
    key: "struggle",
    title: "Biggest morning struggle?",
    options: [
      "Hitting snooze",
      "Doom-scrolling in bed",
      "Too groggy",
      "Zero motivation",
    ],
  },
  {
    type: "fact",
    title: "Did you know?",
    quote: "It takes about 66 days to lock in a real habit.",
  },
  {
    type: "single",
    key: "snoozes",
    title: "How often do you snooze?",
    options: [
      "Never",
      "1–2 times",
      "3–5 times",
      "I set 10 alarms",
    ],
  },
  {
    type: "time",
    key: "wake_time",
    title: "What time to wake up?",
  },
  {
    type: "fact",
    title: "Time flex",
    quote: "Consistent wake times boost focus and mood.",
  },
  {
    type: "multi",
    key: "goals",
    title: "Your morning goals?",
    subtitle: "Pick any.",
    options: [
      "Be productive",
      "Workout",
      "Real breakfast",
      "Stop rushing",
      "Quiet time",
    ],
  },
  {
    type: "single",
    key: "challenge",
    title: "Which challenge sounds best?",
    options: [
      "Math equations",
      "Barcode scan",
      "Take a photo",
    ],
  },
  {
    type: "social",
    title: "You're in great company",
    subtitle: "Thousands wake with Charrpy.",
    testimonials: [
      { name: "Maya, 27", quote: "41-day streak. Wild." },
      { name: "Jordan, 33", quote: "Math at 6am is rude. And it works." },
      { name: "Sam, 24", quote: "The fridge photo challenge slaps." },
    ],
  },
  {
    type: "fact",
    title: "Snooze trap",
    quote: "Snoozing fragments sleep and makes you groggier.",
  },
  {
    type: "gratitude",
    title: "Thanks for trusting us",
    subtitle: "We've got your mornings.",
    art: THANK_YOU,
  },
  {
    type: "commitment",
    title: "Ready to win mornings?",
    subtitle: "Let's set you up.",
  },
];

export const requiresInput = (s: OnboardingStep): boolean =>
  s.type === "single" || s.type === "multi" || s.type === "time";
