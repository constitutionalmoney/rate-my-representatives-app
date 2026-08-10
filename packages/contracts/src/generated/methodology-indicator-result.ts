/* Generated from methodology-indicator-result.schema.json. Do not edit directly. */

export type MethodologyIndicatorResultV1 = {
  [k: string]: unknown;
} & {
  schemaVersion: 'methodology-indicator-result.v1';
  resultId: Id;
  dataMode: 'synthetic' | 'pilot' | 'production';
  target: Target;
  displayCategory:
    | 'policy_and_voting_alignment'
    | 'integrity_and_accountability'
    | 'financial_influence_and_disclosure'
    | 'constituent_engagement'
    | 'performance_and_effectiveness'
    | 'verification_and_source_coverage';
  method: Method;
  sourceSet: SourceSet;
  coverage: Coverage;
  freshness: Freshness;
  result: Result;
  missingData: MissingData;
  confidence: Confidence;
  ai: Ai;
  correction: Correction;
  participationIncluded: false;
  calculatedAt: string;
  publicationState: 'test_only' | 'withheld' | 'approved';
  provenance: Provenance;
};
export type Id = string;
export type Sha256 = string;
export type NonNegativeInteger = number;
export type Percentage = number | null;

export interface Target {
  kind: 'office_term' | 'candidacy';
  targetId: Id;
}
export interface Method {
  methodId: Id;
  version: Id;
  specificationSha256: Sha256;
  codeRevision: Id;
  approvalState: 'illustrative_not_approved' | 'approved';
}
export interface SourceSet {
  /**
   * @minItems 1
   */
  sourceIds: [Id, ...Id[]];
  /**
   * @minItems 1
   */
  recordVersionIds: [Id, ...Id[]];
  digest: Sha256;
  inputCutoffAt: string;
}
export interface Coverage {
  numerator: NonNegativeInteger;
  denominator: NonNegativeInteger;
  percentage: Percentage;
  state: 'supported' | 'partial' | 'gap' | 'unsupported' | 'not_applicable';
  gapIds: Id[];
}
export interface Freshness {
  state: 'current' | 'stale' | 'unknown' | 'unavailable';
  evaluatedAt: string;
  thresholdHours: number;
  oldestInputAt: string | null;
}
export interface Result {
  status: 'available' | 'unavailable';
  value: number | null;
  unit: 'percent' | 'ratio' | 'count' | 'boolean' | 'not_applicable';
  calculationRule: string;
  calculationInputs: CalculationInput[];
  explanation: string;
}
export interface CalculationInput {
  name: Id;
  value: number;
}
export interface MissingData {
  state: 'complete' | 'gap' | 'conflict' | 'stale' | 'retracted' | 'unavailable';
  missingInputCount: NonNegativeInteger;
  treatment: 'no_adverse_inference';
  publicExplanation: string;
}
export interface Confidence {
  status: 'not_assessed' | 'insufficient' | 'low' | 'moderate' | 'high';
  value: number | null;
  rationale: string;
}
export interface Ai {
  role: 'none' | 'extraction_assist' | 'classification_assist' | 'comparison_assist';
  outputPublication: false;
  humanReviewState: 'not_required' | 'required' | 'completed';
}
export interface Correction {
  state: 'current' | 'disputed' | 'under_appeal' | 'corrected' | 'superseded' | 'retracted';
  supersedesResultId: Id | null;
  affectedByRecordVersionIds: Id[];
  explanation: string;
}
export interface Provenance {
  state: 'not_anchored' | 'anchored';
  meaning: 'commitment_not_truth';
  manifestSha256: Sha256 | null;
}
