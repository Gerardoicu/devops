import {
  DrillAttempt,
  ErrorCause,
  ImportedExamSession,
  ImportedQuestionAttempt,
  ManualCoachingEvidence,
  PersonalizedSession,
  ReviewSchedule,
  TopicMastery,
  TrainingEvidenceItem,
  TrainingTopicDescriptor
} from '../models/personalized-training.models';
import { RELIABILITY_WEIGHTS } from '../config/priority-engine.config';

export interface TrainingEvidenceExtractionInput {
  importedSessions?: readonly ImportedExamSession[];
  topicDescriptors?: readonly TrainingTopicDescriptor[];
  topicMastery?: Readonly<Record<string, TopicMastery>>;
  reviewSchedule?: Readonly<Record<string, ReviewSchedule>>;
  drillAttempts?: readonly DrillAttempt[];
  sessionHistory?: readonly PersonalizedSession[];
  manualEvidence?: readonly ManualCoachingEvidence[];
  now?: Date;
}

export interface TrainingEvidenceExtractionResult {
  evidence: TrainingEvidenceItem[];
  recentSessionHistory: readonly PersonalizedSession[];
}

export function extractTrainingEvidence(input: TrainingEvidenceExtractionInput): TrainingEvidenceExtractionResult {
  const descriptors = input.topicDescriptors ?? [];
  const evidence: TrainingEvidenceItem[] = [
    ...extractImportedEvidence(input.importedSessions ?? [], descriptors),
    ...extractManualEvidence(input.manualEvidence ?? []),
    ...extractDrillEvidence(input.drillAttempts ?? [], descriptors)
  ];

  return {
    evidence: evidence.sort((left, right) => left.evidenceId.localeCompare(right.evidenceId)),
    recentSessionHistory: input.sessionHistory ?? []
  };
}

function extractImportedEvidence(
  sessions: readonly ImportedExamSession[],
  descriptors: readonly TrainingTopicDescriptor[]
): TrainingEvidenceItem[] {
  const questionMap = buildQuestionTopicMap(descriptors);
  return sessions.flatMap((session) => {
    const hasConstantConfidence = session.qualityFlags.some((flag) => flag.code === 'suspicious_constant_confidence');
    const rushedStart = session.suspectedRushedSegment?.startIndex ?? null;
    return session.attempts.map((attempt) =>
      importedAttemptToEvidence(session, attempt, questionMap.get(attempt.questionId) ?? null, rushedStart, hasConstantConfidence)
    );
  });
}

function importedAttemptToEvidence(
  session: ImportedExamSession,
  attempt: ImportedQuestionAttempt,
  descriptor: TrainingTopicDescriptor | null,
  rushedStart: number | null,
  hasConstantConfidence: boolean
): TrainingEvidenceItem {
  const knownBankIssue = attempt.qualityFlags.some((flag) => flag.code === 'known_bank_data_issue');
  const unknownCorrectness = attempt.result === 'unknown';
  const inRushedSegment = rushedStart !== null && attempt.order >= rushedStart;
  const qualityFlags = [...attempt.qualityFlags];
  const sourceSessionId = session.id;
  const base: Omit<TrainingEvidenceItem, 'reliability' | 'reliabilityWeight' | 'exclusionReason' | 'errorCause'> = {
    evidenceId: `import:${sourceSessionId}:${attempt.order}:${attempt.questionId}`,
    sourceType: 'imported_exam',
    topicId: descriptor?.topicId ?? null,
    domainId: descriptor?.domainId ?? null,
    observedResult: attempt.result,
    occurredAt: session.completedAt ?? session.importedAt,
    relatedQuestionId: attempt.questionId,
    sourceSessionId,
    qualityFlags
  };

  if (knownBankIssue) {
    return {
      ...base,
      reliability: 'excluded',
      reliabilityWeight: RELIABILITY_WEIGHTS.excluded,
      exclusionReason: 'known_bank_issue_excluded',
      errorCause: 'unknown'
    };
  }

  if (unknownCorrectness) {
    return {
      ...base,
      reliability: 'excluded',
      reliabilityWeight: RELIABILITY_WEIGHTS.excluded,
      exclusionReason: 'insufficient_evidence',
      errorCause: 'unknown'
    };
  }

  const reliability = inRushedSegment ? 'low' : descriptor ? 'high' : 'medium';
  return {
    ...base,
    reliability,
    reliabilityWeight: RELIABILITY_WEIGHTS[reliability],
    exclusionReason: null,
    errorCause: inferErrorCause(attempt, inRushedSegment, hasConstantConfidence)
  };
}

function inferErrorCause(
  attempt: ImportedQuestionAttempt,
  inRushedSegment: boolean,
  hasConstantConfidence: boolean
): ErrorCause | 'unknown' | null {
  if (attempt.result === 'correct' || attempt.result === 'unanswered') {
    return null;
  }

  if (inRushedSegment) {
    return 'rushed_reading';
  }

  if (attempt.result === 'partial' && attempt.correctAnswers.length > 1 && attempt.selectedAnswers.length < attempt.correctAnswers.length) {
    return 'incomplete_multi_select';
  }

  if (!hasConstantConfidence && attempt.result === 'wrong' && attempt.confidence !== null && attempt.confidence >= 4) {
    return 'confidence_miscalibration';
  }

  return 'unknown';
}

function extractManualEvidence(items: readonly ManualCoachingEvidence[]): TrainingEvidenceItem[] {
  return items.map((item) => ({
    evidenceId: item.evidenceId,
    sourceType: 'manual_coaching',
    topicId: item.topicId,
    domainId: item.domainId,
    observedResult: item.observedResult,
    occurredAt: item.occurredAt,
    reliability: item.reliability,
    reliabilityWeight: RELIABILITY_WEIGHTS[item.reliability],
    exclusionReason: item.reliability === 'excluded' ? 'insufficient_evidence' : null,
    relatedQuestionId: null,
    sourceSessionId: null,
    qualityFlags: [],
    errorCause: item.errorCause
  }));
}

function extractDrillEvidence(
  attempts: readonly DrillAttempt[],
  descriptors: readonly TrainingTopicDescriptor[]
): TrainingEvidenceItem[] {
  return attempts.map((attempt) => {
    const topicId = attempt.drillSetId.replace(/^drill-/, 'topic-');
    const descriptor = descriptors.find((candidate) => candidate.topicId === topicId) ?? null;
    return {
      evidenceId: `drill:${attempt.id}`,
      sourceType: 'drill_attempt',
      topicId,
      domainId: descriptor?.domainId ?? null,
      observedResult: attempt.result === 'incorrect' ? 'wrong' : attempt.result,
      occurredAt: attempt.attemptedAt,
      reliability: 'medium',
      reliabilityWeight: RELIABILITY_WEIGHTS.medium,
      exclusionReason: null,
      relatedQuestionId: null,
      sourceSessionId: null,
      qualityFlags: [],
      errorCause: attempt.errorCauses[0] ?? null
    };
  });
}

function buildQuestionTopicMap(descriptors: readonly TrainingTopicDescriptor[]): Map<number, TrainingTopicDescriptor> {
  const map = new Map<number, TrainingTopicDescriptor>();
  for (const descriptor of descriptors) {
    for (const sourceQuestion of descriptor.sourceQuestions) {
      map.set(sourceQuestion.questionId, descriptor);
    }
  }
  return map;
}
