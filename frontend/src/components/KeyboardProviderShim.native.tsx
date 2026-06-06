// Native — re-exports from react-native-keyboard-controller. We aliasing
// rather than re-using the lib's names directly so screens import a single
// stable module path that resolves to the right impl per-platform.

import React from "react";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  KeyboardProvider,
} from "react-native-keyboard-controller";

export const KeyboardProviderShim: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <KeyboardProvider>{children}</KeyboardProvider>;

export const KeyboardAwareScrollViewShim = KeyboardAwareScrollView;
export const KeyboardAvoidingViewShim = KeyboardAvoidingView;
