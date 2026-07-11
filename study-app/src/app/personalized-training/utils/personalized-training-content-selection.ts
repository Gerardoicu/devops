import {
  DrillDefinition,
  DrillActivityType,
  PersonalizedDrillAttempt,
  PlannedTrainingActivity,
  PlannedActivityType,
  TrainingEnergyLevel,
  TrainingSessionPlan
} from '../models/personalized-training.models';

export type ContentSelectionReasonCode =
  | 'selected_exact_match'
  | 'selected_activity_type_fallback'
  | 'selected_available_difficulty'
  | 'selected_reused_persistent_review'
  | 'unresolved_no_active_drill'
  | 'unresolved_prerequisite_missing'
  | 'unresolved_time_budget'
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
  energyLevel?: TrainingEnergyLevel;
}): TrainingContentResolutionResult {
  const selectedDrillIds: string[] = [];
  const resolvedActivities: ResolvedTrainingActivityContent[] = [];
  const unresolvedActivities: UnresolvedTrainingActivityContent[] = [];
  const recentDrillIds = (input.recentAttempts ?? []).map((attempt) => attempt.drillId);
  const immediatePreviousDrillId = recentDrillIds.at(-1) ?? null;
  const availableTopicIds = new Set(input.availableTopicIds ?? input.plan.selectedTopics.map((topic) => topic.topicId));
  let remainingMinutes = input.plan.availableMinutes;

  for (const activity of input.plan.plannedActivities) {
    const topicCandidates = input.drills
      .filter((drill) => drill.active)
      .filter((drill) => drill.topicId === activity.topicId)
      .filter((drill) => drill.prerequisiteTopicIds.every((topicId) => availableTopicIds.has(topicId)));
    const candidates = contentCandidates(topicCandidates, activity, input.energyLevel ?? input.plan.energyLevel)
      .filter((drill) => drill.estimatedMinutes <= remainingMinutes);

    if (candidates.length === 0) {
      const hasInactiveOrWrongPrereq = input.drills.some(
        (drill) =>
          drill.topicId === activity.topicId &&
          drill.prerequisiteTopicIds.some((topicId) => !availableTopicIds.has(topicId))
      );
      const hasCandidateOverBudget = topicCandidates.some((drill) => contentCandidates([drill], activity, input.energyLevel ?? input.plan.energyLevel).length > 0);
      unresolvedActivities.push({
        activity,
        reasonCodes: [hasInactiveOrWrongPrereq ? 'unresolved_prerequisite_missing' : hasCandidateOverBudget ? 'unresolved_time_budget' : 'unresolved_no_active_drill']
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
    const selectedType = toPlannedActivityType(selected.activityType);
    const resolvedActivity: PlannedTrainingActivity = {
      ...activity,
      activityId: selectedType === activity.type ? activity.activityId : `${activity.activityId}:fallback:${selected.drillId}`,
      type: selectedType,
      estimatedMinutes: selected.estimatedMinutes
    };
    remainingMinutes -= selected.estimatedMinutes;
    selectedDrillIds.push(selected.drillId);
    resolvedActivities.push({
      activity: resolvedActivity,
      drill: selected,
      reasonCodes: [
        selectedType === activity.type ? 'selected_exact_match' : 'selected_activity_type_fallback',
        ...(selected.difficulty !== 'practice' ? ['selected_available_difficulty' as const] : []),
        ...(reused ? ['selected_reused_persistent_review' as const] : []),
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

export function createExecutablePlanFromResolution(
  plan: Readonly<TrainingSessionPlan>,
  resolution: Readonly<TrainingContentResolutionResult>
): TrainingSessionPlan {
  const plannedActivities = resolution.resolvedActivities.map((item) => item.activity);
  const estimatedMinutes = plannedActivities.reduce((total, activity) => total + activity.estimatedMinutes, 0);
  const selectedTopicIds = new Set(plannedActivities.map((activity) => activity.topicId));
  return {
    ...plan,
    planId: `${plan.planId}:executable:${resolution.selectedDrillIds.join('-')}`,
    plannedActivities,
    estimatedMinutes,
    selectedTopics: plan.selectedTopics
      .filter((topic) => selectedTopicIds.has(topic.topicId))
      .map((topic) => ({
        ...topic,
        plannedMinutes: plannedActivities
          .filter((activity) => activity.topicId === topic.topicId)
          .reduce((total, activity) => total + activity.estimatedMinutes, 0)
      })),
    deferredPriorities: [
      ...plan.deferredPriorities,
      ...resolution.unresolvedActivities.map((item) => ({
        topicId: item.activity.topicId,
        reasonCodes: item.activity.reasonCodes
      }))
    ]
  };
}

function contentCandidates(
  drills: readonly DrillDefinition[],
  activity: Readonly<PlannedTrainingActivity>,
  energyLevel: TrainingEnergyLevel
): DrillDefinition[] {
  const exact = drills.filter((drill) => toPlannedActivityType(drill.activityType) === activity.type);
  if (exact.length > 0) {
    return exact;
  }
  const allowed = new Set(fallbackOrder(energyLevel));
  return drills.filter((drill) => allowed.has(toPlannedActivityType(drill.activityType)));
}

function fallbackOrder(energyLevel: TrainingEnergyLevel): PlannedActivityType[] {
  const lightweight: PlannedActivityType[] = ['mechanism_review', 'binary_comparison', 'component_identification'];
  const operational: PlannedActivityType[] = ['workflow_ordering', 'architecture_mapping', 'distractor_elimination'];
  const demanding: PlannedActivityType[] = ['exam_scenario', 'bank_return'];
  if (energyLevel === 'low') {
    return lightweight;
  }
  if (energyLevel === 'normal') {
    return [...lightweight, ...operational];
  }
  return [...lightweight, ...operational, ...demanding];
}

function toPlannedActivityType(activityType: DrillActivityType): PlannedActivityType {
  return activityType;
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
