import { getBlueprintWeightPercent } from '../config/dop-c02-blueprint';
import {
  PersonalizedSession,
  PriorityReasonCode,
  PriorityScoreComponent,
  ReviewSchedule,
  ReviewUrgency,
  TopicMastery,
  TrainingEvidenceItem,
  TrainingPriorityRecommendation,
  TrainingTopicDescriptor
} from '../models/personalized-training.models';
import { OVERTRAINING_LIMITS, PRIORITY_SCORING, PRIORITY_TIME_WINDOWS } from '../config/priority-engine.config';

export interface TrainingPriorityRankingInput {
  topicDescriptors: readonly TrainingTopicDescriptor[];
  evidence: readonly TrainingEvidenceItem[];
  topicMastery?: Readonly<Record<string, TopicMastery>>;
  reviewSchedule?: Readonly<Record<string, ReviewSchedule>>;
  sessionHistory?: readonly PersonalizedSession[];
  now: Date;
}

export interface TrainingPriorityRankingResult {
  priorities: TrainingPriorityRecommendation[];
}

interface TopicEvidenceStats {
  totalEvidence: number;
  reliableErrors: number;
  crossSessionErrorCount: number;
  correctEvidence: number;
  excludedEvidence: number;
  latestEvidenceAt: string | null;
  high: number;
  medium: number;
  low: number;
  excluded: number;
  errorCauseCounts: ReadonlyMap<string, number>;
  partialMultiSelectCount: number;
  highConfidenceWrongCount: number;
  knownIssueExcludedCount: number;
  rushedDiscountedCount: number;
  onlyLowOrExcluded: boolean;
  onlyKnownIssue: boolean;
  reinforcedRecently: boolean;
  bankReturnFailures: number;
}

export function rankTrainingPriorities(input: TrainingPriorityRankingInput): TrainingPriorityRankingResult {
  const priorities = input.topicDescriptors.map((topic) => rankTopic(topic, input));
  const sorted = priorities
    .sort((left, right) => comparePriorities(left, right))
    .map((priority, index) => ({ ...priority, rank: index + 1 }));
  return { priorities: sorted };
}

