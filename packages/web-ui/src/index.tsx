import type { PublicRoleProfile } from '@rmr/contracts';
import {
  DISCOVERY_COUNTRY_LABELS,
  representativeInitials,
  type DiscoveryCountry,
  type RepresentativeCard,
  type RepresentativeIntent,
} from '@rmr/discovery';

export interface FoundationPageProps {
  readonly description: string;
  readonly surface: string;
}

export interface PublicDiscoveryFrameProps {
  readonly children: React.ReactNode;
  readonly dataNotice?: string;
}

export function PublicDiscoveryFrame({ children, dataNotice }: PublicDiscoveryFrameProps) {
  return (
    <main className="discovery-shell">
      <header className="discovery-topbar">
        <a aria-label="Rate My Representatives discovery home" className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            R
          </span>
          <span>
            <strong>Rate My Representatives</strong>
            <small>Source-first civic discovery</small>
          </span>
        </a>
        <span className="pilot-badge">Synthetic read-only pilot</span>
      </header>
      {dataNotice ? (
        <p className="data-notice" role="status">
          {dataNotice}
        </p>
      ) : null}
      {children}
      <footer className="discovery-footer">
        <p>Public browsing works without an account, Verus, AI, notifications, or participation.</p>
        <p>No political choice or card-level behavior is recorded by this experience.</p>
      </footer>
    </main>
  );
}

