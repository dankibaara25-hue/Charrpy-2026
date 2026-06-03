// Avatar selection screen — lean copy on a cream background. Duolingo-style
// 3D selection treatment with strong dark border so the depth pops.

import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import Button3D from "@/src/components/Button3D";
import { AVATARS } from "@/src/onboarding/avatars";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";

const COLUMNS = 3;
const GUTTER = 12;
const SCREEN_PADDING = 24;
const DEPTH = 6;

export default function AvatarSelect() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>(null);

  const tileSize =
    (width - SCREEN_PADDING * 2 - GUTTER * (COLUMNS - 1)) / COLUMNS;

  const handleContinue = async () => {
    if (!selected) return;
    await storage.setItem("charrpy.avatar.id", selected);
    router.push("/nickname");
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="avatar-select-screen"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          testID="avatar-select-back-button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.title}>Pick your avatar</Text>
        <Text style={styles.subtitle}>One tap.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridWrap}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {AVATARS.map((a) => (
            <AvatarTile
              key={a.id}
              source={a.source}
              size={tileSize}
              selected={selected === a.id}
              onPress={() => {
                setSelected(a.id);
                Haptics.selectionAsync().catch(() => {});
              }}
              testID={`avatar-tile-${a.id}`}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button3D
          label="Continue"
          onPress={handleContinue}
          disabled={!selected}
          testID="avatar-select-continue-button"
        />
      </View>
    </SafeAreaView>
  );
}

interface AvatarTileProps {
  source: import("react-native").ImageSourcePropType;
  size: number;
  selected: boolean;
  onPress: () => void;
  testID: string;
}

const AvatarTile: React.FC<AvatarTileProps> = ({
  source,
  size,
  selected,
  onPress,
  testID,
}) => {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      testID={testID}
      style={{ width: size, marginBottom: GUTTER }}
    >
      <View
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            borderColor: selected ? colors.primary : colors.shadow,
            borderBottomColor: selected ? colors.primaryDark : colors.shadow,
            borderBottomWidth: pressed ? 0 : DEPTH,
            marginTop: pressed ? DEPTH : 0,
            backgroundColor: selected ? colors.primary : colors.surface,
          },
        ]}
      >
        <Image source={source} style={styles.image} resizeMode="cover" />
        {selected ? (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={18} color={colors.textInverse} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  intro: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  title: { ...type.h1, color: colors.textMain, marginBottom: 2 },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
  },
  gridWrap: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: space.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    borderRadius: radius.lg,
    borderWidth: 3,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  check: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
