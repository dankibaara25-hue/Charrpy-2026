// Charrpy onboarding flow — single screen managing all 15 steps locally so
// we keep navigation state in one place (rather than 15 routes). Step state
// is committed to storage on completion so we can later branch the entry
// route based on whether the user has finished onboarding.

import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInRight,
  FadeOutLeft,
} from "react-native-reanimated";

import Button3D from "@/src/components/Button3D";
import Chip3D from "@/src/components/Chip3D";
import ProgressBar from "@/src/components/ProgressBar";
import TimePickerInline, {
  TimeValue,
} from "@/src/components/TimePickerInline";
import { colors, fonts, radius, space, type } from "@/src/theme";
import {
  ONBOARDING_STEPS,
  OnboardingStep,
  requiresInput,
} from "@/src/onboarding/steps";
import { storage } from "@/src/utils/storage";

type Answers = {
  single: Record<string, string>;
  multi: Record<string, string[]>;
  time: Record<string, TimeValue>;
};

const DEFAULT_TIME: TimeValue = { hour: 7, minute: 0, meridiem: "AM" };

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    single: {},
    multi: {},
    time: {},
  });

  const step = ONBOARDING_STEPS[index];
  const total = ONBOARDING_STEPS.length;
  const progress = (index + 1) / total;

  const canContinue = useMemo(() => {
    if (!requiresInput(step)) return true;
    if (step.type === "single") return !!answers.single[step.key];
    if (step.type === "multi")
      return (answers.multi[step.key]?.length ?? 0) > 0;
    // Time step: TimePickerInline always shows a valid value (DEFAULT_TIME
    // when nothing is set), so the step is considered complete by default.
    if (step.type === "time") return true;
    return true;
  }, [answers, step]);

  const handleBack = useCallback(() => {
    if (index === 0) {
      router.back();
      return;
    }
    setIndex((i) => i - 1);
  }, [index, router]);

  const handleContinue = useCallback(async () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // Final commit — persist & route on to avatar selection.
    await storage.setItem(
      "charrpy.onboarding.answers",
      JSON.stringify(answers),
    );
    router.replace("/avatar-select");
  }, [answers, index, router, total]);

  const setSingle = (key: string, value: string) =>
    setAnswers((a) => ({ ...a, single: { ...a.single, [key]: value } }));

  const toggleMulti = (key: string, value: string) =>
    setAnswers((a) => {
      const current = a.multi[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...a, multi: { ...a.multi, [key]: next } };
    });

  const setTime = (key: string, value: TimeValue) =>
    setAnswers((a) => ({ ...a, time: { ...a.time, [key]: value } }));

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
      testID="onboarding-screen"
    >
      {/* Header — back + progress */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={styles.backBtn}
          testID="onboarding-back-button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </Pressable>
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} testID="onboarding-progress-bar" />
        </View>
        <View style={styles.backBtn} />
      </View>

      <Animated.View
        key={index}
        entering={FadeInRight.duration(240)}
        exiting={FadeOutLeft.duration(160)}
        style={styles.body}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <StepView
            step={step}
            answers={answers}
            setSingle={setSingle}
            toggleMulti={toggleMulti}
            setTime={setTime}
          />
        </ScrollView>
      </Animated.View>

      <View style={styles.footer}>
        <Button3D
          label={index === total - 1 ? "Let's go" : "Continue"}
          onPress={handleContinue}
          disabled={!canContinue}
          testID="onboarding-continue-button"
        />
      </View>
    </SafeAreaView>
  );
}

interface StepViewProps {
  step: OnboardingStep;
  answers: Answers;
  setSingle: (k: string, v: string) => void;
  toggleMulti: (k: string, v: string) => void;
  setTime: (k: string, v: TimeValue) => void;
}

