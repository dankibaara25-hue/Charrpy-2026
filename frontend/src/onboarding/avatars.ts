// Avatar roster — rasterised PNGs (transparent background) generated from
// the source SVGs in the user's repo:
//   https://github.com/dankibaara25-hue/Charrpy-2026/tree/main/frontend/assets/images/avatars
//
// Because the avatars are transparent, the "background" you see behind the
// character is rendered by the container View (banner / tile / chip /
// circle wrap) in app code. The background color is a single brand token
// (`colors.avatarBg`) — change it once in the theme and every avatar
// surface across the app updates in lock-step.

import { ImageSourcePropType } from "react-native";

import { colors } from "@/src/theme";

export interface Avatar {
  id: string;
  source: ImageSourcePropType;
  /**
   * Background color rendered *behind* the transparent avatar PNG.
   * Currently sourced from the brand token so all avatars share the same
   * off-white / lightest-gray hue. If we ever want per-avatar tints again
   * we can override this per entry without changing the consumers.
   */
  bgColor: string;
}

export const AVATARS: Avatar[] = [
  { id: "a01", source: require("../../assets/images/avatars/01.png"), bgColor: colors.avatarBg },
  { id: "a02", source: require("../../assets/images/avatars/02.png"), bgColor: colors.avatarBg },
  { id: "a03", source: require("../../assets/images/avatars/03.png"), bgColor: colors.avatarBg },
  { id: "a04", source: require("../../assets/images/avatars/04.png"), bgColor: colors.avatarBg },
  { id: "a05", source: require("../../assets/images/avatars/05.png"), bgColor: colors.avatarBg },
  { id: "a06", source: require("../../assets/images/avatars/06.png"), bgColor: colors.avatarBg },
  { id: "a07", source: require("../../assets/images/avatars/07.png"), bgColor: colors.avatarBg },
  { id: "a08", source: require("../../assets/images/avatars/08.png"), bgColor: colors.avatarBg },
  { id: "a09", source: require("../../assets/images/avatars/09.png"), bgColor: colors.avatarBg },
  { id: "a10", source: require("../../assets/images/avatars/10.png"), bgColor: colors.avatarBg },
  { id: "a11", source: require("../../assets/images/avatars/11.png"), bgColor: colors.avatarBg },
  { id: "a12", source: require("../../assets/images/avatars/12.png"), bgColor: colors.avatarBg },
  { id: "a13", source: require("../../assets/images/avatars/13.png"), bgColor: colors.avatarBg },
  { id: "a14", source: require("../../assets/images/avatars/14.png"), bgColor: colors.avatarBg },
  { id: "a15", source: require("../../assets/images/avatars/15.png"), bgColor: colors.avatarBg },
  { id: "a16", source: require("../../assets/images/avatars/16.png"), bgColor: colors.avatarBg },
];

// Fallback used when no avatar has been chosen yet (e.g. brand-new account).
// Stays in sync with the per-avatar bg so the banner shape never changes
// mid-onboarding.
export const DEFAULT_BANNER_BG = colors.avatarBg;

export const findAvatar = (id?: string | null): Avatar | undefined =>
  id ? AVATARS.find((a) => a.id === id) : undefined;
