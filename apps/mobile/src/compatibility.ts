import type { MobileCompatibilityStatus } from '@rmr/contracts';

export type CompatibilityDecision =
  | Readonly<{ allowed: true; reason: 'compatible' }>
  | Readonly<{
      allowed: false;
      reason: 'contract_unsupported' | 'minimum_app_version_required' | 'minimum_build_required';
    }>;

function parseVersion(value: string): readonly [number, number, number] | null {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u.exec(value);
  if (match === null) return null;
  const parts = [Number(match[1]), Number(match[2]), Number(match[3])] as const;
  return parts.every(Number.isSafeInteger) ? parts : null;
}

function isBeforeVersion(current: string, minimum: string): boolean {
  const currentParts = parseVersion(current);
  const minimumParts = parseVersion(minimum);
  if (currentParts === null || minimumParts === null) return true;
  for (const index of [0, 1, 2] as const) {
    if (currentParts[index] === minimumParts[index]) continue;
    return currentParts[index] < minimumParts[index];
  }
  return false;
}

export function evaluateMobileCompatibility(input: {
  appVersion: string;
  buildNumber: number;
  contractVersion: string;
  platform: 'android' | 'ios';
  policy: MobileCompatibilityStatus;
}): CompatibilityDecision {
  const platformPolicy = input.policy.platforms[input.platform];
  if (!Number.isSafeInteger(input.buildNumber) || input.buildNumber < 1) {
    return { allowed: false, reason: 'minimum_build_required' };
  }
  if (
    !platformPolicy.supportedContractVersions.some((version) => version === input.contractVersion)
  ) {
    return { allowed: false, reason: 'contract_unsupported' };
  }
  if (isBeforeVersion(input.appVersion, platformPolicy.minimumAppVersion)) {
    return { allowed: false, reason: 'minimum_app_version_required' };
  }
  if (input.buildNumber < platformPolicy.minimumBuildNumber) {
    return { allowed: false, reason: 'minimum_build_required' };
  }
  return { allowed: true, reason: 'compatible' };
}