export function CountrySelection(props: {
  readonly disabled?: boolean;
  readonly onSelect: (country: DiscoveryCountry) => void;
}) {
  return (
    <section aria-labelledby="country-title" className="country-panel">
      <p className="section-kicker">Start with the minimum detail</p>
      <h1 id="country-title">Which country should this synthetic deck represent?</h1>
      <p className="lead">
        No address or precise location is requested. The jurisdiction resolver remains separate
        work; this vertical slice filters the reviewed fixture by country only.
      </p>
      <div className="country-actions">
        {(Object.keys(DISCOVERY_COUNTRY_LABELS) as DiscoveryCountry[]).map((country) => (
          <button
            className="country-button"
            disabled={props.disabled}
            key={country}
            onClick={() => props.onSelect(country)}
            type="button"
          >
            <span aria-hidden="true" className="country-code">
              {country}
            </span>
            <span>
              <strong>{DISCOVERY_COUNTRY_LABELS[country]}</strong>
              <small>Reviewed synthetic public-role records</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      <p className="privacy-note">
        Precise location is not accepted, retained, sent to analytics, or placed on Verus.
      </p>
    </section>
  );
}

function titleCase(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null): string {
  if (value === null) return 'Not available';
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' }).format(parsed)
    : 'Invalid source date';
}

function contextLabel(card: RepresentativeCard): string {
  return card.context.kind === 'office_term' ? 'Office term' : 'Candidacy';
}

export function RepresentativeCardView(props: {
  readonly card: RepresentativeCard;
  readonly onConcern: () => void;
  readonly onOpenRecord: () => void;
  readonly onSkip: () => void;
  readonly onSupport: () => void;
  readonly position: number;
  readonly total: number;
}) {
  const { card } = props;
  return (
    <section aria-labelledby="deck-title" className="deck-layout">
      <div className="deck-intro">
        <p className="section-kicker">{DISCOVERY_COUNTRY_LABELS[card.countryCode]} · finite deck</p>
        <h1 id="deck-title">Meet the public role, then inspect the record.</h1>
        <p>
          Previewing support or concern never submits a signal. Skip is navigation only and writes
          nothing.
        </p>
      </div>
      <article aria-labelledby="representative-name" className="representative-card">
        <div className="card-progress">
          <span>
            Card {props.position} of {props.total}
          </span>
          <span>{titleCase(card.availability)} coverage</span>
        </div>
        <div className="identity-row">
          <div
            aria-label={`Approved image not available for ${card.displayName}; initials placeholder shown.`}
            className="initials-avatar"
            role="img"
          >
            {representativeInitials(card.displayName)}
          </div>
          <div>
            <p className="status-line">
              {titleCase(card.governmentLevel)} · {contextLabel(card)}
            </p>
            <h2 id="representative-name">{card.displayName}</h2>
            <p className="role-status">{titleCase(card.roleStatus)}</p>
          </div>
        </div>
        <dl className="card-facts">
          <div>
            <dt>Person</dt>
            <dd>{card.displayName}</dd>
          </div>
          <div>
            <dt>Office</dt>
            <dd>{card.officeTitle}</dd>
          </div>
          <div>
            <dt>District</dt>
            <dd>{card.districtLabel ?? 'Not available in reviewed sources'}</dd>
          </div>
          <div>
            <dt>{contextLabel(card)}</dt>
            <dd>{card.context.officeTermId ?? card.context.candidacyId ?? 'Not available'}</dd>
          </div>
        </dl>
        <div className="source-snapshot">
          <div>
            <span className="snapshot-label">Approved image</span>
            <strong>Not available</strong>
          </div>
          <div>
            <span className="snapshot-label">Party / affiliation</span>
            <strong>Not available in reviewed sources</strong>
          </div>
          <div>
            <span className="snapshot-label">Record freshness</span>
            <strong>Updated {formatDate(card.updatedAt)}</strong>
          </div>
        </div>
        <p className="preview-explainer" id="preview-explainer">
          Support and Concern open an unsubmitted local preview. Confirmation is unavailable until
          issue #37 is implemented.
        </p>
        <div className="card-actions">
          <button
            aria-describedby="preview-explainer"
            className="action-button action-support"
            onClick={props.onSupport}
            type="button"
          >
            <span aria-hidden="true">＋</span> Support preview
          </button>
          <button
            aria-describedby="preview-explainer"
            className="action-button action-concern"
            onClick={props.onConcern}
            type="button"
          >
            <span aria-hidden="true">!</span> Concern preview
          </button>
          <button className="action-button action-skip" onClick={props.onSkip} type="button">
            Skip — no judgment
          </button>
          <button className="open-record-button" onClick={props.onOpenRecord} type="button">
            Open sourced record <span aria-hidden="true">→</span>
          </button>
        </div>
      </article>
    </section>
  );
}

export function RepresentativeIntentPreview(props: {
  readonly card: RepresentativeCard;
  readonly intent: RepresentativeIntent;
  readonly onCancel: () => void;
  readonly onContinueWithoutSaving: () => void;
}) {
  return (
    <section
      aria-describedby="intent-privacy"
      aria-labelledby="intent-title"
      aria-live="polite"
      className="intent-panel"
      role="region"
    >
      <p className="section-kicker">Unsubmitted local preview</p>
      <h1 id="intent-title">
        {titleCase(props.intent)} · {props.card.displayName}
      </h1>
      <dl className="intent-context">
        <div>
          <dt>Office</dt>
          <dd>{props.card.officeTitle}</dd>
        </div>
        <div>
          <dt>District</dt>
          <dd>{props.card.districtLabel ?? 'Not available'}</dd>
        </div>
        <div>
          <dt>{contextLabel(props.card)}</dt>
          <dd>{props.card.context.officeTermId ?? props.card.context.candidacyId}</dd>
        </div>
      </dl>
      <div className="no-write-callout" id="intent-privacy">
        <strong>Nothing has been submitted.</strong>
        <p>
          This preview exists only in this page state. There is no confirmation command, account
          lookup, aggregate input, analytics event, or signal-domain write.
        </p>
      </div>
      <div className="intent-actions">
        <button className="secondary-button" onClick={props.onCancel} type="button">
          Return to card
        </button>
        <button className="primary-button" onClick={props.onContinueWithoutSaving} type="button">
          Continue without saving
        </button>
      </div>
    </section>
  );
}

export function DeckCompletion(props: {
  readonly country: DiscoveryCountry;
  readonly onChangeCountry: () => void;
  readonly onRefresh: () => void;
}) {
  return (
    <section aria-labelledby="completion-title" className="completion-panel">
      <div aria-hidden="true" className="completion-mark">
        ✓
      </div>
      <p className="section-kicker">Finite deck complete</p>
      <h1 id="completion-title">You reached the end of this synthetic public-record deck.</h1>
      <p>
        No hidden judgment was inferred from completion, skipped cards, or abandoned previews.
        Coverage is limited to reviewed {DISCOVERY_COUNTRY_LABELS[props.country]} fixtures.
      </p>
      <div className="intent-actions">
        <button className="primary-button" onClick={props.onRefresh} type="button">
          Refresh this deck
        </button>
        <button className="secondary-button" onClick={props.onChangeCountry} type="button">
          Change country
        </button>
      </div>
    </section>
  );
}

export function CoverageGap(props: {
  readonly country: DiscoveryCountry;
  readonly onChangeCountry: () => void;
  readonly onRetry: () => void;
}) {
  return (
    <section aria-labelledby="gap-title" className="state-panel">
      <p className="section-kicker">Coverage gap</p>
      <h1 id="gap-title">
        No reviewed {DISCOVERY_COUNTRY_LABELS[props.country]} cards are available.
      </h1>
      <p>
        Missing coverage is not misconduct and is not a negative judgment. The deck will not invent
        or recommend a substitute record.
      </p>
      <div className="intent-actions">
        <button className="primary-button" onClick={props.onRetry} type="button">
          Retry public records
        </button>
        <button className="secondary-button" onClick={props.onChangeCountry} type="button">
          Change country
        </button>
      </div>
    </section>
  );
}

export function DiscoveryLoading(props: { readonly label: string }) {
  return (
    <section aria-busy="true" aria-live="polite" className="state-panel" role="status">
      <span aria-hidden="true" className="loading-orbit" />
      <p>{props.label}</p>
    </section>
  );
}

export function DiscoveryError(props: { readonly message: string; readonly onRetry: () => void }) {
  return (
    <section aria-labelledby="error-title" className="state-panel state-error" role="alert">
      <p className="section-kicker">Public record unavailable</p>
      <h1 id="error-title">The sourced record could not be loaded.</h1>
      <p>{props.message}</p>
      <button className="primary-button" onClick={props.onRetry} type="button">
        Try again
      </button>
    </section>
  );
}

function SectionAvailability(props: {
  readonly availability: string;
  readonly emptyLabel: string;
  readonly items: readonly React.ReactNode[];
}) {
  if (props.items.length === 0) {
    return (
      <p className="empty-section">
        {props.emptyLabel} · {titleCase(props.availability)}
      </p>
    );
  }
  return <ul className="record-list">{props.items}</ul>;
}

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function SourcedRecordView(props: {
  readonly cachedAt: string | null;
  readonly onBack: () => void;
  readonly profile: PublicRoleProfile;
}) {
  const { profile } = props;
  return (
    <article aria-labelledby="record-title" className="record-view">
      <button className="back-button" onClick={props.onBack} type="button">
        <span aria-hidden="true">←</span> Back to discovery
      </button>
      {props.cachedAt ? (
        <p className="cached-record-notice" role="status">
          Offline public copy saved {formatDate(props.cachedAt)}. Source freshness labels below are
          preserved from the reviewed API response.
        </p>
      ) : null}
      <header className="record-header">
        <div
          aria-label={`Approved image not available for ${profile.person.displayName}; initials placeholder shown.`}
          className="record-avatar"
          role="img"
        >
          {representativeInitials(profile.person.displayName)}
        </div>
        <div>
          <p className="section-kicker">Human-reviewed · synthetic source record</p>
          <h1 id="record-title">{profile.person.displayName}</h1>
          <p className="record-subtitle">
            {profile.office.title} · {profile.district?.label ?? 'District not available'}
          </p>
          <div className="record-tags">
            <span>{titleCase(profile.office.governmentLevel)}</span>
            <span>{titleCase(profile.summary.roleStatus)}</span>
            <span>Version {profile.recordVersion}</span>
          </div>
        </div>
      </header>

      <section aria-labelledby="entities-title" className="record-section">
        <p className="section-kicker">Distinct civic entities</p>
        <h2 id="entities-title">Person, office, district, and service context</h2>
        <dl className="entity-grid">
          <div>
            <dt>Person</dt>
            <dd>{profile.person.displayName}</dd>
            <small>{profile.person.personId}</small>
          </div>
          <div>
            <dt>Office</dt>
            <dd>{profile.office.title}</dd>
            <small>{profile.office.officeId}</small>
          </div>
          <div>
            <dt>District</dt>
            <dd>{profile.district?.label ?? 'Not available'}</dd>
            <small>{profile.district?.districtId ?? 'No district identifier'}</small>
          </div>
          <div>
            <dt>{profile.officeTerm ? 'Office term' : 'Candidacy'}</dt>
            <dd>
              {titleCase(profile.officeTerm?.state ?? profile.candidacy?.state ?? 'not available')}
            </dd>
            <small>{profile.officeTerm?.officeTermId ?? profile.candidacy?.candidacyId}</small>
          </div>
        </dl>
        {profile.election ? (
          <div className="election-line">
            <strong>Election:</strong> {profile.election.name} · {titleCase(profile.election.state)}{' '}
            · {formatDate(profile.election.scheduledAt)}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="identifiers-title" className="record-section split-section">
        <div>
          <p className="section-kicker">Official identifiers</p>
          <h2 id="identifiers-title">Published identifiers</h2>
          <ul className="record-list compact-list">
            {profile.person.officialIdentifiers.map((identifier) => (
              <li key={identifier.identifierId}>
                <strong>{identifier.issuer}</strong>
                <span>{identifier.value}</span>
                <small>{titleCase(identifier.freshness)}</small>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="section-kicker">Official contacts</p>
          <h2>Published contact routes</h2>
          {profile.officialContactRoutes.length === 0 ? (
            <p className="empty-section">No reviewed official contact route is available.</p>
          ) : (
            <ul className="record-list compact-list">
              {profile.officialContactRoutes.map((contact) => {
                const href = contact.kind === 'office_url' ? safeHttpUrl(contact.value) : null;
                return (
                  <li key={contact.contactRouteId}>
                    <strong>{titleCase(contact.kind)}</strong>
                    {href ? (
                      <a href={href} rel="noreferrer" target="_blank">
                        Open official route
                      </a>
                    ) : (
                      <span>{contact.value}</span>
                    )}
                    <small>{titleCase(contact.freshness)}</small>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="claims-title" className="record-section">
        <p className="section-kicker">Sourced public activity</p>
        <h2 id="claims-title">Claims and evidence state</h2>
        {profile.claims.length === 0 ? (
          <p className="empty-section">No reviewed activity claims are available.</p>
        ) : (
          <ul className="claim-list">
            {profile.claims.map((claim) => (
              <li key={claim.claimId}>
                <div className="claim-heading">
                  <span>{titleCase(claim.category)}</span>
                  <span>{titleCase(claim.status)}</span>
                  <span>{titleCase(claim.conflictState)}</span>
                </div>
                <h3>{claim.label}</h3>
                <p>{claim.value}</p>
                <dl className="claim-meta">
                  <div>
                    <dt>Observed</dt>
                    <dd>{formatDate(claim.observedAt)}</dd>
                  </div>
                  <div>
                    <dt>Freshness</dt>
                    <dd>{titleCase(claim.freshness)}</dd>
                  </div>
                  <div>
                    <dt>Supporting sources</dt>
                    <dd>{claim.evidence.supportingSourceIds.join(', ')}</dd>
                  </div>
                  <div>
                    <dt>Challenging sources</dt>
                    <dd>{claim.evidence.challengingSourceIds.join(', ') || 'None published'}</dd>
                  </div>
                </dl>
                {claim.evidence.note ? (
                  <p className="evidence-note">{claim.evidence.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="coverage-title" className="record-section">
        <p className="section-kicker">Coverage is not conduct</p>
        <h2 id="coverage-title">Source coverage, freshness, conflicts, and gaps</h2>
        <p className="method-note">
          Missing data means <strong>coverage gap, not misconduct</strong>. Method:{' '}
          {profile.coverage.methodVersion}.
        </p>
        <ul className="coverage-grid">
          {profile.coverage.items.map((item) => (
            <li key={item.category}>
              <span className={`coverage-state coverage-${item.state}`}>
                {titleCase(item.state)}
              </span>
              <h3>{titleCase(item.category)}</h3>
              <p>{item.explanation}</p>
              <small>
                Last reviewed {formatDate(item.lastReviewedAt)} · {item.sourceIds.length} linked
                source
                {item.sourceIds.length === 1 ? '' : 's'}
              </small>
            </li>
          ))}
        </ul>
        {profile.coverage.conflicts.length > 0 ? (
          <div className="conflict-panel">
            <h3>Visible source conflicts</h3>
            <ul className="record-list">
              {profile.coverage.conflicts.map((conflict) => (
                <li key={conflict.conflictId}>
                  <strong>{conflict.field}</strong>
                  <span>{conflict.explanation}</span>
                  <small>{titleCase(conflict.state)}</small>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="empty-section">No visible source conflict is published for this version.</p>
        )}
      </section>

      <section aria-labelledby="sources-title" className="record-section">
        <p className="section-kicker">Reviewed source versions</p>
        <h2 id="sources-title">Sources and reproducibility metadata</h2>
        <ul className="source-list">
          {profile.sources.items.map((source) => {
            const href = safeHttpUrl(source.originalUrl);
            return (
              <li key={source.sourceId}>
                <div>
                  <h3>{source.publisher}</h3>
                  <p>
                    {titleCase(source.sourceType)} · {titleCase(source.freshness)} · retrieved{' '}
                    {formatDate(source.retrievedAt)}
                  </p>
                </div>
                {href ? (
                  <a href={href} rel="noreferrer" target="_blank">
                    Open source
                  </a>
                ) : (
                  <span className="synthetic-uri">Synthetic fixture URI</span>
                )}
                <details>
                  <summary>Reproducibility details</summary>
                  <dl className="source-details">
                    <div>
                      <dt>Source ID</dt>
                      <dd>{source.sourceId}</dd>
                    </div>
                    <div>
                      <dt>Reviewed version</dt>
                      <dd>{source.reviewedRecordVersionId}</dd>
                    </div>
                    <div>
                      <dt>SHA-256</dt>
                      <dd className="hash-value">{source.contentSha256}</dd>
                    </div>
                    <div>
                      <dt>Licence / terms</dt>
                      <dd>{source.licenceNote}</dd>
                    </div>
                  </dl>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="review-title" className="record-section review-grid">
        <div>
          <h2 id="review-title">Representative responses</h2>
          <SectionAvailability
            availability={profile.responses.availability}
            emptyLabel="No published response is available"
            items={profile.responses.items.map((item) => (
              <li key={item.responseId}>{item.summary}</li>
            ))}
          />
        </div>
        <div>
          <h2>Disputes</h2>
          <SectionAvailability
            availability={profile.disputes.availability}
            emptyLabel="No visible dispute is available"
            items={profile.disputes.items.map((item) => (
              <li key={item.disputeId}>{item.summary}</li>
            ))}
          />
        </div>
        <div>
          <h2>Corrections</h2>
          <SectionAvailability
            availability={profile.corrections.availability}
            emptyLabel="No visible correction is available"
            items={profile.corrections.items.map((item) => (
              <li key={item.correctionId}>
                <strong>{formatDate(item.correctedAt)}</strong>
                <span>{item.summary}</span>
              </li>
            ))}
          />
        </div>
        <div>
          <h2>Appeals</h2>
          <SectionAvailability
            availability={profile.appeals.availability}
            emptyLabel="No visible appeal is available"
            items={profile.appeals.items.map((item) => (
              <li key={item.appealId}>{item.summary}</li>
            ))}
          />
        </div>
      </section>

      <section aria-labelledby="methods-title" className="record-section method-boundaries">
        <p className="section-kicker">Separate data types and methods</p>
        <h2 id="methods-title">What this record does — and does not — include</h2>
        <dl>
          <div>
            <dt>Public profile method</dt>
            <dd>{profile.method.profileMethodVersion}</dd>
          </div>
          <div>
            <dt>Coverage method</dt>
            <dd>{profile.method.coverageMethodVersion}</dd>
          </div>
          <div>
            <dt>Composite scoring</dt>
            <dd>Not included or calculated</dd>
          </div>
          <div>
            <dt>Representative-signal aggregate</dt>
            <dd>Not included</dd>
          </div>
          <div>
            <dt>AI assistance</dt>
            <dd>Not included</dd>
          </div>
          <div>
            <dt>Provenance state</dt>
            <dd>
              {profile.provenance === null
                ? 'Not available. Public browsing has no Verus dependency.'
                : `${titleCase(profile.provenance.state)} on ${profile.provenance.network}`}
            </dd>
          </div>
        </dl>
      </section>

      <footer className="record-version">
        <p>
          Published by {titleCase(profile.publication.method)} · decision{' '}
          {profile.publication.decisionId}
        </p>
        <p>
          Updated {formatDate(profile.updatedAt)} · profile ID {profile.profileId}
        </p>
      </footer>
    </article>
  );
}

export function FoundationPage({ description, surface }: FoundationPageProps) {
  return (
    <main className="foundation-shell">
      <section aria-labelledby="foundation-title" className="foundation-card">
        <p className="foundation-eyebrow">Rate My Representatives</p>
        <h1 id="foundation-title">{surface}</h1>
        <p>{description}</p>
        <p role="status" className="foundation-status">
          Foundation only — civic features are not operational.
        </p>
      </section>
    </main>
  );
}
