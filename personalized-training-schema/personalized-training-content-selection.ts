import {
  DrillDefinition,
  PersonalizedDrillAttempt,
  PlannedTrainingActivity,
  TrainingSessionPlan
} from '../models/personalized-training.models';

export type ContentSelectionReasonCode =
  | 'selected_exact_match'
  | 'selected_reused_persistent_review'
  | 'unresolved_no_active_drill'
  | 'unresolved_prerequisite_missing'
  | 'avoided_recent_repetition';

export interface ResolvedTrainingActivityContent {
  activity: PlannedTrainingActivity;
  drill: DrillDefinition;
  reasonCodes: ContentSelectionReasonCode[];
}

export interface UnresolvedTrainingActivityContent {
  activity: PlannedTrainingActivity;
  reasonCodes: ContentSelectionReasonCode[];
}

export interface TrainingContentResolutionResult {
  resolvedActivities: ResolvedTrainingActivityContent[];
  unresolvedActivities: UnresolvedTrainingActivityContent[];
  selectedDrillIds: string[];
}

export function resolveTrainingPlanContent(input: {
  plan: Readonly<TrainingSessionPlan>;
  drills: readonly DrillDefinition[];
  recentAttempts?: readonly PersonalizedDrillAttempt[];
  availableTopicIds?: readonly string[];
}): TrainingContentResolutionResult {
  const selectedDrillIds: string[] = [];
  const resolvedActivities: ResolvedTrainingActivityContent[] = [];
  const unresolvedActivities: UnresolvedTrainingActivityContent[] = [];
  const recentDrillIds = (input.recentAttempts ?? []).map((attempt) => attempt.drillId);
  const immediatePreviousDrillId = recentDrillIds.at(-1) ?? null;
  const availableTopicIds = new Set(input.availableTopicIds ?? input.plan.selectedTopics.map((topic) => topic.topicId));

  for (const activity of input.plan.plannedActivities) {
    const candidates = input.drills
      .filter((drill) => drill.active)
      .filter((drill) => drill.topicId === activity.topicId)
      .filter((drill) => drill.activityType === activity.type)
      .filter((drill) => drill.prerequisiteTopicIds.every((topicId) => availableTopicIds.has(topicId)));

    if (candidates.length === 0) {
      const hasInactiveOrWrongPrereq = input.drills.some(
        (drill) =>
          drill.topicId === activity.topicId &&
          drill.activityType === activity.type &&
          drill.prerequisiteTopicIds.some((topicId) => !availableTopicIds.has(topicId))
      );
      unresolvedActivities.push({
        activity,
        reasonCodes: [hasInactiveOrWrongPrereq ? 'unresolved_prerequisite_missing' : 'unresolved_no_active_drill']
      });
      continue;
    }

    const selected = [...candidates].sort((left, right) => {
      const leftScore = candidateScore(left, recentDrillIds, immediatePreviousDrillId, selectedDrillIds);
      const rightScore = candidateScore(right, recentDrillIds, immediatePreviousDrillId, selectedDrillIds);
      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }
      return left.drillId.localeCompare(right.drillId);
    })[0];
    const avoidedImmediate = immediatePreviousDrillId !== null && candidates.some((candidate) => candidate.drillId !== immediatePreviousDrillId);
    const reused = recentDrillIds.includes(selected.drillId) && candidates.every((candidate) => recentDrillIds.includes(candidate.drillId));
    selectedDrillIds.push(selected.drillId);
    resolvedActivities.push({
      activity,
      drill: selected,
      reasonCodes: [
        reused ? 'selected_reused_persistent_review' : 'selected_exact_match',
        ...(avoidedImmediate && selected.drillId !== immediatePreviousDrillId ? ['avoided_recent_repetition' as const] : [])
      ]
    });
  }

  return {
    resolvedActivities,
    unresolvedActivities,
    selectedDrillIds
  };
}

function candidateScore(
  drill: Readonly<DrillDefinition>,
  recentDrillIds: readonly string[],
  immediatePreviousDrillId: string | null,
  selectedDrillIds: readonly string[]
): number {
  let score = 0;
  if (!recentDrillIds.includes(drill.drillId)) {
    score += 8;
  }
  if (drill.drillId !== immediatePreviousDrillId) {
    score += 4;
  }
  if (!selectedDrillIds.includes(drill.drillId)) {
    score += 2;
  }
  return score;
}
