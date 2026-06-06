// Profile tab — banner avatar across the full width, nickname top-left,
// gear icon top-right (→ /settings), Add Friends share button, and an
// Overview section with streak (🔥) + XP (⚡) stats. Layout adapted from
// the user-supplied reference but rendered in Charrpy's warm-cream palette
// and our Duolingo-style 3D treatment.

import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import Button3D from "@/src/components/Button3D";
import { findAvatar } from "@/src/onboarding/avatars";
import { getUserProfile } from "@/src/lib/userProfile";
import { readStreak } from "@/src/lib/streak";
import { readXp } from "@/src/lib/xp";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";

const APP_URL = "https://www.charrpy.com";

export default function ProfileTab() {
  const router = useRouter();
  const [nickname, setNickname] = useState("friend");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [xp, setXp] = useState(0);

  const hydrate = useCallback(async () => {
    // Local cache first for instant paint, then Firestore truth.
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

  // Re-hydrate every time the tab regains focus (e.g. after editing profile).
  useFocusEffect(
    useCallback(() => {
      void hydrate();
    }, [hydrate]),
  );

  const avatar = findAvatar(avatarId);

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
      {/* Banner avatar spans full width. We render it OUTSIDE the SafeAreaView
          so the warm-cream bg extends to the very top, edge-to-edge. */}
      <View style={styles.banner}>
        {avatar ? (
          <Image
            source={avatar.source}
            style={styles.bannerImg}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Ionicons name="person" size={120} color={colors.shadow} />
          </View>
        )}
        <SafeAreaView
          edges={["top"]}
          pointerEvents="box-none"
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.bannerTopRow} pointerEvents="box-none">
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
              <Ionicons name="settings" size={22} color={colors.textMain} />
            </Pressable>
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
            label="Streak"
            value={`${streakCount}`}
            testID="profile-stat-streak"
          />
          <StatCard
            emoji="⚡"
            label="XP"
            value={`${xp}`}
            testID="profile-stat-xp"
          />
        </View>
      </ScrollView>
    </View>
  );
}

interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
  testID?: string;
}

const StatCard: React.FC<StatCardProps> = ({ emoji, label, value, testID }) => (
  <View style={styles.statCard} testID={testID}>
    <Text style={styles.statValue}>
      <Text style={styles.statEmoji}>{emoji}</Text> {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BANNER_HEIGHT = 320;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  banner: {
    width: "100%",
    height: BANNER_HEIGHT,
    backgroundColor: "#FFE3BD", // soft tan, on-brand stand-in for the green pattern in the reference
    overflow: "hidden",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  bannerPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  bannerName: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.textMain,
    flex: 1,
    paddingRight: space.md,
  },
  gearBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 4,
    borderBottomColor: colors.shadow,
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
    marginTop: space.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: space.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 5,
    borderBottomColor: colors.shadow,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    alignItems: "flex-start",
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.textMain,
  },
  statEmoji: {
    fontSize: 24,
  },
  statLabel: {
    ...type.caption,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
});
