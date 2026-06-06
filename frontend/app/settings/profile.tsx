// Edit Profile — same banner-style avatar header as the Profile tab. A
// horizontally scrollable strip of all avatars is rendered below the banner
// so the user can tap to swap. Nickname is editable on its own row. A
// Delete account button sits at the very bottom of the page.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

import Button3D from "@/src/components/Button3D";
import { KeyboardAwareScrollViewShim as KeyboardAwareScrollView } from "@/src/components/KeyboardProviderShim";
import { AVATARS, findAvatar } from "@/src/onboarding/avatars";
import { auth } from "@/src/lib/firebase";
import {
  deleteUserProfile,
  getUserProfile,
  updateProfile,
} from "@/src/lib/userProfile";
import { storage } from "@/src/utils/storage";
import { colors, fonts, radius, space, type } from "@/src/theme";

const MIN = 2;
const MAX = 16;
const VALID = /^[A-Za-z0-9_.-]+$/;

export default function EditProfile() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [n, a] = await Promise.all([
        storage.getItem("charrpy.nickname", ""),
        storage.getItem("charrpy.avatar.id", ""),
      ]);
      if (typeof n === "string") setNickname(n);
      if (typeof a === "string" && a) setAvatarId(a);
      try {
        const p = await getUserProfile();
        if (p.nickname) setNickname(p.nickname);
        if (p.avatarId) setAvatarId(p.avatarId);
      } catch {
        /* offline */
      }
    })();
  }, []);

  const avatar = findAvatar(avatarId);

  const trimmed = nickname.trim();
  const validNick =
    trimmed.length >= MIN && trimmed.length <= MAX && VALID.test(trimmed);

  const handleSave = useCallback(async () => {
    if (!validNick || saving) return;
    setSaving(true);
    try {
      await updateProfile({ nickname: trimmed, avatarId: avatarId ?? "" });
      router.back();
    } catch (e) {
      console.warn("[edit-profile] save failed", e);
      Alert.alert("Save failed", "Could not save your changes. Please retry.");
      setSaving(false);
    }
  }, [avatarId, router, saving, trimmed, validNick]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete account?",
      "This permanently removes your nickname, avatar, streak, and XP. Your alarms will also be cleared. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserProfile();
            } catch {
              /* noop */
            }
            try {
              await auth.currentUser?.delete();
            } catch {
              await signOut(auth).catch(() => {});
            }
            await Promise.all([
              storage.removeItem("charrpy.uid"),
              storage.removeItem("charrpy.nickname"),
              storage.removeItem("charrpy.avatar.id"),
              storage.removeItem("charrpy.onboarding.completed"),
              storage.removeItem("charrpy.alarms"),
              storage.removeItem("charrpy.streak"),
              storage.removeItem("charrpy.xp"),
              storage.removeItem("charrpy.xp.last_award"),
            ]);
            router.replace("/welcome");
          },
        },
      ],
    );
  }, [router]);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["bottom"]}
      testID="edit-profile-screen"
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={140}
      >
        {/* Banner avatar */}
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
            style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]}
          >
            <View style={[styles.bannerTopRow, { pointerEvents: "box-none" }]}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                style={styles.gearBtn}
                testID="edit-profile-back-button"
              >
                <Ionicons name="chevron-back" size={22} color={colors.textMain} />
              </Pressable>
              <View style={{ flex: 1 }} />
            </View>
          </SafeAreaView>
        </View>

        {/* Avatar carousel */}
        <Text style={styles.section}>Choose avatar</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarStrip}
        >
          {AVATARS.map((a) => {
            const selected = a.id === avatarId;
            return (
              <Pressable
                key={a.id}
                onPress={() => setAvatarId(a.id)}
                style={[
                  styles.avatarChip,
                  {
                    borderColor: selected ? colors.primary : colors.shadow,
                    borderBottomColor: selected
                      ? colors.primaryDark
                      : colors.shadow,
                    backgroundColor: selected ? "#FFE3BD" : colors.surface,
                  },
                ]}
                testID={`edit-profile-avatar-${a.id}`}
              >
                <Image
                  source={a.source}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Nickname */}
        <Text style={styles.section}>Nickname</Text>
        <View style={styles.inputWrap}>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="early.bird"
            placeholderTextColor={colors.shadowSoft}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={MAX + 4}
            style={styles.input}
            testID="edit-profile-nickname-input"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>
        <Text style={styles.hint}>
          {MIN}-{MAX} letters, numbers, . _ - allowed.
        </Text>

        <View style={styles.actionsWrap}>
          <Button3D
            label={saving ? "Saving…" : "Save changes"}
            onPress={handleSave}
            disabled={!validNick || saving}
            testID="edit-profile-save-button"
          />
        </View>

        <View style={{ height: space.xl }} />
        <Pressable
          onPress={handleDelete}
          style={styles.deleteBtn}
          testID="edit-profile-delete-button"
        >
          <Ionicons name="trash" size={18} color={colors.danger} />
          <Text style={styles.deleteLabel}>Delete account</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const BANNER_HEIGHT = 280;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: space.xxl },
  banner: {
    width: "100%",
    height: BANNER_HEIGHT,
    backgroundColor: "#FFE3BD",
    overflow: "hidden",
  },
  bannerImg: { width: "100%", height: "100%" },
  bannerPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingTop: space.sm,
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
  section: {
    ...type.caption,
    color: colors.primary,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: space.lg,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  avatarStrip: {
    paddingHorizontal: space.lg,
    gap: 12,
    paddingVertical: 4,
  },
  avatarChip: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderBottomWidth: 5,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  inputWrap: {
    marginHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.shadow,
    borderBottomWidth: 5,
    borderBottomColor: colors.shadow,
  },
  input: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.textMain,
  },
  hint: {
    ...type.small,
    color: colors.textMuted,
    paddingHorizontal: space.lg,
    marginTop: space.sm,
  },
  deleteBtn: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionsWrap: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  deleteLabel: {
    ...type.body,
    color: colors.danger,
    fontFamily: fonts.semibold,
  },
});
