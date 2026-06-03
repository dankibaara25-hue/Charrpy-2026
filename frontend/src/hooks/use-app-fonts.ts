// Loads the Fredoka font family used across Charrpy.
// Returns [loaded, error] like expo-font's useFonts.

import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";

export const useAppFonts = (): readonly [boolean, Error | null] =>
  useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });
