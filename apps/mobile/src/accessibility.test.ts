import { describe, expect, it } from 'vitest';

import { assertAccessibleAction, nativeAccessibilityBaseline } from './accessibility';

describe('native accessibility baseline', () => {
  it('requires dynamic type, reduced motion, screen-reader labels, and non-drag alternatives', () => {
    expect(nativeAccessibilityBaseline).toMatchObject({
      dragOnlyInteractionsAllowed: false,
      dynamicTypeEnabled: true,
      reducedMotionRespected: true,
      screenReaderLabelsRequired: true,
      sensitiveSessionReplayAllowed: false,
    });
    expect(() =>
      assertAccessibleAction({
        accessibleLabel: 'Open public profile',
        hasVisibleNonGestureAlternative: true,
        heightPoints: 44,
        widthPoints: 44,
      }),
    ).not.toThrow();
    expect(() =>
      assertAccessibleAction({
        accessibleLabel: 'Swipe',
        hasVisibleNonGestureAlternative: false,
        heightPoints: 44,
        widthPoints: 44,
      }),
    ).toThrow('accessibility baseline');
  });
});
