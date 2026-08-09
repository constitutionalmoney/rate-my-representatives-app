import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import type { RepresentationCapabilities, RepresentationResolution } from '@rmr/contracts';

import {
  continueWebRepresentationAmbiguity,
  readWebRepresentationCapabilities,
  resolveWebRepresentation,
} from './health';

type CountryCode = 'CA' | 'US';

const stateMessages: Readonly<Record<RepresentationResolution['state'], string>> = Object.freeze({
  ambiguous: 'More than one broad boundary matched. Choose an option below.',
  conflicting: 'The source and geometry disagree. No representative result is assumed.',
  provider_unavailable: 'The lookup provider is temporarily unavailable. Your entry was discarded.',
  resolved: 'Applicable synthetic jurisdictions were resolved. Your entry was discarded.',
  stale: 'The available geometry is stale. Review the version before relying on this result.',
  unsupported: 'This synthetic area is outside current coverage. No substitute was inferred.',
});

export function LocationResolver(props: {
  readonly apiOrigin: string;
  readonly onBrowseCountry: (countryCode: CountryCode) => void;
}) {
  const [capabilities, setCapabilities] = useState<RepresentationCapabilities | null>(null);
  const [countryCode, setCountryCode] = useState<CountryCode>('CA');
  const [value, setValue] = useState('');
  const [resolution, setResolution] = useState<RepresentationResolution | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCapabilities = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setCapabilities(await readWebRepresentationCapabilities(props.apiOrigin));
    } catch {
      setError('Location capability discovery is unavailable. You can still browse by country.');
    } finally {
      setBusy(false);
    }
  }, [props.apiOrigin]);

  useEffect(() => void loadCapabilities(), [loadCapabilities]);

  const capability = useMemo(
    () => capabilities?.items.find((item) => item.countryCode === countryCode) ?? null,
    [capabilities, countryCode],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (capability === null || capability.featureState !== 'operational') return;
    const preciseValue = value;
    setValue('');
    setBusy(true);
    setError(null);
    setResolution(null);
    try {
      setResolution(
        await resolveWebRepresentation(props.apiOrigin, {
          schemaVersion: 'representation-resolution-request.v1',
          asOf: new Date().toISOString(),
          countryCode,
          input: { kind: capability.input.kind, value: preciseValue },
        }),
      );
    } catch {
      setError(
        'The lookup could not be completed. Your entry was discarded; try again or browse by country.',
      );
    } finally {
      setBusy(false);
    }
  };

  const selectAmbiguity = async (optionId: string) => {
    if (resolution?.ambiguity === null || resolution?.ambiguity === undefined) return;
    setBusy(true);
    setError(null);
    try {
      setResolution(
        await continueWebRepresentationAmbiguity(props.apiOrigin, {
          schemaVersion: 'representation-ambiguity-selection.v1',
          asOf: resolution.asOf,
          optionId,
          selectionToken: resolution.ambiguity.selectionToken,
        }),
      );
    } catch {
      setError(
        'That one-time choice expired. Start a new lookup; the earlier entry is not retained.',
      );
      setResolution(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="location-resolver-title" className="state-panel location-panel">
      <p className="section-kicker">Find representation · synthetic coverage</p>
      <h1 id="location-resolver-title">Use the minimum location detail</h1>
      <p>
        The precise entry is used once, cleared immediately, and never saved, logged, queued, sent
        to AI, or sent to Verus. A lookup does not determine residence, citizenship, or voting
        eligibility.
      </p>
      <form className="location-form" onSubmit={(event) => void submit(event)}>
        <fieldset disabled={busy}>
          <legend>Country</legend>
          <label>
            <input
              checked={countryCode === 'CA'}
              name="location-country"
              onChange={() => {
                setCountryCode('CA');
                setResolution(null);
                setValue('');
              }}
              type="radio"
            />
            Canada
          </label>
          <label>
            <input
              checked={countryCode === 'US'}
              name="location-country"
              onChange={() => {
                setCountryCode('US');
                setResolution(null);
                setValue('');
              }}
              type="radio"
            />
            United States
          </label>
        </fieldset>
        <label className="location-field" htmlFor="precise-location-once">
          {capability?.input.label ?? 'Location input'}
          <input
            autoComplete={capability?.input.autocomplete ?? 'off'}
            disabled={busy || capability?.featureState !== 'operational'}
            id="precise-location-once"
            maxLength={capability?.input.maxLength ?? 240}
            onChange={(event) => setValue(event.currentTarget.value)}
            placeholder={countryCode === 'CA' ? 'A1A 1A1 (synthetic)' : 'Synthetic street address'}
            required
            value={value}
          />
        </label>
        <button
          className="primary-button"
          disabled={busy || value.length === 0 || capability?.featureState !== 'operational'}
          type="submit"
        >
          Resolve once
        </button>
      </form>

      {capability?.featureState === 'disabled' ? (
        <p className="cached-record-notice" role="status">
          Precise lookup is disabled by default. Synthetic provider contracts and coverage metadata
          are available, and country browsing remains independent.
        </p>
      ) : null}
      {busy ? (
        <p aria-live="polite" role="status">
          Processing without retaining the entry…
        </p>
      ) : null}
      {error ? (
        <div className="state-error" role="alert">
          <p>{error}</p>
          <button
            className="secondary-button"
            onClick={() => void loadCapabilities()}
            type="button"
          >
            Retry capability check
          </button>
        </div>
      ) : null}
      {resolution ? (
        <div aria-live="polite" className="location-result">
          <h2>{stateMessages[resolution.state]}</h2>
          <p>
            Geometry {resolution.provider.geometry.version} · source{' '}
            {resolution.provider.source.version}
            {' · '}license {resolution.provider.geometry.license}
          </p>
          {resolution.ambiguity ? (
            <div className="intent-actions">
              {resolution.ambiguity.options.map((option) => (
                <button
                  className="secondary-button"
                  key={option.candidateId}
                  onClick={() => void selectAmbiguity(option.candidateId)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <ul className="record-list compact-list">
              {resolution.matches.map((match) => (
                <li key={match.scope}>
                  <strong>{match.scope.replace('_', ' ')}</strong>
                  <span>{match.district?.label ?? match.jurisdiction.label}</span>
                  <small>
                    {match.matchState === 'matched'
                      ? 'Office scope matched'
                      : 'Coverage gap shown explicitly'}
                  </small>
                </li>
              ))}
            </ul>
          )}
          {resolution.state === 'resolved' ? (
            <button
              className="primary-button"
              onClick={() => props.onBrowseCountry(resolution.countryCode)}
              type="button"
            >
              Continue to reviewed cards
            </button>
          ) : null}
        </div>
      ) : null}
      <button
        className="secondary-button"
        onClick={() => props.onBrowseCountry(countryCode)}
        type="button"
      >
        Browse by country instead
      </button>
      <p className="method-note">
        Saving a broad country, province, state, or territory is optional and requires an
        authenticated account. It can never save a district, municipality, address, or coordinate.
      </p>
    </section>
  );
}
