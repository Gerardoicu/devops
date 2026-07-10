import { DrillAttemptDraft } from '../models/personalized-training.models';

export const DRILL_DEFINITION_SCHEMA_VERSION = 'drill-definition-v1';
export const DRILL_EVALUATION_ENGINE_VERSION = 'personalized-drill-evaluator-v4';
export const RUNTIME_SESSION_ENGINE_VERSION = 'personalized-runtime-v4';
export const DRILL_EVIDENCE_CONVERSION_VERSION = 'personalized-drill-evidence-v4';

export const DEFAULT_DRILL_ATTEMPT_DRAFT: DrillAttemptDraft = {
  identifiedKeywords: [],
  eliminatedOptions: [],
  eliminationReasons: {},
  uncertaintyNotes: null,
  reasoningSummary: null,
  selectedAnswers: [],
  orderedItems: [],
  mappingSelections: {},
  confidence: null,
  responseTimeSeconds: null,
  activeTimeSeconds: null
};
