// Web shims — no-op replacements for react-native-keyboard-controller's
// components so screens can render in the web preview without runtime
// errors. The web browser handles keyboard avoidance natively, so we just
// fall back to plain RN ScrollView / View.

import React from "react";
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
} from "react-native";

export const KeyboardProviderShim: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

type AwareScrollProps = ScrollViewProps & {
  bottomOffset?: number;
  children?: React.ReactNode;
};

export const KeyboardAwareScrollViewShim = React.forwardRef<
  ScrollView,
  AwareScrollProps
>(({ bottomOffset: _bottomOffset, children, ...rest }, ref) => (
  <ScrollView ref={ref} {...rest}>
    {children}
  </ScrollView>
));
KeyboardAwareScrollViewShim.displayName = "KeyboardAwareScrollViewShim";

type AvoidingProps = ViewProps & {
  behavior?: "padding" | "height" | "position" | "translate-with-padding";
  keyboardVerticalOffset?: number;
  children?: React.ReactNode;
};

export const KeyboardAvoidingViewShim: React.FC<AvoidingProps> = ({
  behavior: _behavior,
  keyboardVerticalOffset: _kvo,
  children,
  ...rest
}) => <View {...rest}>{children}</View>;
