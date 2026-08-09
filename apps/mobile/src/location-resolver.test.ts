import { describe, expect, it } from 'vitest';

import { locationResolverAccessibility } from './location-resolver-accessibility';

describe('native location resolver accessibility boundary', () => {
  it('keeps manual, announced, non-gesture recovery available', () => {
    expect(locationResolverAccessibility).toEqual({
      manualEntryAvailable: true,
      preciseValueClearedBeforeNetworkCompletion: true,
      resultAnnouncements: 'polite',
      visibleRetryAction: true,
      visibleCountryAlternative: true,
    });
  });
});
