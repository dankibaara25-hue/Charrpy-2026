// Random household objects we can ask the user to snap a photo of during
// the wake-up photo challenge. We don't run ML on the captured image — the
// "verification" is simply that the user got out of bed, framed the object,
// and held the camera steady long enough for the auto-capture to fire.
// Keeping the list deliberately short, common, and visual.

export interface TargetObject {
  id: string;
  label: string; // displayed under the frame
  hint?: string; // tiny secondary hint (optional)
  emoji: string;
}

export const TARGET_OBJECTS: TargetObject[] = [
  { id: "water-glass", label: "a glass of water", emoji: "💧" },
  { id: "water-bottle", label: "a water bottle", emoji: "🍶" },
  { id: "toothbrush", label: "your toothbrush", emoji: "🪥" },
  { id: "fridge", label: "your fridge", emoji: "🧊" },
  { id: "sink", label: "the bathroom sink", emoji: "🚿" },
  { id: "kettle", label: "the kettle", emoji: "🫖" },
  { id: "shoes", label: "a pair of shoes", emoji: "👟" },
  { id: "book", label: "any book", emoji: "📖" },
  { id: "chair", label: "a chair", emoji: "🪑" },
  { id: "window", label: "the nearest window", emoji: "🪟" },
  { id: "plant", label: "a houseplant", emoji: "🪴" },
  { id: "towel", label: "a towel", emoji: "🧺" },
  { id: "mug", label: "a coffee mug", emoji: "☕" },
  { id: "remote", label: "the TV remote", emoji: "📺" },
  { id: "fruit", label: "a piece of fruit", emoji: "🍎" },
];

export const pickRandomTarget = (): TargetObject => {
  const i = Math.floor(Math.random() * TARGET_OBJECTS.length);
  return TARGET_OBJECTS[i];
};
