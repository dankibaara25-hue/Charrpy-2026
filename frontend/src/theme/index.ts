// Charrpy design tokens — sourced from /app/design_guidelines.json with a
// post-MVP refresh to a warm cream palette so the Duolingo-style 3D depth
// reads strongly. Single source of truth for colors, typography, and spacing.

export const colors = {
  // Warm cream surface — chosen to make orange accents and 3D shadows pop.
  background: "#FFF6E5",
  surface: "#FFFFFF",
  surfaceMuted: "#FFEFD0",
  // Strong contrast bottom border used by every 3D control so the depth
  // is visible on the cream background.
  shadow: "#2A1A0A",
  shadowSoft: "#C9A77E",
  primary: "#FF9500",
  primaryDark: "#B86600",
  primaryLight: "#FFB74D",
  gradientStart: "#FF9500",
  gradientEnd: "#FFC000",
  textMain: "#2A1A0A",
  textMuted: "#7A5C3F",
  textInverse: "#FFFFFF",
  // Onboarding progress bar track — white feels too washed-out on cream,
  // so use a soft amber tint.
  track: "#F2DCB0",
  danger: "#E03B2C",
  success: "#2A9D47",
} as const;

export const fonts = {
  regular: "Fredoka_400Regular",
  medium: "Fredoka_500Medium",
  semibold: "Fredoka_600SemiBold",
  bold: "Fredoka_700Bold",
} as const;

export const type = {
  display: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 38, letterSpacing: 0.5 },
  h1: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 32, letterSpacing: 0.25 },
  h2: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyBold: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
} as const;

export const space = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 48, massive: 64,
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;
