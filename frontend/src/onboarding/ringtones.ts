// Ringtone roster — 5 short, locally-bundled WAV clips. Synthesised in
// /app/frontend/assets/audio/ringtones/ at build time so we don't depend on
// a CDN at runtime and everything works offline / in Expo Go.

import { AudioSource } from "expo-audio";

export interface Ringtone {
  id: string;
  label: string;
  vibe: string;
  source: AudioSource;
}

export const RINGTONES: Ringtone[] = [
  {
    id: "classic",
    label: "Classic Alarm",
    vibe: "Two-tone wake-up",
    source: require("../../assets/audio/ringtones/classic.wav"),
  },
  {
    id: "chime",
    label: "Bell Chime",
    vibe: "Bright bells",
    source: require("../../assets/audio/ringtones/chime.wav"),
  },
  {
    id: "gentle",
    label: "Gentle Morning",
    vibe: "Soft & slow",
    source: require("../../assets/audio/ringtones/gentle.wav"),
  },
  {
    id: "pop",
    label: "Pop Alarm",
    vibe: "Digital staccato",
    source: require("../../assets/audio/ringtones/pop.wav"),
  },
  {
    id: "melody",
    label: "Wake-up Melody",
    vibe: "Cheerful tune",
    source: require("../../assets/audio/ringtones/melody.wav"),
  },
];

export const findRingtone = (id?: string | null): Ringtone | undefined =>
  id ? RINGTONES.find((r) => r.id === id) : undefined;