function rankTopic(
  topic: TrainingTopicDescriptor,
  input: TrainingPriorityRankingInput
): TrainingPriorityRecommendation {
  const evidence = input.evidence.filter((item) => item.topicId === topic.topicId);
  const stats = summarizeEvidence(evidence, input.now);
  const mastery = input.topicMastery?.[topic.topicId] ?? null;
  const review = input.reviewSchedule?.[topic.topicId] ?? null;
  const components: PriorityScoreComponent[] = [];
  const reasonCodes = new Set<PriorityReasonCode>();
  const blueprintWeight = getBlueprintWeightPercent(topic.domainId);

  addComponent(components, 'blueprint_weight', 'Official blueprint weight', blueprintWeight * topic.blueprintRelevance, {
    weightPercent: blueprintWeight,
    blueprintRelevance: topic.blueprintRelevance
  });
  if (blueprintWeight >= 17) {
    reasonCodes.add('high_weight_domain');
  }

  if (topic.currentStatus === 'untested' || evidence.length === 0) {
    addComponent(components, 'untested_topic', 'Untested topic coverage', PRIORITY_SCORING.untestedTopic);
    reasonCodes.add('untested_topic');
    reasonCodes.add('coverage_gap');
  }

  if (topic.currentStatus === 'weak' || mastery?.status === 'weak') {
    addComponent(components, 'weak_status', 'Current status is weak', PRIORITY_SCORING.weakStatus);
    reasonCodes.add('weak_topic');
  } else if (topic.currentStatus === 'developing' || mastery?.status === 'developing') {
    addComponent(components, 'developing_status', 'Current status is developing', PRIORITY_SCORING.developingStatus);
  }

  if (stats.reliableErrors > 0) {
    addComponent(components, 'reliable_errors', 'Reliable incorrect or partial evidence', stats.reliableErrors * PRIORITY_SCORING.reliableError);
  }
  if (stats.reliableErrors >= 2) {
    addComponent(components, 'repeated_reliable_errors', 'Repeated reliable errors', PRIORITY_SCORING.repeatedReliableError);
    reasonCodes.add('repeated_reliable_errors');
  }
  if (stats.crossSessionErrorCount >= 2) {
    addComponent(components, 'cross_session_errors', 'Errors recur across sessions', PRIORITY_SCORING.crossSessionError);
    reasonCodes.add('repeated_cross_session_error');
  }
  if (stats.partialMultiSelectCount > 0) {
    addComponent(components, 'partial_multi_select', 'Reliable partial multi-select evidence', stats.partialMultiSelectCount * PRIORITY_SCORING.partialMultiSelect);
    reasonCodes.add('multi_select_failure');
  }

  addCausePatternComponents(components, reasonCodes, stats);

  if (stats.highConfidenceWrongCount > 0) {
    addComponent(components, 'high_confidence_wrong', 'Reliable high-confidence wrong answer', PRIORITY_SCORING.highConfidenceWrong);
    reasonCodes.add('reliable_high_confidence_wrong');
  }

  const urgency = getReviewUrgency(review, input.now);
  if (urgency !== 'none') {
    addComponent(components, 'review_due', 'Scheduled review is due or soon', PRIORITY_SCORING.reviewDue * urgencyWeight(urgency));
    reasonCodes.add('review_due');
  }

  if (stats.bankReturnFailures > 0) {
    addComponent(components, 'bank_return_failure', 'Bank-return evidence shows a miss', PRIORITY_SCORING.bankReturnFailure);
    reasonCodes.add('bank_return_failure');
  }

  if (stats.reinforcedRecently) {
    addComponent(components, 'recent_reinforcement', 'Recently reinforced successfully', PRIORITY_SCORING.recentReinforcementReduction);
    reasonCodes.add('recently_reinforced');
    reasonCodes.add('recent_improvement');
  }

  applyPrerequisiteComponent(components, reasonCodes, topic, input.topicMastery);
  applyReliabilityReductions(components, reasonCodes, stats);
  applyStrongCap(components, reasonCodes, topic, mastery, stats);
  applyOvertrainingCap(components, reasonCodes, topic.topicId, stats, input.sessionHistory ?? [], input.now);

  const rawScore = components.reduce((total, component) => total + component.value, 0);
  const cappedScore = stats.onlyKnownIssue ? Math.min(rawScore, PRIORITY_SCORING.knownIssueOnlyCap) : rawScore;
  if (stats.onlyKnownIssue) {
    reasonCodes.add('known_bank_issue_excluded');
  }
  if (evidence.length === 0 || stats.onlyLowOrExcluded) {
    reasonCodes.add('insufficient_evidence');
  }

  const score = Math.max(0, Math.round(cappedScore * 100) / 100);
  return {
    topicId: topic.topicId,
    domainId: topic.domainId,
    rank: 0,
    totalScore: score,
    scoreComponents: components,
    reasonCodes: Array.from(reasonCodes).sort(),
    evidenceSummary: {
      totalEvidence: stats.totalEvidence,
      reliableErrors: stats.reliableErrors,
      crossSessionErrorCount: stats.crossSessionErrorCount,
      correctEvidence: stats.correctEvidence,
      excludedEvidence: stats.excludedEvidence,
      latestEvidenceAt: stats.latestEvidenceAt
    },
    reliabilitySummary: {
      high: stats.high,
      medium: stats.medium,
      low: stats.low,
      excluded: stats.excluded
    },
    recommendedTrainingAction: chooseAction(stats, topic.currentStatus, urgency),
    recommendedDifficulty: stats.reliableErrors >= 2 ? 'practice' : topic.currentStatus === 'strong' ? 'exam_like' : 'intro',
    reviewUrgency: urgency,
    sourceQuestionRefs: topic.sourceQuestions
  };
}

