// Barcode dismissal challenge — full-screen camera with a dashed orange
// frame overlay. The user can scan ANY barcode (the dismiss action doesn't
// care what it decodes, just that we got a successful read). On success we
// stop the alarm audio, fire a haptic, and route to /reward.
//
// Camera permission is handled contextually here per <handle_permissions_contract>:
// we show a Charrpy-styled pre-permission card; the OS popup only appears
// after the user taps "Allow camera". If the user has permanently blocked
// the permission, we surface an "Open settings" CTA.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";

import Button3D from "@/src/components/Button3D";
import {
  BottomPill,
  ChallengeHint,
  DashedFrame,
} from "@/src/challenges/CameraChrome";
import { useAlarmAudio } from "@/src/challenges/useAlarmAudio";
import { colors, fonts, radius, space, type } from "@/src/theme";

export default function BarcodeChallenge() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { stop } = useAlarmAudio(id);
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);

  const onScanned = useCallback(
    (_result: BarcodeScanningResult) => {
      if (handledRef.current) return;
      handledRef.current = true;
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
      stop();
      router.replace("/reward?from=barcode");
    },
    [router, stop],
  );

  const handleBack = useCallback(() => {
    stop();
    router.back();
  }, [router, stop]);

  // ---------- Permission gating ----------
  if (!permission) {
    return (
      <SafeAreaView style={styles.gateSafe} edges={["top", "bottom"]} />
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.gateSafe}
        edges={["top", "bottom"]}
        testID="barcode-permission-gate"
      >
        <View style={styles.gateBody}>
          <View style={styles.gateBadge}>
            <Ionicons name="barcode" size={36} color={colors.textInverse} />
          </View>
          <Text style={styles.gateTitle}>Camera needed</Text>
          <Text style={styles.gateSubtitle}>
            Scan any barcode in your home — kitchen, bathroom, books — to
            switch off the alarm.
          </Text>
        </View>
        <View style={styles.gateFooter}>
          {permission.canAskAgain ? (
            <Button3D
              label="Allow camera"
              onPress={() => {
                void requestPermission();
              }}
              testID="barcode-allow-camera"
            />
          ) : (
            <Button3D
              label="Open settings"
              onPress={() => {
                Linking.openSettings().catch(() => {});
              }}
              testID="barcode-open-settings"
            />
          )}
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={styles.gateBack}
            testID="barcode-permission-back"
          >
            <Text style={styles.gateBackText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Camera UI ----------
  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="barcode-challenge-screen"
    >
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
            "code93",
            "codabar",
            "itf14",
            "pdf417",
            "aztec",
            "datamatrix",
          ],
        }}
        onBarcodeScanned={onScanned}
      />
      <View pointerEvents="none" style={styles.dimOverlay} />

      <View style={styles.content}>
        <View style={styles.topSpacer} />
        <DashedFrame shape="rect" testID="barcode-frame" />
        <View style={styles.iconSlot}>
          <Ionicons name="flash-outline" size={28} color="#FFFFFF" />
        </View>
        <ChallengeHint
          text={
            Platform.OS === "web"
              ? "Web preview can't read barcodes — try a real device."
              : "Scan any barcode to dismiss the alarm"
          }
          testID="barcode-hint"
        />
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.bottomBar}>
        <BottomPill
          label="Back"
          onPress={handleBack}
          variant="primary"
          testID="barcode-back-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  topSpacer: { height: space.xxl },
  iconSlot: {
    marginTop: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    paddingTop: space.sm,
  },
  // Permission gate
  gateSafe: { flex: 1, backgroundColor: colors.background },
  gateBody: {
    flex: 1,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  gateBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDark,
  },
  gateTitle: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "center",
    marginBottom: space.xs,
  },
  gateSubtitle: {
    ...type.body,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    textAlign: "center",
    paddingHorizontal: space.sm,
  },
  gateFooter: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
  },
  gateBack: {
    alignSelf: "center",
    marginTop: space.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  gateBackText: {
    ...type.caption,
    color: colors.textMuted,
    fontFamily: fonts.semibold,
  },
});