const StepView: React.FC<StepViewProps> = ({
  step,
  answers,
  setSingle,
  toggleMulti,
  setTime,
}) => {
  if (step.type === "info") {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBubble}
        >
          <Ionicons name={step.icon} size={56} color={colors.textMain} />
        </LinearGradient>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>
      </View>
    );
  }

  if (step.type === "single") {
    return (
      <View>
        <Text style={styles.title}>{step.title}</Text>
        {step.subtitle ? (
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        ) : null}
        <View style={{ marginTop: space.lg }}>
          {step.options.map((opt) => (
            <Chip3D
              key={opt}
              label={opt}
              selected={answers.single[step.key] === opt}
              onPress={() => setSingle(step.key, opt)}
              testID={`onboarding-option-${step.key}-${opt
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")}`}
            />
          ))}
        </View>
      </View>
    );
  }

  if (step.type === "multi") {
    const selected = answers.multi[step.key] ?? [];
    return (
      <View>
        <Text style={styles.title}>{step.title}</Text>
        {step.subtitle ? (
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        ) : null}
        <View style={{ marginTop: space.lg }}>
          {step.options.map((opt) => (
            <Chip3D
              key={opt}
              label={opt}
              multi
              selected={selected.includes(opt)}
              onPress={() => toggleMulti(step.key, opt)}
              testID={`onboarding-option-${step.key}-${opt
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")}`}
            />
          ))}
        </View>
      </View>
    );
  }

  if (step.type === "time") {
    return (
      <View>
        <Text style={styles.title}>{step.title}</Text>
        {step.subtitle ? (
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        ) : null}
        <View style={{ marginTop: space.xl }}>
          <TimePickerInline
            value={answers.time[step.key] ?? DEFAULT_TIME}
            onChange={(v) => setTime(step.key, v)}
          />
        </View>
      </View>
    );
  }

  if (step.type === "fact") {
    return (
      <View style={styles.center}>
        <View style={styles.factMascotWrap}>
          <Image
            source={require("../assets/images/mascot-splash.png")}
            style={styles.factMascot}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.eyebrow}>{step.title}</Text>
        <Text style={styles.factQuote}>&ldquo;{step.quote}&rdquo;</Text>
        {step.source ? (
          <Text style={styles.factSource}>— {step.source}</Text>
        ) : null}
      </View>
    );
  }

  if (step.type === "social") {
    return (
      <View>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>
        <View style={{ marginTop: space.lg, gap: 12 }}>
          {step.testimonials.map((t) => (
            <View key={t.name} style={styles.testimonialCard}>
              <Text style={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</Text>
              <Text style={styles.testimonialName}>{t.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (step.type === "gratitude") {
    return (
      <View style={styles.center}>
        <View style={styles.factMascotWrap}>
          <Image
            source={require("../assets/images/mascot-splash.png")}
            style={styles.factMascot}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>
        <View style={styles.heartRow}>
          <Ionicons name="heart" size={20} color={colors.primary} />
          <Ionicons name="heart" size={28} color={colors.primary} />
          <Ionicons name="heart" size={20} color={colors.primary} />
        </View>
      </View>
    );
  }

  // commitment
  return (
    <View style={styles.center}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconBubble}
      >
        <Ionicons name="sunny" size={56} color={colors.textMain} />
      </LinearGradient>
      <Text style={styles.title}>{step.title}</Text>
      <Text style={styles.subtitle}>{step.subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.sm,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrap: { flex: 1 },
  body: { flex: 1 },
  scrollContent: {
    padding: space.lg,
    paddingBottom: space.massive,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: space.xl,
  },
  iconBubble: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xl,
  },
  title: {
    ...type.h1,
    color: colors.textMain,
    textAlign: "left",
    marginBottom: space.sm,
  },
  subtitle: {
    ...type.h3,
    color: colors.textMuted,
    fontFamily: fonts.regular,
  },
  eyebrow: {
    ...type.caption,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: space.md,
    textAlign: "center",
  },
  factMascotWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: colors.primary,
    marginBottom: space.lg,
  },
  factMascot: { width: "100%", height: "100%" },
  factQuote: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.textMain,
    textAlign: "center",
    paddingHorizontal: space.md,
  },
  factSource: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: space.md,
    textAlign: "center",
  },
  testimonialCard: {
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.lg,
    borderBottomWidth: 4,
    borderBottomColor: colors.surfaceShadow,
  },
  testimonialQuote: {
    ...type.body,
    color: colors.textMain,
    fontFamily: fonts.medium,
    marginBottom: space.xs,
  },
  testimonialName: {
    ...type.caption,
    color: colors.primary,
  },
  heartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: space.lg,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
});