function summarizeEvidence(evidence: readonly TrainingEvidenceItem[], now: Date): TopicEvidenceStats {
  const reliableErrorSessionIds = new Set<string>();
  const causeCounts = new Map<string, number>();
  let reliableErrors = 0;
  let correctEvidence = 0;
  let excludedEvidence = 0;
  let partialMultiSelectCount = 0;
  let highConfidenceWrongCount = 0;
  let knownIssueExcludedCount = 0;
  let rushedDiscountedCount = 0;
  let bankReturnFailures = 0;
  let reinforcedRecently = false;
  let latestEvidenceAt: string | null = null;
  const reliabilityCounts = { high: 0, medium: 0, low: 0, excluded: 0 };

  for (const item of evidence) {
    reliabilityCounts[item.reliability] += 1;
    latestEvidenceAt = latestEvidenceAt === null || Date.parse(item.occurredAt) > Date.parse(latestEvidenceAt) ? item.occurredAt : latestEvidenceAt;
    if (item.exclusionReason === 'known_bank_issue_excluded') {
      knownIssueExcludedCount += 1;
    }
    if (item.reliability === 'excluded') {
      excludedEvidence += 1;
      continue;
    }
    if (item.reliability === 'low' && item.errorCause === 'rushed_reading') {
      rushedDiscountedCount += 1;
    }
    if (item.observedResult === 'correct' || item.observedResult === 'reinforced') {
      correctEvidence += 1;
      reinforcedRecently = reinforcedRecently || daysBetween(item.occurredAt, now) <= PRIORITY_TIME_WINDOWS.recentReinforcementDays;
    }
    if ((item.observedResult === 'wrong' || item.observedResult === 'partial') && item.reliability !== 'low') {
      reliableErrors += 1;
      if (item.sourceSessionId) {
        reliableErrorSessionIds.add(item.sourceSessionId);
      }
      if (item.errorCause) {
        causeCounts.set(item.errorCause, (causeCounts.get(item.errorCause) ?? 0) + 1);
      }
      if (item.observedResult === 'partial') {
        partialMultiSelectCount += 1;
      }
      if (item.errorCause === 'confidence_miscalibration') {
        highConfidenceWrongCount += 1;
      }
      if (item.sourceType === 'drill_attempt') {
        bankReturnFailures += 1;
      }
    }
  }

  return {
    totalEvidence: evidence.length,
    reliableErrors,
    crossSessionErrorCount: reliableErrorSessionIds.size,
    correctEvidence,
    excludedEvidence,
    latestEvidenceAt,
    high: reliabilityCounts.high,
    medium: reliabilityCounts.medium,
    low: reliabilityCounts.low,
    excluded: reliabilityCounts.excluded,
    errorCauseCounts: causeCounts,
    partialMultiSelectCount,
    highConfidenceWrongCount,
    knownIssueExcludedCount,
    rushedDiscountedCount,
    onlyLowOrExcluded: evidence.length > 0 && evidence.every((item) => item.reliability === 'low' || item.reliability === 'excluded'),
    onlyKnownIssue: evidence.length > 0 && knownIssueExcludedCount === evidence.length,
    reinforcedRecently,
    bankReturnFailures
  };
}

function addCausePatternComponents(
  components: PriorityScoreComponent[],
  reasonCodes: Set<PriorityReasonCode>,
  stats: TopicEvidenceStats
): void {
  const mapping: Readonly<Record<string, PriorityReasonCode>> = {
    wrong_resource_scope: 'wrong_resource_scope_pattern',
    service_confusion: 'service_confusion_pattern',
    missed_keyword: 'missed_keyword_pattern'
  };
  for (const [cause, count] of stats.errorCauseCounts) {
    const code = mapping[cause];
    if (code && count >= 1) {
      addComponent(components, cause, `Evidence pattern: ${cause}`, count * PRIORITY_SCORING.errorCausePattern);
      reasonCodes.add(code);
    }
  }
}

function applyPrerequisiteComponent(
  components: PriorityScoreComponent[],
  reasonCodes: Set<PriorityReasonCode>,
  topic: TrainingTopicDescriptor,
  mastery: Readonly<Record<string, TopicMastery>> | undefined
): void {
  const hasWeakPrerequisite = topic.prerequisiteTopicIds.some((topicId) => mastery?.[topicId]?.status === 'weak');
  if (hasWeakPrerequisite) {
    addComponent(components, 'prerequisite_gap', 'A prerequisite topic is weak', PRIORITY_SCORING.prerequisiteGap);
    reasonCodes.add('prerequisite_gap');
  }
}

function applyReliabilityReductions(
  components: PriorityScoreComponent[],
  reasonCodes: Set<PriorityReasonCode>,
  stats: TopicEvidenceStats
): void {
  if (stats.rushedDiscountedCount > 0) {
    addComponent(components, 'rushed_discount', 'Rushed evidence was discounted', -stats.rushedDiscountedCount * 4);
    reasonCodes.add('rushed_evidence_discounted');
  }
  if (stats.onlyLowOrExcluded && stats.totalEvidence > 0) {
    addComponent(components, 'low_reliability_cap', 'Only low or excluded evidence is available', -6);
  }
}

