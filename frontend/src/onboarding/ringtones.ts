// Ringtone catalog. The full set is the user's curated library of 34 MP3
// clips (frontend/assets/audio/ringtones). We expose:
//
//   • RINGTONES — the full library, used by the in-app Sound picker on
//     alarm-edit so users can browse the whole catalog when creating an
//     alarm.
//   • ONBOARDING_RINGTONES — a hand-picked first 5 shown during onboarding
//     so the "pick a ringtone" step stays short + breezy. These IDs are a
//     subset of RINGTONES.
//   • findRingtone(id) — resolver used by alarm-ring / useAlarmAudio.

import { AudioSource } from "expo-audio";

export interface Ringtone {
  id: string;
  label: string;
  vibe: string;
  source: AudioSource;
}

// Helper to keep declarations compact + readable.
const r = (id: string, label: string, vibe: string, mod: AudioSource): Ringtone => ({
  id,
  label,
  vibe,
  source: mod,
});

// NOTE: require() must be called with literal string paths so Metro can
// statically resolve and bundle each asset. Don't refactor to a loop.
export const RINGTONES: Ringtone[] = [
  r(
    "classic",
    "Classic",
    "Timeless ring",
    require("../../assets/audio/ringtones/ringtone_classic.mp3"),
  ),
  r(
    "piano",
    "Piano Musical",
    "Soft piano",
    require("../../assets/audio/ringtones/piano_musical.mp3"),
  ),
  r(
    "tropical",
    "Tropical Marimba",
    "Sunny marimba",
    require("../../assets/audio/ringtones/tropical_marimba.mp3"),
  ),
  r(
    "celestial",
    "Celestial Calm",
    "Soft & dreamy",
    require("../../assets/audio/ringtones/celestial_calm.mp3"),
  ),
  r(
    "modern",
    "Modern HD",
    "Crisp & modern",
    require("../../assets/audio/ringtones/modern_ringtone_hd.mp3"),
  ),
  // ---- Extended library — surfaced in the in-app Sound picker only ----
  r(
    "heavy",
    "Heavy Alarm",
    "Strong wake-up",
    require("../../assets/audio/ringtones/alarm_sounds_for_heavy.mp3"),
  ),
  r(
    "alert",
    "Phone Alert",
    "Sharp alert",
    require("../../assets/audio/ringtones/alert_phone_ring.mp3"),
  ),
  r(
    "cinematic",
    "Cinematic Bell",
    "Movie bell",
    require("../../assets/audio/ringtones/cinematic_bell_rington.mp3"),
  ),
  r(
    "danube",
    "Danube Waltz",
    "Classical waltz",
    require("../../assets/audio/ringtones/danube_waltz_strauss.mp3"),
  ),
  r(
    "galaxy",
    "Galaxy",
    "Spacey ring",
    require("../../assets/audio/ringtones/galaxy_ringtones_free.mp3"),
  ),
  r(
    "bassdrop",
    "Bass Drop",
    "Heavy EDM",
    require("../../assets/audio/ringtones/heavy_edm_bass_drop.mp3"),
  ),
  r(
    "hypertick",
    "Hyper Tick",
    "Ticking pulse",
    require("../../assets/audio/ringtones/hyper_tick.mp3"),
  ),
  r(
    "celebrate",
    "Celebrate",
    "Cheerful tune",
    require("../../assets/audio/ringtones/i_celebrate_me_song.mp3"),
  ),
  r(
    "sinepluck",
    "Sine Pluck",
    "Smooth pluck",
    require("../../assets/audio/ringtones/ip_sound_sine_pluck.mp3"),
  ),
  r(
    "loud",
    "Loud Ring",
    "Maximum volume",
    require("../../assets/audio/ringtones/loud_ringtones.mp3"),
  ),
  r(
    "love",
    "Love Ring",
    "Warm & sweet",
    require("../../assets/audio/ringtones/love_phone_ring.mp3"),
  ),
  r(
    "march",
    "Marching Band",
    "Up & at 'em",
    require("../../assets/audio/ringtones/marching_band.mp3"),
  ),
  r(
    "minion",
    "Minion Tone",
    "Playful pop",
    require("../../assets/audio/ringtones/minion_text_tone.mp3"),
  ),
  r(
    "mobile",
    "Mobile Ring",
    "Standard ring",
    require("../../assets/audio/ringtones/mobile_phone_ring.mp3"),
  ),
  r(
    "mobiletone",
    "Mobile Tone",
    "Phone-style",
    require("../../assets/audio/ringtones/mobile_ring.mp3"),
  ),
  r(
    "neon",
    "Neon House",
    "House groove",
    require("../../assets/audio/ringtones/neon_house_beat.mp3"),
  ),
  r(
    "notif",
    "Notification",
    "Quick alert",
    require("../../assets/audio/ringtones/notificacion_alert.mp3"),
  ),
  r(
    "phonealert",
    "Phone Alert 2",
    "Bright ring",
    require("../../assets/audio/ringtones/phone_ring_alert.mp3"),
  ),
  r(
    "pianoring",
    "Piano Ring",
    "Classical piano",
    require("../../assets/audio/ringtones/piano_ringtones.mp3"),
  ),
  r(
    "pulse",
    "Pulse Beat",
    "Rhythmic pulse",
    require("../../assets/audio/ringtones/pulse_beat_phone.mp3"),
  ),
  r(
    "redbubble",
    "Red Bubble",
    "Bubbly house",
    require("../../assets/audio/ringtones/red_bubble_house.mp3"),
  ),
  r(
    "rhythm",
    "Rhythm Call",
    "Catchy rhythm",
    require("../../assets/audio/ringtones/rhythm_call.mp3"),
  ),
  r(
    "ringring",
    "Ring Ring",
    "Old-school",
    require("../../assets/audio/ringtones/ring_ringg.mp3"),
  ),
  r(
    "aqua",
    "Aqua",
    "Watery tones",
    require("../../assets/audio/ringtones/ringtons_free_aqua.mp3"),
  ),
  r(
    "salsa",
    "Salsa",
    "Latin dance",
    require("../../assets/audio/ringtones/salsa.mp3"),
  ),
  r(
    "superalarm",
    "Super Alarm",
    "Get up now",
    require("../../assets/audio/ringtones/super_alarm_ringtone.mp3"),
  ),
  r(
    "bright",
    "Bright Track",
    "Bright melody",
    require("../../assets/audio/ringtones/track_bright.mp3"),
  ),
  r(
    "turbo",
    "Turbo Wave",
    "Surf vibes",
    require("../../assets/audio/ringtones/turbo_wave_ring.mp3"),
  ),
  r(
    "universfield",
    "Universfield",
    "Modern signal",
    require("../../assets/audio/ringtones/universfield-ringtone-030-437513.mp3"),
  ),
];

// First 5 — used by the onboarding "Pick a ringtone" step so users only
// see a short, curated set. The remaining ~29 are exposed inside the
// in-app Sound picker on /alarm-edit.
export const ONBOARDING_RINGTONES: Ringtone[] = RINGTONES.slice(0, 5);

export const findRingtone = (id?: string | null): Ringtone | undefined =>
  id ? RINGTONES.find((rr) => rr.id === id) : undefined;
