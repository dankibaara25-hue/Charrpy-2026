// Centralised onboarding step config for Charrpy.
// 15 steps mixing info, single/multi choice, time picker, fun facts, social
// proof, gratitude, and a final commitment slide. Fun-fact slides are spaced
// out (steps 6, 9, 13) so they break monotony without ever appearing back to
// back. Age and gender are intentionally omitted per product spec.

export type OnboardingStep =
  | {
      type: "info";
      title: string;
      subtitle: string;
      icon:
        | "alarm-outline"
        | "musical-notes-outline"
        | "camera-outline"
        | "trophy-outline";
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
      source?: string;
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
    }
  | {
      type: "commitment";
      title: string;
      subtitle: string;
    };

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    type: "info",
    title: "Set the time",
    subtitle: "Pick when you want to actually be up — not just dream about it.",
    icon: "alarm-outline",
  },
  {
    type: "info",
    title: "Select a ringtone",
    subtitle: "Choose your wake-up vibe, from gentle to absolutely chaotic.",
    icon: "musical-notes-outline",
  },
  {
    type: "info",
    title: "Complete the action",
    subtitle:
      "Solve a quick math, scan a barcode, or snap a photo — that's how the alarm dies.",
    icon: "camera-outline",
  },
  {
    type: "info",
    title: "Win the day",
    subtitle: "Stack streaks, climb the board, and own your mornings.",
    icon: "trophy-outline",
  },
  {
    type: "single",
    key: "struggle",
    title: "What's your biggest morning struggle?",
    subtitle: "We'll tune Charrpy to fight it for you.",
    options: [
      "Hitting snooze endlessly",
      "Doom-scrolling in bed",
      "Feeling too groggy to move",
      "Zero morning motivation",
    ],
  },
  {
    type: "fact",
    title: "Did you know?",
    quote:
      "It takes around 66 days, not 21, to lock in a real habit. We'll be right there with you.",
    source: "University College London study",
  },
  {
    type: "single",
    key: "snoozes",
    title: "Honestly — how often do you snooze?",
    options: [
      "Never, I'm a pro",
      "1 or 2 taps",
      "3 to 5 taps",
      "I set 10 alarms and still fail",
    ],
  },
  {
    type: "time",
    key: "wake_time",
    title: "What time do you want to wake up?",
    subtitle: "We'll use this as your starting alarm.",
  },
  {
    type: "fact",
    title: "Time flex",
    quote:
      "Studies link consistent wake times to better focus, mood, and even higher earnings over a career.",
    source: "Journal of Sleep Research",
  },
  {
    type: "multi",
    key: "goals",
    title: "What are your morning goals?",
    subtitle: "Pick as many as you like.",
    options: [
      "Be more productive",
      "Move my body / workout",
      "Eat a real breakfast",
      "Stop rushing out the door",
      "Have quiet time for myself",
    ],
  },
  {
    type: "single",
    key: "challenge",
    title: "Which wake-up challenge sounds best?",
    subtitle: "You can change this anytime later.",
    options: [
      "Math equations — wake up the brain",
      "Barcode scan — force me out of bed",
      "Photo of something — fridge, sink, sun",
    ],
  },
  {
    type: "social",
    title: "You're in great company",
    subtitle: "Thousands of early risers are already winning mornings.",
    testimonials: [
      {
        name: "Maya, 27",
        quote: "I haven't snoozed in 41 days. Wild.",
      },
      {
        name: "Jordan, 33",
        quote: "Math at 6am is rude. Effective, but rude.",
      },
      {
        name: "Sam, 24",
        quote: "The fridge photo challenge actually works.",
      },
    ],
  },
  {
    type: "fact",
    title: "The snooze trap",
    quote:
      "Snoozing fragments your sleep cycle, which can leave you groggier than just getting up the first time.",
    source: "Sleep Foundation",
  },
  {
    type: "gratitude",
    title: "Thanks for trusting us",
    subtitle:
      "Charrpy only works if you show up. We'll do our part — playful, kind, and a tiny bit annoying when it matters.",
  },
  {
    type: "commitment",
    title: "Ready to win your mornings?",
    subtitle:
      "Tap below to commit. Tomorrow's first win is already on the way.",
  },
];

// Required-input steps where Continue stays disabled until the user picks.
export const requiresInput = (s: OnboardingStep): boolean =>
  s.type === "single" || s.type === "multi" || s.type === "time";
