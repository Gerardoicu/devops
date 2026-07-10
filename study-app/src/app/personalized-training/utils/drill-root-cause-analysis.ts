import {
  DrillAttemptAssessment,
  DrillAttemptDraft,
  DrillDefinition,
  ErrorCause
} from '../models/personalized-training.models';

export function applyRootCauseAnalysis(
  definition: Readonly<DrillDefinition>,
  draft: Readonly<DrillAttemptDraft>,
  assessment: Readonly<DrillAttemptAssessment>
): DrillAttemptAssessment {
  if (assessment.result === 'correct' || assessment.result === 'completed' || assessment.result === 'unanswered') {
    return { ...assessment };
  }

  const inferred = inferCause(definition, draft, assessment);
  const manualOverride = draft.manualCauseOverride ?? null;
  return {
    ...assessment,
    inferredCause: inferred.cause,
    finalCause: manualOverride ?? inferred.cause,
    causeSource: manualOverride ? 'manual_override' : inferred.source,
    causeEvidence: manualOverride ? [...inferred.evidence, `manual_override:${manualOverride}`] : inferred.evidence,
    manualOverride
  };
}

function inferCause(
  definition: Readonly<DrillDefinition>,
  draft: Readonly<DrillAttemptDraft>,
  assessment: Readonly<DrillAttemptAssessment>
): { cause: ErrorCause | null; source: DrillAttemptAssessment['causeSource']; evidence: string[] } {
  if (assessment.bankDataIssueAffectedDiagnosis || assessment.reliability === 'excluded') {
    return { cause: null, source: 'none', evidence: ['non_diagnostic'] };
  }

  if (assessment.result === 'partial' && assessment.correctAnswerIds.length > 1) {
    return { cause: 'incomplete_multi_select', source: 'evaluation_metadata', evidence: ['proper_subset_multi_select'] };
  }

  const selectedDistractors = definition.distractorMetadata.filter((item) => draft.selectedAnswers.includes(item.optionId));
  const explicit = selectedDistractors.find((item) => item.errorCause === 'wrong_resource_scope' || item.errorCause === 'service_confusion');
  if (explicit) {
    return { cause: explicit.errorCause, source: 'distractor_metadata', evidence: [`selected:${explicit.optionId}`] };
  }

  if (draft.identifiedKeywords.length > 0) {
    const missed = definition.decisiveKeywords.find(
      (keyword) => !draft.identifiedKeywords.map((value) => value.toLowerCase()).includes(keyword.toLowerCase())
    );
    if (missed) {
      return { cause: 'missed_keyword', source: 'learner_reasoning', evidence: [`missing_keyword:${missed}`] };
    }
  }

  if (assessment.result === 'wrong' && draft.confidence !== null && draft.confidence >= 4 && assessment.reliability !== 'low') {
    return { cause: 'confidence_miscalibration', source: 'evaluation_metadata', evidence: [`confidence:${draft.confidence}`] };
  }

  return { cause: null, source: 'none', evidence: [] };
}
