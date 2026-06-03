// Nickname picker → Firebase Anonymous sign-in → paywall.

import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { signInAnonymously } from "firebase/auth";

import Button3D from "@/src/components/Button3D";
import { auth } from "@/src/lib/firebase";
import { findAvatar } from "@/src/onboarding/avatars";
import { colors, fonts, radius, space, type } from "@/src/theme";
import { storage } from "@/src/utils/storage";

const MIN = 2;
const MAX = 16;
const VALID = /^[A-Za-z0-9_.-]+$/;

export default function Nickname() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);

  React.useEffect(() => {
    storage.getItem("charrpy.avatar.id", "").then((v) => {
      if (typeof v === "string" && v) setAvatarId(v);
    });
  }, []);

  const trimmed = nickname.trim();
  const valid = trimmed.length >= MIN && trimmed.length <= MAX && VALID.test(trimmed);

  const handleCreate = async () => {
    if (!valid || loading) return;
    setError(null);
    setLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      await storage.setItem("charrpy.uid", cred.user.uid);
      await storage.setItem("charrpy.nickname", trimmed);
      await storage.setItem("charrpy.onboarding.completed", true);
      router.replace("/paywall");
    } catch (e) {
      console.error("anon sign-in failed", e);
      setError("Couldn't create your account. Please try again.");
      setLoading(false);
    }
  };

  const avatar = findAvatar(avatarId);

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="nickname-screen"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          testID="nickname-back-button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {avatar ? (
            <View style={styles.avatarWrap}>
              <Image
                source={avatar.source}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          ) : null}

          <Text style={styles.title}>Pick a nickname</Text>
          <Text style={styles.subtitle}>Friends will see this.</Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={nickname}
              onChangeText={(v) => {
                setNickname(v);
                setError(null);
              }}
              placeholder="early.bird"
              placeholderTextColor={colors.shadowSoft}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={MAX + 4}
              style={styles.input}
              testID="nickname-input"
            />
          </View>
          <Text style={styles.hint}>
            {MIN}-{MAX} letters, numbers, . _ - allowed.
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button3D
          label={loading ? "Creating…" : "Create account"}
          onPress={handleCreate}
          disabled={!valid || loading}
          testID="nickname-create-button"
        />
      </View>
    </SafeAreaView>
  );
}

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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    alignItems: "center",
  },
  avatarWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.shadow,
    borderBottomWidth: 6,
    borderBottomColor: colors.shadow,
    marginBottom: space.lg,
  },
  avatar: { width: "100%", height: "100%" },
  title: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: space.xl,
  },
  inputWrap: {
    width: "100%",
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
    marginTop: space.sm,
  },
  error: {
    ...type.caption,
    color: colors.danger,
    marginTop: space.sm,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
});
