// Profile tab — banner avatar across the full width, nickname top-left,
// gear icon top-right (→ /settings), Add Friends share button, and an
// Overview section showing the streak (🔥) + XP (⚡) stats. Layout follows
// the user-supplied reference: the avatar sits *inside* the tan banner at a
// proportionally smaller size (not cropped), and the device's status bar is
// tinted to match the banner background so the top of the screen reads as
// one continuous shape. Overview stats are minimal — icon + bold value +
// small unit label, side-by-side.

import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import Button3D from "@/src/components/Button3D";
import { DEFAULT_BANNER_BG, findAvatar } from "@/src/onboarding/avatars";
import { getUserProfile } from "@/src/lib/userProfile";
import { readStreak } from "@/src/lib/streak";
import { readXp } from "@/src/lib/xp";
import { colors, fonts, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";

const APP_URL = "https://www.charrpy.com";

export default function ProfileTab() {
  const router = useRouter();
  const [nickname, setNickname] = useState("friend");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [xp, setXp] = useState(0);

  const hydrate = useCallback(async () => {
    const [n, a, s, x] = await Promise.all([
      storage.getItem("charrpy.nickname", ""),
      storage.getItem("charrpy.avatar.id", ""),
      readStreak(),
      readXp(),
    ]);
    if (typeof n === "string" && n) setNickname(n);
    if (typeof a === "string" && a) setAvatarId(a);
    setStreakCount(s.count);
    setXp(x);
    try {
      const profile = await getUserProfile();
      if (profile.nickname) setNickname(profile.nickname);
      if (profile.avatarId) setAvatarId(profile.avatarId);
      if (profile.streak?.count != null) setStreakCount(profile.streak.count);
      if (profile.xp?.total != null) setXp(profile.xp.total);
    } catch {
      /* offline / signed-out — local cache is good enough */
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useFocusEffect(
    useCallback(() => {
      void hydrate();
    }, [hydrate]),
  );

  const avatar = findAvatar(avatarId);
  // The banner + status-bar pull their tint from the avatar so the top of
  // the screen reads as one coherent color with the character. Falls back
  // to the on-brand tan when no avatar has been picked yet.
  const bannerBg = avatar?.bgColor ?? DEFAULT_BANNER_BG;

  const handleShare = useCallback(async () => {
    Haptics.selectionAsync().catch(() => {});
    try {
      await Share.share({
        message: `Wake up like a champ 🐤 — try Charrpy: ${APP_URL}`,
        url: APP_URL,
      });
    } catch (e) {
      console.warn("[profile] share failed", e);
    }
  }, []);

  return (
    <View style={styles.root} testID="profile-screen">
      {/* Tint the status bar to match the banner bg so the top of the screen
          reads as one continuous tan area. On Android the system bar is
          actually colored; on iOS the SafeArea inset over the same tan
          backdrop achieves the same effect. */}
      <StatusBar
        style="dark"
        backgroundColor={Platform.OS === "android" ? bannerBg : undefined}
      />

      <View style={[styles.banner, { backgroundColor: bannerBg }]}>
        <SafeAreaView edges={["top"]} style={styles.bannerSafeArea}>
          <View style={styles.bannerTopRow}>
            <Text
              style={styles.bannerName}
              numberOfLines={1}
              testID="profile-nickname"
            >
              {nickname}
            </Text>
            <Pressable
              onPress={() => router.push("/settings")}
              hitSlop={12}
              style={styles.gearBtn}
              testID="profile-settings-button"
            >
              <Ionicons name="settings" size={20} color={colors.textMain} />
            </Pressable>
          </View>

          <View style={styles.avatarSlot}>
            {avatar ? (
              <Image
                source={avatar.source}
                style={styles.avatarImg}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={88} color={colors.shadow} />
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Button3D
          label="＋  Add friends"
          onPress={handleShare}
          testID="profile-add-friends-button"
        />

        <Text style={styles.section}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            emoji="🔥"
            value={`${streakCount}`}
            unit={streakCount === 1 ? "day" : "days"}
            testID="profile-stat-streak"
          />
          <StatCard
            emoji="⚡"
            value={`${xp}`}
            unit="XP"
            testID="profile-stat-xp"
          />
        </View>
      </ScrollView>
    </View>
  );
}

interface StatCardProps {
  emoji: string;
  value: string;
  unit: string;
  testID?: string;
}

const StatCard: React.FC<StatCardProps> = ({ emoji, value, unit, testID }) => (
  <View style={styles.statCard} testID={testID}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue} numberOfLines={1}>
      {value} <Text style={styles.statUnit}>{unit}</Text>
    </Text>
  </View>
);

// Avatar slot lives INSIDE the banner so we control its size and prevent the
// cropping issue caused by resizeMode:"cover". Banner height + avatar height
// are tuned so the head/shoulders of the avatar are fully visible.
const BANNER_HEIGHT = 240;
const AVATAR_SIZE = 150;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  banner: {
    width: "100%",
    height: BANNER_HEIGHT,
    overflow: "hidden",
  },
  bannerSafeArea: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  bannerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: space.xs,
  },
  bannerName: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.textMain,
    flex: 1,
    paddingRight: space.md,
    textTransform: "lowercase",
  },
  gearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 4,
    borderBottomColor: colors.shadow,
  },
  avatarSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarImg: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: 120,
    gap: space.md,
  },
  section: {
    ...type.caption,
    color: colors.primary,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: space.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: space.lg,
    alignItems: "center",
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textMain,
  },
  statUnit: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
});
