export const PRIORITY_ENGINE_VERSION = 'personalized-priority-engine-v3';
export const PLANNING_ENGINE_VERSION = 'personalized-session-planner-v3';

export const RELIABILITY_WEIGHTS = {
  high: 1,
  medium: 0.65,
  low: 0.25,
  excluded: 0
} as const;

export const PRIORITY_SCORING = {
  untestedTopic: 16,
  weakStatus: 18,
  developingStatus: 8,
  repeatedReliableError: 14,
  crossSessionError: 12,
  reliableError: 10,
  partialMultiSelect: 7,
  errorCausePattern: 8,
  highConfidenceWrong: 8,
  reviewDue: 14,
  prerequisiteGap: 6,
  coverageGap: 8,
  bankReturnFailure: 8,
  recentReinforcementReduction: -14,
  strongTopicCap: 18,
  overtrainingReduction: -16,
  lowReliabilityMultiplier: 0.5,
  knownIssueOnlyCap: 6
} as const;

// These windows keep Phase 3 deterministic while still modeling memory freshness.
export const PRIORITY_TIME_WINDOWS = {
  recentReinforcementDays: 7,
  recentSessionDays: 7,
  dueSoonDays: 2
} as const;

export const OVERTRAINING_LIMITS = {
  recentDominantTopicCount: 2,
  closeScoreRange: 8,
  persistentReliableErrorCount: 2
} as const;

export const ACTIVITY_MINUTES = {
  mechanism_review: 5,
  component_identification: 5,
  binary_comparison: 5,
  workflow_ordering: 7,
  architecture_mapping: 8,
  distractor_elimination: 5,
  exam_scenario: 10,
  bank_return: 8,
  spaced_review: 5
} as const;

export const PLANNING_LIMITS = {
  lowEnergyMaxTopics: 1,
  normalEnergyMaxTopics: 2,
  highEnergyMaxTopics: 3,
  lowEnergyMaxDemandingActivities: 1
} as const;
