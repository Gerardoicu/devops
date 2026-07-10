import {
  DrillAttemptAssessment,
  DrillAttemptDraft,
  DrillDefinition,
  DrillEvaluationResult,
  EvidenceReliabilityClass,
  ImportQualityFlag,
  ResolvedBankQuestion
} from '../models/personalized-training.models';
import { DRILL_EVALUATION_ENGINE_VERSION } from '../config/drill-engine.config';
import { KNOWN_BANK_DATA_ISSUES } from './exam-session-quality-analysis';

export interface DrillEvaluationInput {
  definition: Readonly<DrillDefinition>;
  draft: Readonly<DrillAttemptDraft>;
  resolvedBankQuestion?: Readonly<ResolvedBankQuestion> | null;
  rushedSession?: boolean;
  invalidDefinition?: boolean;
}

export function evaluateDrillAttempt(input: DrillEvaluationInput): DrillAttemptAssessment {
  const definition = input.definition;
  const draft = input.draft;
  const knownIssue = definition.sourceQuestionRefs.some((ref) => KNOWN_BANK_DATA_ISSUES[ref.questionId]);
  const unresolvedBank = definition.activityType === 'bank_return' && !input.resolvedBankQuestion;
  const qualityFlags: ImportQualityFlag[] = [];
  if (knownIssue) {
    qualityFlags.push({
      code: 'known_bank_data_issue',
      severity: 'warning',
      scope: 'question',
      questionId: definition.sourceQuestionRefs[0]?.questionId,
      message: 'Known bank data issue affects diagnosis.'
    });
  }

  const result = evaluateResult(definition, draft, input.resolvedBankQuestion ?? null);
  const reliability = determineReliability(knownIssue, unresolvedBank, input.invalidDefinition === true, input.rushedSession === true, result);
  return {
    result,
    normalizedSelectedAnswers: normalizeIds(draft.selectedAnswers),
    correctAnswerIds: expectedOptionIds(definition, input.resolvedBankQuestion ?? null),
    expectedWorkflowOrder: definition.expectedAnswer.workflowOrder ?? [],
    expectedMappings: definition.expectedAnswer.mappings ?? {},
    reliability,
    qualityFlags,
    inferredCause: null,
    finalCause: null,
    causeSource: 'none',
    causeEvidence: [],
    manualOverride: null,
    bankDataIssueAffectedDiagnosis: knownIssue,
    evaluationEngineVersion: DRILL_EVALUATION_ENGINE_VERSION
  };
}

function evaluateResult(
  definition: Readonly<DrillDefinition>,
  draft: Readonly<DrillAttemptDraft>,
  resolvedBank: Readonly<ResolvedBankQuestion> | null
): DrillEvaluationResult {
  if (definition.activityType === 'mechanism_review' || definition.activityType === 'spaced_review') {
    return 'completed';
  }
  if (definition.activityType === 'workflow_ordering') {
    return evaluateWorkflow(definition, draft);
  }
  if (definition.activityType === 'architecture_mapping') {
    return evaluateMapping(definition, draft);
  }
  const expected = expectedOptionIds(definition, resolvedBank);
  return evaluateOptionSet(normalizeIds(draft.selectedAnswers), expected);
}

function evaluateOptionSet(selected: readonly string[], expected: readonly string[]): DrillEvaluationResult {
  if (selected.length === 0) {
    return 'unanswered';
  }
  const expectedSet = new Set(expected);
  const selectedSet = new Set(selected);
  if (selected.some((id) => !expectedSet.has(id))) {
    return 'wrong';
  }
  if (selectedSet.size === expectedSet.size && expected.every((id) => selectedSet.has(id))) {
    return 'correct';
  }
  return expected.length > 1 && selected.length > 0 ? 'partial' : 'wrong';
}

function evaluateWorkflow(definition: Readonly<DrillDefinition>, draft: Readonly<DrillAttemptDraft>): DrillEvaluationResult {
  const selected = normalizeIds(draft.orderedItems);
  const expected = definition.expectedAnswer.workflowOrder ?? [];
  if (selected.length === 0) {
    return 'unanswered';
  }
  const allValidOrders = [expected, ...(definition.expectedAnswer.equivalentWorkflowOrders ?? [])];
  if (allValidOrders.some((order) => sameOrder(selected, order))) {
    return 'correct';
  }
  if (definition.evaluationRules.allowPartialCredit && selected.some((id, index) => expected[index] === id)) {
    return 'partial';
  }
  return 'wrong';
}

function evaluateMapping(definition: Readonly<DrillDefinition>, draft: Readonly<DrillAttemptDraft>): DrillEvaluationResult {
  const expected = definition.expectedAnswer.mappings ?? {};
  const keys = Object.keys(expected);
  if (Object.keys(draft.mappingSelections).length === 0) {
    return 'unanswered';
  }
  const correct = keys.filter((key) => draft.mappingSelections[key] === expected[key]).length;
  if (correct === keys.length && keys.length > 0) {
    return 'correct';
  }
  return definition.evaluationRules.partialMappingCredit && correct > 0 ? 'partial' : 'wrong';
}

function expectedOptionIds(definition: Readonly<DrillDefinition>, resolvedBank: Readonly<ResolvedBankQuestion> | null): string[] {
  return resolvedBank?.correctOptionIds ? normalizeIds(resolvedBank.correctOptionIds) : normalizeIds(definition.expectedAnswer.optionIds ?? []);
}

function normalizeIds(values: readonly string[]): string[] {
  const normalized: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed.length > 0 && !normalized.includes(trimmed)) {
      normalized.push(trimmed);
    }
  }
  return normalized;
}

function sameOrder(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id, index) => right[index] === id);
}

function determineReliability(
  knownIssue: boolean,
  unresolvedBank: boolean,
  invalidDefinition: boolean,
  rushedSession: boolean,
  result: DrillEvaluationResult
): EvidenceReliabilityClass {
  if (knownIssue || unresolvedBank || invalidDefinition) {
    return 'excluded';
  }
  if (rushedSession) {
    return 'low';
  }
  return result === 'completed' ? 'medium' : 'high';
}