function applyStrongCap(
  components: PriorityScoreComponent[],
  reasonCodes: Set<PriorityReasonCode>,
  topic: TrainingTopicDescriptor,
  mastery: TopicMastery | null,
  stats: TopicEvidenceStats
): void {
  const hasIndependentStrength = stats.correctEvidence >= 2 || (mastery?.correctAttempts ?? 0) >= 2;
  if ((topic.currentStatus === 'strong' || mastery?.status === 'strong') && hasIndependentStrength && stats.reliableErrors === 0) {
    addComponent(components, 'strong_topic_cap', 'Strong topic with independent correct evidence is capped', -PRIORITY_SCORING.strongTopicCap);
    reasonCodes.add('strong_topic_capped');
  }
}

function applyOvertrainingCap(
  components: PriorityScoreComponent[],
  reasonCodes: Set<PriorityReasonCode>,
  topicId: string,
  stats: TopicEvidenceStats,
  sessions: readonly PersonalizedSession[],
  now: Date
): void {
  const recentSelections = sessions.filter((session) => {
    const completedAt = session.completedAt ?? session.startedAt;
    return daysBetween(completedAt, now) <= PRIORITY_TIME_WINDOWS.recentSessionDays && session.steps.some((step) => step.targetId === topicId);
  }).length;
  if (recentSelections >= OVERTRAINING_LIMITS.recentDominantTopicCount && stats.crossSessionErrorCount < OVERTRAINING_LIMITS.persistentReliableErrorCount) {
    addComponent(components, 'overtraining_cap', 'Recent sessions already focused this topic', PRIORITY_SCORING.overtrainingReduction);
    reasonCodes.add('overtraining_cap');
  }
}

function getReviewUrgency(review: ReviewSchedule | null, now: Date): ReviewUrgency {
  if (!review) {
    return 'none';
  }
  const dueMs = Date.parse(review.dueAt);
  if (dueMs <= now.getTime()) {
    return review.priority === 'urgent' ? 'urgent' : 'high';
  }
  return dueMs - now.getTime() <= PRIORITY_TIME_WINDOWS.dueSoonDays * 24 * 60 * 60 * 1000 ? 'medium' : 'low';
}

function urgencyWeight(urgency: ReviewUrgency): number {
  if (urgency === 'urgent') {
    return 1.3;
  }
  if (urgency === 'high') {
    return 1;
  }
  if (urgency === 'medium') {
    return 0.7;
  }
  return urgency === 'low' ? 0.35 : 0;
}

function chooseAction(
  stats: TopicEvidenceStats,
  status: TrainingTopicDescriptor['currentStatus'],
  urgency: ReviewUrgency
) {
  if (urgency !== 'none' && stats.reliableErrors === 0) {
    return 'scheduled_review';
  }
  if (stats.reliableErrors >= 2 || stats.highConfidenceWrongCount > 0) {
    return 'repair_misconception';
  }
  if (stats.partialMultiSelectCount > 0) {
    return 'practice_elimination';
  }
  if (status === 'strong') {
    return 'reinforce_success';
  }
  return stats.totalEvidence === 0 ? 'collect_evidence' : 'review_mechanism';
}

function addComponent(
  components: PriorityScoreComponent[],
  code: string,
  label: string,
  value: number,
  details?: Record<string, unknown>
): void {
  components.push({
    code,
    label,
    value,
    ...(details ? { details } : {})
  });
}

function comparePriorities(left: TrainingPriorityRecommendation, right: TrainingPriorityRecommendation): number {
  const scoreDelta = right.totalScore - left.totalScore;
  if (scoreDelta !== 0) {
    return scoreDelta;
  }
  const urgencyDelta = urgencyRank(right.reviewUrgency) - urgencyRank(left.reviewUrgency);
  if (urgencyDelta !== 0) {
    return urgencyDelta;
  }
  const weightDelta = getBlueprintWeightPercent(right.domainId) - getBlueprintWeightPercent(left.domainId);
  if (weightDelta !== 0) {
    return weightDelta;
  }
  return left.topicId.localeCompare(right.topicId);
}

function urgencyRank(urgency: ReviewUrgency): number {
  return ['none', 'low', 'medium', 'high', 'urgent'].indexOf(urgency);
}

function daysBetween(isoDate: string, now: Date): number {
  return Math.abs(now.getTime() - Date.parse(isoDate)) / (24 * 60 * 60 * 1000);
}
