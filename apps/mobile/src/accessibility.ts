export const nativeAccessibilityBaseline = Object.freeze({
  authenticationHasNonBiometricFallback: true,
  dragOnlyInteractionsAllowed: false,
  dynamicTypeEnabled: true,
  minimumTouchTargetPoints: 44,
  reducedMotionRespected: true,
  screenReaderLabelsRequired: true,
  sensitiveSessionReplayAllowed: false,
});

export function assertAccessibleAction(input: {
  accessibleLabel: string;
  hasVisibleNonGestureAlternative: boolean;
  heightPoints: number;
  widthPoints: number;
}): void {
  if (
    input.accessibleLabel.trim().length < 3 ||
    !input.hasVisibleNonGestureAlternative ||
    input.heightPoints < nativeAccessibilityBaseline.minimumTouchTargetPoints ||
    input.widthPoints < nativeAccessibilityBaseline.minimumTouchTargetPoints
  ) {
    throw new Error('Native action does not meet the accessibility baseline.');
  }
}
