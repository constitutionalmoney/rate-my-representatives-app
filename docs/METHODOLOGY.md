# Light Mathematics Methodology Policy

- **Status:** Accepted policy baseline; execution not implemented
- **Policy version:** `light-mathematics-policy.v1`
- **Issue:** [#4](https://github.com/constitutionalmoney/rate-my-representatives-app/issues/4)
- **Effective:** 2026-08-09

## 1. Decision and scope

The **Light Mathematics Protocol** is the public methodology and governance process for
Rate My Representatives (RMR). The only permitted product name for a possible future
composite is **Representative Accountability Score**.

This policy defines terminology, display categories, indicator metadata, source and
missing-data rules, human-participation separation, correction behavior, versioning,
public change control, and fail-closed release gates. It does **not** approve an
indicator, compute a representative result, publish a score, create a database record,
open an API route, perform an AI evaluation, or write provenance. Issue #18 owns future
methodology execution.

`COMPOSITE_SCORE_ENABLED=false` remains the required default. The valid governance
outcome is to never publish a composite result.

This document is the canonical methodology policy. The related source documents retain
narrow authority:

- [`COVERAGE_POLICY.md`](./COVERAGE_POLICY.md) controls source eligibility, inventory,
  denominators, freshness, coverage reports, and pilot readiness;
- [`DATA_MODEL.md`](./DATA_MODEL.md) controls canonical entities, privacy classes,
  temporal rules, and planned persistence;
- [`AUTH_AND_IDENTITY.md`](./AUTH_AND_IDENTITY.md) controls accounts, attestations,
  eligibility, role authority, and the prohibition on identity-derived reputation;
- [`MODERATION_AND_DUE_PROCESS.md`](./MODERATION_AND_DUE_PROCESS.md) controls evidence review, response,
  dispute, correction, appeal, and retraction workflows; and
- [`WEBSITE_ALIGNMENT.md`](./WEBSITE_ALIGNMENT.md) controls product terminology and the
  website/application boundary.

If a future method conflicts with any of those policies, it is not approved.

## 2. Terms and non-equivalence

| Term | Meaning | Never means |
|---|---|---|
| Light Mathematics Protocol | The public method, governance, test, change, and correction process | A hidden model prompt or an automatically approved formula |
| Evidence-derived indicator | One versioned, reproducible result about a defined public-role record | A citizen judgment, allegation, generalized character judgment, or composite |
| Representative Accountability Score | A possible future composite about one public office term or candidacy | An assumed deliverable, a citizen score, or an identity reputation |
| Representative signal | A human `support` or `concern` judgment for one office term | Civic Signal, evidence, a factual finding, or an AI output |
| Civic Signal | Monitoring, briefings, notifications, source alerts, and correction updates | A representative signal or an automated political judgment |
| Category rating | A separately governed structured human rating | Evidence-derived record analysis |
| Community context | Moderated human commentary or context | An official source, indicator input by default, or verified consensus |
| Confidence | Declared uncertainty about a method/result under defined inputs | Representative quality or truth probability |
| Coverage | Completeness and freshness of the observable source set | Performance, misconduct, or a penalty |
| Provenance | Evidence that exact bytes were committed by a stated process or identity | Proof that the underlying claim, method, or result is true |

These concepts may appear near one another in a profile but are not interchangeable and
must not be silently blended.

## 3. Mandatory separation of outputs

RMR maintains distinct public layers:

| Layer | Source | Permitted display | Composite input status |
|---|---|---|---|
| Public-role identity and office context | Reviewed registry and official identifiers | Person, office, district, term/candidacy, source state | Context only; never a character value |
| Evidence-derived record indicators | Eligible reviewed public records under an approved method | Individual indicator, method, inputs, coverage, confidence, explanation | Disabled until a separately approved composite method |
| Coverage and freshness | Declared inventories and source checks | Counts, percentages, gaps, stale/conflict state | Quality context; never an adverse value |
| Authenticated representative-signal aggregate | Eligible confirmed human actions after privacy thresholds | Separately labeled aggregate and uncertainty | Separate; no composite input is approved |
| Unverified participation | Unverified human submissions | Separate label, count/interval, moderation status | Never blended with authenticated participation |
| Anonymous public input | Anonymous submissions allowed by a future policy | Separate label, count/interval, moderation status | Never presented as authenticated sentiment |
| Category-rating aggregate | Confirmed ratings under a versioned category policy | Separately labeled category aggregate | No composite input is approved |
| Community context | Moderated human text/context | Attributed or labeled context with moderation state | Not a numerical input by default |
| AI-assisted analysis | Purpose-limited draft/extraction/classification with review metadata | Disclosed role and human decision | Never a hidden calculation engine or synthetic citizen |
| Response, dispute, correction, appeal | Due-process records | Visible status and timeline | Changes availability/version according to Section 10 |

The public API and UI must use specific field names. A generic `score` field is
prohibited because it hides which layer produced a value.

## 4. Canonical taxonomy and crosswalk

The seven beta headings are a display taxonomy, not seven values to average. Only the
first five organize evidence-derived public-role record analysis. **Verified civic
sentiment** is a human-participation display. **Verification and source coverage**
describes record quality. Neither is a representative-quality factor.

### 4.1 Canonical beta display categories

| ID | Beta display category | Layer |
|---|---|---|
| B01 | Policy and voting alignment | Evidence-derived record analysis, but only with a user-selected policy frame and approved comparison method |
| B02 | Integrity and accountability | Evidence-derived public-role record analysis |
| B03 | Financial influence and disclosure | Evidence-derived public-role record analysis |
| B04 | Constituent engagement | Evidence-derived public-role record analysis |
| B05 | Performance and effectiveness | Evidence-derived public-role record analysis |
| B06 | Verified civic sentiment | Authenticated human participation only; separate from record analysis |
| B07 | Verification and source coverage | Coverage, freshness, confidence, conflicts, and known gaps; not representative performance |

### 4.2 Website ten-factor crosswalk

The website’s ten proposed factor families are presentation language. This table is the
only canonical mapping to the beta headings; it does not approve any factor or weight.

| Website ID | Website factor family | Primary beta category | Secondary display/context | Governing rule |
|---|---|---|---|---|
| W01 | Identity and office integrity | B02 Integrity and accountability | B07 Verification and source coverage | Measures linkage quality and documented office-state integrity, never private identity quality |
| W02 | Voting and policy records | B01 Policy and voting alignment | B07 Verification and source coverage | No alignment inference without a user-selected frame and published comparison method |
| W03 | Promises and stated-position alignment | B01 Policy and voting alignment | B05 Performance and effectiveness; B07 coverage | A sourced statement and later public action remain inspectable; silence or missing archives are not broken promises |
| W04 | Attendance and public-duty performance | B05 Performance and effectiveness | B07 Verification and source coverage | Denominators, excused absences, role expectations, and source limits must be explicit |
| W05 | Spending and financial accountability | B03 Financial influence and disclosure | B02 Integrity and accountability; B07 coverage | Uses published expenses, procurement, and disclosure records under jurisdiction-specific rules |
| W06 | Integrity, ethics, and conflicts | B02 Integrity and accountability | B07 Verification and source coverage | Requires attributable public records and visible dispute/correction state; no rumor or private-life inference |
| W07 | Transparency and responsiveness | B04 Constituent engagement | B02 Integrity and accountability; B07 coverage | Measures defined public-role processes, not popularity, message volume, or access to private communications |
| W08 | Outcomes, corrections, and follow-through | B05 Performance and effectiveness | B02 Integrity and accountability; B07 coverage | Outcomes require a declared attribution method; accepting a correction is not automatically adverse or favorable |
| W09 | Community input | B06 Verified civic sentiment | Separately labeled unverified/anonymous participation, ratings, and context | Human inputs remain partitioned and are not evidence-derived facts |
| W10 | Evidence quality and confidence | B07 Verification and source coverage | Applies to every B01-B05 indicator | Describes source/result support and uncertainty, never representative merit |

### 4.3 Earlier five-family and current preview mapping

The earlier website copy also summarized record analysis into five broad families. Those
names map one-to-one to B01-B05: voting and policy records; integrity and accountability;
financial influence and disclosure; constituent engagement; and performance and
effectiveness.

The current illustrative phone preview consolidates the taxonomy into four rows:

| Illustrative preview row | Canonical mapping | Limitation |
|---|---|---|
| Identity and office integrity | W01 → B02, with B07 quality context | Presentation grouping only |
| Voting and policy record | W02 → B01, with B07 quality context | Presentation grouping only |
| Promises and stated positions | W03 → B01/B05, with B07 quality context | Presentation grouping only |
| Evidence quality and confidence | W10 → B07 | Quality context, not a representative result |

The other website families were not silently deleted by the four-row preview. Any future
UI must resolve through the W/B IDs above and disclose when several families are grouped.

## 5. Unit of analysis and factor boundaries

An evidence-derived indicator targets exactly one canonical `office_term` or `candidacy`.
The method must declare jurisdiction, public body, office, applicable duty, effective
period, and source scope. A result cannot silently follow a person into a different term,
office, candidacy, jurisdiction, or private context.

Permitted factors concern documented exercises of public power: votes, official
attendance, expenses, procurement, required disclosures, attributable statements,
published commitments, public responses, correction behavior, and defined public
outcomes where eligible records exist.

Excluded factors include:

- private life unrelated to public duty;
- protected identity traits, health, family, beliefs, associations, or inferred ideology;
- account age, authentication method, attestation strength, wallet/VerusID ownership,
  eligibility history, moderation state, abuse controls, or other security data;
- citizen speech, support/concern choices, ratings, comments, abstention, or refusal to
  participate as evidence of citizen trustworthiness;
- rumor, unattributed allegations, engagement bait, paid promotion, or source popularity;
- an AI model’s unsupported inference, sentiment, latent score, or confidence; and
- missing, stale, conflicting, unavailable, retracted, or jurisdictionally incomparable
  data treated as adverse conduct.

No citizen score, social-credit measure, political conformity score, identity-derived
reputation, or cross-context trust tier is permitted.

## 6. Source eligibility and exclusions

The source inventory, authority tiers, rights/licence review, retention rules,
attribution, freshness thresholds, conflict handling, and public gap reporting in
[`COVERAGE_POLICY.md`](./COVERAGE_POLICY.md) are mandatory inputs.

An indicator method must publish:

1. the eligible source classes and exact source IDs;
2. the legal/official authority each source supports;
3. inclusion and exclusion rules before reviewing the target result;
4. the denominator and period;
5. licence, attribution, retention, and redistribution limits;
6. freshness thresholds and input cutoff;
7. conflict, retraction, correction, and unavailable-source behavior; and
8. a public list of known gaps and jurisdiction-specific non-comparability.

Secondary reporting may locate or explain a gap but cannot silently outrank the legal or
official source for an authoritative field. A contributed document is not eligible merely
because the contributor is authenticated. Identity status affects attribution, abuse
controls, and review priority; it does not make a claim true.

## 7. Indicator contract

Every indicator result must carry all of the following:

- stable result ID and schema version;
- target kind and canonical office-term/candidacy ID;
- canonical beta display category;
- method ID, immutable method version, public specification digest, approval state, and
  code revision;
- exact source IDs, input record-version IDs, source-set digest, and input cutoff;
- coverage numerator, denominator, percentage, state, and gap IDs;
- freshness state, threshold, evaluation time, and oldest input time;
- result availability, value/unit, public calculation rule, named calculation inputs,
  and explanation;
- missing-data state/count, with treatment `no_adverse_inference`;
- confidence status/value/rationale;
- disclosed AI role and human-review state;
- correction/dispute/appeal/retraction/supersession state and linkage;
- `participationIncluded=false` for evidence-derived indicator contracts;
- calculation time and publication state; and
- provenance state, manifest digest if applicable, and meaning
  `commitment_not_truth`.

The generated baseline is
[`methodology-indicator-result.schema.json`](../packages/contracts/schemas/methodology-indicator-result.schema.json).
It is a contract for future implementation, not an operational API or approval.

## 8. Missing data, conflicts, freshness, coverage, and confidence

### Missing and unknown data

Missing data is not zero, failure, opposition, misconduct, or a negative value. If a
required input is missing, unknown, stale beyond the approved limit, materially
conflicting, unavailable, quarantined, or retracted, the indicator is `unavailable` and
its value is `null` unless the published method explicitly proves that the absent field
is not required. The coverage/gap display may change; the representative result may not
be reduced merely because the record is incomplete.

An absence may count as a documented event only where an authoritative source expressly
records it (for example, an official roll call records an unexcused absence) and the
approved method defines the event, denominator, exclusions, and appeal behavior.

### Conflicting sources

Material conflicts remain visible. The method may apply a pre-published authority rule,
withhold the indicator, or calculate separate interpretations. It may not pick the
politically convenient source after seeing the result. An unresolved material conflict
sets the result to `unavailable`.

### Freshness and coverage

Coverage and freshness describe the observable record. They must be displayed beside an
indicator and never converted into representative merit. Unknown denominators produce a
`null` percentage. A low coverage percentage cannot itself reduce an indicator.

### Confidence and uncertainty

Confidence measures how well the declared method is supported under the declared source
set. Its rules, calibration, and thresholds are versioned and public. A low or
insufficient confidence state must not be hidden by a precise-looking number. Confidence
is not the probability that a person is good, honest, trustworthy, or correct.

## 9. Reproducible synthetic example

The fixture
[`methodology-indicator.synthetic.json`](../packages/contracts/fixtures/methodology-indicator.synthetic.json)
uses no real representative, allegation, account, wallet, or chain data. It illustrates
a non-composite publication-timeliness indicator with four fully sourced synthetic
events:

```text
published_within_threshold = 3
eligible_events = 4
indicator_percent = 100 × 3 / 4 = 75
coverage = 4 / 4 = 100%
```

The fixture is marked `illustrative_not_approved`, `test_only`, `participationIncluded=false`,
and `not_anchored`. Tests recompute the 75 percent result from named inputs.

If one required source input is removed, coverage becomes partial and the indicator
becomes `unavailable` with `value=null`; the implementation may not recalculate the same
example as 50 percent or insert another adverse observation. That fail-closed mutation is
also tested.

## 10. Human participation displays

Human judgments do not become factual record observations. Each future public display
must declare its method version, time window, eligibility rule, sample size, suppression
state, uncertainty/interval, correction state, and participation label.

- **Authenticated:** only confirmed eligible human participation that is current under
  the applicable attestation, jurisdiction, consent, and privacy policy.
- **Unverified:** separately labeled participation that is not authenticated sentiment.
- **Anonymous:** separately labeled public input where a future policy permits it; it
  cannot be described as verified consensus.

These populations are never silently combined. Representative signals, category
ratings, and community context remain three separate data types. `Skip`, cancel,
abandonment, timeout, and refusal to participate create no judgment. Privacy suppression
must not be bypassed to populate a methodology display.

## 11. AI role

AI may help locate candidate sources, extract candidate facts, classify records, compare
text under a declared rubric, identify conflicts, or draft a review packet. Every use
must retain source references, process/model version, prompt or deterministic process
reference where safe, confidence/limitations, and accountable human review.

AI may not:

- publish a material claim or indicator without its required human review;
- invent a source, fact, vote, promise, position, outcome, response, or public opinion;
- cast a representative signal, category rating, comment, appeal, or civic action;
- infer citizen loyalty, political reliability, social value, identity reputation, or
  eligibility;
- use private account/identity/security data as a public-role factor; or
- serve as an undisclosed or non-reproducible calculation engine.

Generative model confidence is not methodology confidence.

## 12. Response, dispute, correction, appeal, and retraction effects

| Event | Immediate indicator effect | Version/history rule |
|---|---|---|
| Representative response | Attach and display the response; no automatic favorable or adverse change | A later approved indicator may include a response only under a pre-published method |
| Dispute opened | Mark the result `disputed`; withhold it when the dispute challenges a required material input | Preserve the original result and dispute event |
| Correction accepted | Rebuild from corrected input and create a new result | New result links with `supersedesResultId`; original remains visible as corrected/superseded |
| Appeal opened | Mark `under_appeal`; withhold when the appeal affects a material input or method application | Preserve result, grounds, decision, and time |
| Appeal decided | Rebuild, affirm, or retract under the published decision rule | Append the decision; never silently rewrite history |
| Source correction | Invalidate affected input versions and rebuild all dependent results | Link old/new record and result versions |
| Source retraction | Set dependent result `unavailable`/`retracted` unless remaining eligible inputs independently satisfy the method | Preserve the prior result as retracted |
| Method defect | Disable affected method version and withhold its results | Publish incident, superseding method or rejection, and affected-result inventory |

A response is not inherently proof, and a dispute or appeal is not inherently
exoneration or misconduct. Corrections improve the public record and must not be treated
as a generic penalty.

## 13. Versioning, publication, and change control

Method specifications and result versions are immutable. A methodology version contains
the public document, semantic version, digest, code revision, factor/category mapping,
source rules, denominators, exclusions, missing/conflict rules, confidence rules, test
fixtures, approvals, effective period, and superseded version if any.

Any semantic change to a factor, source set, denominator, weight, exclusion, threshold,
confidence rule, AI process, correction behavior, or explanation creates a new method
version. Editorial corrections that cannot change a result may be a patch release but
still receive a public change-log entry and digest.

The change process is:

1. publish a proposal and machine-readable diff;
2. disclose affected jurisdictions, records, results, and known limitations;
3. add or update public/synthetic deterministic fixtures;
4. run contract, unit, bias, adversarial, stability, correction, privacy, and legal gates
   applicable to the change;
5. obtain required independent and reserved approvals;
6. publish the version, digest, code revision, evidence, effective time, and migration
   plan before use;
7. calculate new immutable results without overwriting old ones; and
8. publish a supersession/change report that reconstructs material differences.

Rollback disables the affected version and withholds its current results. It never
reactivates a prior version without a new public decision and current source inputs, and
it never deletes the audit, correction, or supersession history.

## 14. Machine-enforceable composite release gates

The generated gate contract is
[`methodology-release-gate.schema.json`](../packages/contracts/schemas/methodology-release-gate.schema.json).
The evaluator in [`packages/methodology`](../packages/methodology/src/index.ts) requires an
approved method, an enabled runtime flag, and all eleven gates. It calculates release
eligibility only; it does not calculate or serialize a composite result.

| Machine key | Required public evidence |
|---|---|
| `publicMethodologyReview` | Published method, open review record, resolved material comments |
| `sourceAndFactorAudit` | Eligibility, representativeness, exclusions, denominator, jurisdiction, and factor audit |
| `biasAndDisparateImpactReview` | Protected-class, jurisdiction, party/ideology, language, access, and data-availability analysis within lawful limits |
| `adversarialAndManipulationTesting` | Brigading, source gaming, omission, coordinated activity, prompt/model, data poisoning, and strategic behavior tests |
| `stabilityAndSmallDataTesting` | Sensitivity, uncertainty, threshold, sparse-record, outlier, and temporal stability tests |
| `correctionAndSupersessionTesting` | Input correction, dispute, appeal, retraction, method defect, rebuild, and rollback tests |
| `privacyAndNoSocialCreditReview` | Data minimization, purpose limitation, private-life boundary, citizen-score and identity-reputation enforcement |
| `legalReview` | Canada and United States public-figure, privacy, human-rights, defamation, consumer, accessibility, and related review |
| `representativeResponseAndAppealBehavior` | Tested notice, response, dispute, correction, appeal, retraction, and turnaround behavior |
| `publicConsultation` | Published consultation scope, submissions summary, material objections, and disposition |
| `reservedGovernanceApproval` | Explicit final decision by the reserved authority with evidence references and effective time |

Each gate is `pending`, `approved`, or `rejected`, with public reason, decision time, and
evidence references. `COMPOSITE_SCORE_ENABLED=true` is invalid unless every gate is
approved and `approvedMethodologyVersion` is present. A flag alone cannot enable the
feature. A rejected gate records a valid decision not to publish.

The current synthetic release fixture has the flag false, no approved method, every gate
pending, and decision `disabled`. No production waiver, emergency bypass, or silent
operator override is permitted.

## 15. No Social Credit and public-role limitation

The methodology can evaluate only source-backed conduct connected to a voluntarily held
or sought public role. It cannot determine access to civil rights, public services,
employment, housing, credit, insurance, mobility, benefits, identity, authentication, or
unrelated platforms.

No account, device, credential, VerusID, attestation, jurisdiction-eligibility record,
security event, abuse flag, private signal, rating, comment, evidence submission, or
participation history may enter a citizen score or portable reputation. Narrow fraud,
moderation, duplicate-submission, and credential states remain purpose-limited,
contestable, non-portable, and unavailable to public-role factor calculation.
The enforced citizen/public-role data boundary and repository release blockers are defined
in [`NO_SOCIAL_CREDIT.md`](./NO_SOCIAL_CREDIT.md).

## 16. Provenance is not truth

A deterministic manifest may later commit a method document, source-set digest, result,
correction batch, or public change report. A signature, timestamp, hash, VDXF key, or
blockchain readback can show that exact bytes were committed by a stated process or
identity at a point in history. It cannot prove that the sources were complete, the
claim was true, the method was fair, the interpretation was correct, or the result
deserved trust.

Canonical records, review, response rights, correction, appeal, and public explanation
remain authoritative. Issue #27 governs provenance policy; this issue performs no Verus
operation and requires no Verus dependency.

## 17. Public change log

| Policy version | Date | Status | Change | Supersedes |
|---|---|---|---|---|
| `light-mathematics-policy.v1` | 2026-08-09 | Accepted policy baseline; execution disabled | Established canonical taxonomy/crosswalk, indicator contract, missing-data rule, participation/AI separation, correction lifecycle, version control, reproducible synthetic fixture, and eleven fail-closed composite gates | None |

Future entries must link the proposal, review evidence, test evidence, approval/rejection,
machine-readable contract changes, effective time, and affected versions. A removed or
rejected method remains in this history.
