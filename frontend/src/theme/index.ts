// Charrpy design tokens — sourced from /app/design_guidelines.json.
// Keep this file the single source of truth for colors, typography, and spacing.

export const colors = {
  background: "#141416",
  surface: "#222226",
  surfaceHighlight: "#2E2E32",
  surfaceShadow: "#1A1A1D",
  primary: "#FF9500",
  primaryDark: "#CC7700",
  primaryLight: "#FFB74D",
  gradientStart: "#FF9500",
  gradientEnd: "#FFC000",
  textMain: "#FDFDFD",
  textMuted: "#A0A0A5",
  textInverse: "#141416",
  track: "#FFFFFF",
  danger: "#FF3B30",
  success: "#34C759",
} as const;

export const fonts = {
  regular: "Fredoka_400Regular",
  medium: "Fredoka_500Medium",
  semibold: "Fredoka_600SemiBold",
  bold: "Fredoka_700Bold",
} as const;

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 48, letterSpacing: 0.5 },
  h1: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 40, letterSpacing: 0.25 },
  h2: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32 },
  h3: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 28 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyBold: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  massive: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;
