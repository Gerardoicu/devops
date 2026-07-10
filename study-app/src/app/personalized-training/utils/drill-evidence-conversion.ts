import {
  DrillReviewView,
  PersonalizedDrillAttempt,
  TrainingEvidenceItem
} from '../models/personalized-training.models';
import { DRILL_EVIDENCE_CONVERSION_VERSION } from '../config/drill-engine.config';

export function createDrillReviewView(attempt: Readonly<PersonalizedDrillAttempt>): DrillReviewView {
  const selectedMetadata = attempt.assessment.finalCause ? [`cause:${attempt.assessment.finalCause}`] : [];
  return {
    result: attempt.assessment.result,
    correctAnswerIds: [...attempt.assessment.correctAnswerIds],
    expectedWorkflowOrder: [...attempt.assessment.expectedWorkflowOrder],
    expectedMappings: { ...attempt.assessment.expectedMappings },
    conciseExplanation: 'Review the configured explanation for this drill.',
    decisiveKeywords: [],
    testedExamPattern: attempt.activityType,
    correctChoiceWins: 'The expected answer matches the configured evaluation rule.',
    selectedDistractorAttractions: selectedMetadata,
    selectedDistractorFailures: attempt.assessment.causeEvidence,
    rootCause: attempt.assessment.finalCause,
    confidenceObservation: attempt.confidence !== null && attempt.assessment.result === 'wrong' ? `confidence:${attempt.confidence}` : null,
    recommendedNextAction: attempt.assessment.result === 'correct' ? 'reinforce_success' : 'review_mechanism',
    sourceQuestionRefs: [...attempt.sourceQuestionRefs],
    bankDataIssueAffectedDiagnosis: attempt.assessment.bankDataIssueAffectedDiagnosis
  };
}

export function convertAttemptToEvidence(attempt: Readonly<PersonalizedDrillAttempt>): TrainingEvidenceItem {
  return {
    evidenceId: `drill-evidence:${attempt.attemptId}:${DRILL_EVIDENCE_CONVERSION_VERSION}`,
    sourceType: 'drill_attempt',
    topicId: attempt.topicId,
    domainId: attempt.domainId,
    observedResult: attempt.assessment.result === 'completed' ? 'reinforced' : attempt.assessment.result,
    occurredAt: attempt.submittedAt,
    reliability: attempt.assessment.reliability,
    reliabilityWeight: reliabilityWeight(attempt.assessment.reliability),
    exclusionReason: attempt.assessment.bankDataIssueAffectedDiagnosis ? 'known_bank_issue_excluded' : null,
    relatedQuestionId: attempt.sourceQuestionRefs[0]?.questionId ?? null,
    sourceSessionId: attempt.runtimeSessionId,
    qualityFlags: [...attempt.assessment.qualityFlags],
    errorCause: attempt.assessment.finalCause
  };
}

function reliabilityWeight(reliability: TrainingEvidenceItem['reliability']): number {
  if (reliability === 'high') {
    return 1;
  }
  if (reliability === 'medium') {
    return 0.65;
  }
  if (reliability === 'low') {
    return 0.25;
  }
  return 0;
}
