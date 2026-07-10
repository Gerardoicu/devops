import {
  PlannedActivityType,
  PriorityReasonCode,
  TrainingEnergyLevel,
  TrainingPriorityRecommendation,
  TrainingSessionPlan
} from '../models/personalized-training.models';
import { ACTIVITY_MINUTES, PLANNING_ENGINE_VERSION, PLANNING_LIMITS, PRIORITY_ENGINE_VERSION } from '../config/priority-engine.config';

export interface TrainingSessionPlanningInput {
  rankedPriorities: readonly TrainingPriorityRecommendation[];
  availableMinutes: number;
  energyLevel: TrainingEnergyLevel;
  generatedAt: string;
  maximumTopicCount?: number;
}

export function planTrainingSession(input: TrainingSessionPlanningInput): TrainingSessionPlan {
  const maxTopics = input.maximumTopicCount ?? defaultMaxTopics(input.energyLevel);
  const selectedPriorities: TrainingPriorityRecommendation[] = [];
  const activities: TrainingSessionPlan['plannedActivities'] = [];
  let remainingMinutes = Math.max(0, input.availableMinutes);

  for (const priority of input.rankedPriorities) {
    if (selectedPriorities.length >= maxTopics) {
      break;
    }

    const candidateActivities = chooseActivities(priority, input.energyLevel, remainingMinutes);
    const totalCandidateMinutes = candidateActivities.reduce((total, activity) => total + ACTIVITY_MINUTES[activity], 0);
    if (candidateActivities.length === 0 || totalCandidateMinutes > remainingMinutes) {
      continue;
    }

    selectedPriorities.push(priority);
    candidateActivities.forEach((type, index) => {
      activities.push({
        activityId: `${priority.topicId}:${type}:${index}`,
        topicId: priority.topicId,
        type,
        estimatedMinutes: ACTIVITY_MINUTES[type],
        reasonCodes: priority.reasonCodes
      });
    });
    remainingMinutes -= totalCandidateMinutes;
  }

  if (activities.length === 0 && input.rankedPriorities[0] && input.availableMinutes >= ACTIVITY_MINUTES.spaced_review) {
    const priority = input.rankedPriorities[0];
    selectedPriorities.push(priority);
    activities.push({
      activityId: `${priority.topicId}:spaced_review:0`,
      topicId: priority.topicId,
      type: 'spaced_review',
      estimatedMinutes: ACTIVITY_MINUTES.spaced_review,
      reasonCodes: ['insufficient_evidence']
    });
  }

  const estimatedMinutes = activities.reduce((total, activity) => total + activity.estimatedMinutes, 0);
  const selectedTopicIds = new Set(selectedPriorities.map((priority) => priority.topicId));
  const deferred = input.rankedPriorities
    .filter((priority) => !selectedTopicIds.has(priority.topicId))
    .map((priority) => ({
      topicId: priority.topicId,
      reasonCodes: deferReasons(priority, input.availableMinutes, maxTopics)
    }));

  return {
    planId: `plan:${input.generatedAt}:${input.energyLevel}:${input.availableMinutes}:${selectedPriorities.map((priority) => priority.topicId).join('-')}`,
    generatedAt: input.generatedAt,
    planningEngineVersion: PLANNING_ENGINE_VERSION,
    priorityEngineVersion: PRIORITY_ENGINE_VERSION,
    availableMinutes: input.availableMinutes,
    energyLevel: input.energyLevel,
    primaryObjective: selectedPriorities[0]?.topicId ?? 'no_available_priority',
    selectedTopics: selectedPriorities.map((priority) => ({
      topicId: priority.topicId,
      domainId: priority.domainId,
      rank: priority.rank,
      plannedMinutes: activities
        .filter((activity) => activity.topicId === priority.topicId)
        .reduce((total, activity) => total + activity.estimatedMinutes, 0),
      reasonCodes: priority.reasonCodes
    })),
    plannedActivities: activities,
    estimatedMinutes,
    deferredPriorities: deferred,
    planningReasonCodes: planningReasons(input.energyLevel, activities, deferred.length)
  };
}

function chooseActivities(
  priority: TrainingPriorityRecommendation,
  energyLevel: TrainingEnergyLevel,
  remainingMinutes: number
): PlannedActivityType[] {
  const activitySets: Record<TrainingEnergyLevel, PlannedActivityType[]> = {
    low: ['mechanism_review', 'binary_comparison', 'bank_return'],
    normal: ['mechanism_review', 'distractor_elimination', 'exam_scenario', 'bank_return'],
    high: ['mechanism_review', 'architecture_mapping', 'exam_scenario', 'bank_return']
  };
  const desired = activitySets[energyLevel];
  const selected: PlannedActivityType[] = [];
  let minutes = 0;

  for (const activity of desired) {
    const nextMinutes = minutes + ACTIVITY_MINUTES[activity];
    if (nextMinutes > remainingMinutes) {
      continue;
    }
    if (energyLevel === 'low' && isDemanding(activity) && selected.some(isDemanding)) {
      continue;
    }
    if (activity === 'bank_return' && priority.reasonCodes.includes('prerequisite_gap')) {
      continue;
    }
    selected.push(activity);
    minutes = nextMinutes;
  }

  return selected;
}

function defaultMaxTopics(energyLevel: TrainingEnergyLevel): number {
  if (energyLevel === 'low') {
    return PLANNING_LIMITS.lowEnergyMaxTopics;
  }
  if (energyLevel === 'high') {
    return PLANNING_LIMITS.highEnergyMaxTopics;
  }
  return PLANNING_LIMITS.normalEnergyMaxTopics;
}

function isDemanding(activity: PlannedActivityType): boolean {
  return activity === 'exam_scenario' || activity === 'architecture_mapping' || activity === 'bank_return';
}

function deferReasons(
  priority: TrainingPriorityRecommendation,
  availableMinutes: number,
  maxTopics: number
): PriorityReasonCode[] {
  const reasons: PriorityReasonCode[] = priority.reasonCodes.includes('overtraining_cap') ? ['overtraining_cap'] : ['coverage_gap'];
  if (availableMinutes < ACTIVITY_MINUTES.mechanism_review || maxTopics <= 1) {
    reasons.push('insufficient_evidence');
  }
  return reasons;
}

function planningReasons(
  energyLevel: TrainingEnergyLevel,
  activities: readonly { type: PlannedActivityType }[],
  deferredCount: number
): PriorityReasonCode[] {
  const reasons = new Set<PriorityReasonCode>();
  if (energyLevel === 'low') {
    reasons.add('recently_reinforced');
  }
  if (deferredCount > 0) {
    reasons.add('coverage_gap');
  }
  if (activities.some((activity) => activity.type === 'spaced_review')) {
    reasons.add('review_due');
  }
  return Array.from(reasons).sort();
}
