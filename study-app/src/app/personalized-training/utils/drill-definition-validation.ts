import {
  DrillActivityType,
  DrillDefinition,
  DrillValidationCode,
  DrillValidationFailure,
  DrillValidationResult,
  PlannedActivityType
} from '../models/personalized-training.models';

const SUPPORTED_ACTIVITY_TYPES: readonly DrillActivityType[] = [
  'component_identification',
  'mechanism_review',
  'binary_comparison',
  'workflow_ordering',
  'architecture_mapping',
  'distractor_elimination',
  'exam_scenario',
  'bank_return',
  'spaced_review'
];

export function validateDrillDefinition(definition: Readonly<DrillDefinition>): DrillValidationResult {
  const failures: DrillValidationFailure[] = [];
  addIf(failures, !definition.drillId, 'missing_drill_id', 'Drill ID is required.');
  addIf(failures, !definition.topicId, 'missing_topic_id', 'Topic ID is required.');
  addIf(
    failures,
    !SUPPORTED_ACTIVITY_TYPES.includes(definition.activityType as PlannedActivityType),
    'unsupported_activity_type',
    'Activity type is not supported.'
  );
  addIf(failures, definition.estimatedMinutes <= 0, 'invalid_estimated_minutes', 'Estimated minutes must be positive.');
  addIf(failures, !['intro', 'practice', 'exam_like'].includes(definition.difficulty), 'invalid_difficulty', 'Difficulty is invalid.');
  addIf(failures, !['es', 'en'].includes(definition.reviewLanguage), 'unsupported_review_language', 'Review language is unsupported.');
  addIf(failures, definition.explanation.concise.trim().length === 0, 'missing_explanation', 'Explanation is required.');

  const optionIds = definition.answerOptions.map((option) => option.id);
  addIf(failures, new Set(optionIds).size !== optionIds.length, 'duplicate_option_ids', 'Answer option IDs must be unique.');
  const expectedOptionIds = definition.expectedAnswer.optionIds ?? [];
  addIf(
    failures,
    definition.activityType !== 'bank_return' && expectedOptionIds.some((id) => !optionIds.includes(id)),
    'expected_option_not_present',
    'Expected answer references an option that is not present.'
  );

  if (requiresExpectedOptions(definition) && expectedOptionIds.length === 0) {
    add(failures, 'invalid_expected_answer', 'Scored option drill requires expected option IDs.');
  }

  const workflowIds = definition.workflowItems.map((item) => item.id);
  addIf(failures, new Set(workflowIds).size !== workflowIds.length, 'duplicate_workflow_ids', 'Workflow IDs must be unique.');
  if (definition.activityType === 'workflow_ordering') {
    const expected = definition.expectedAnswer.workflowOrder ?? [];
    addIf(
      failures,
      expected.length !== workflowIds.length || expected.some((id) => !workflowIds.includes(id)),
      'invalid_workflow_sequence',
      'Expected workflow order must include the configured workflow IDs.'
    );
  }

  if (definition.activityType === 'architecture_mapping') {
    const mappingKeys = Object.keys(definition.expectedAnswer.mappings ?? {});
    const mappingIds = definition.mappingItems.map((item) => item.id);
    addIf(
      failures,
      mappingKeys.some((id) => !mappingIds.includes(id)),
      'invalid_mapping_ids',
      'Expected mapping references an unknown mapping ID.'
    );
  }

  if (definition.activityType === 'bank_return') {
    addIf(
      failures,
      definition.sourceQuestionRefs.length === 0,
      'bank_return_missing_source_reference',
      'Bank return requires a source question reference.'
    );
    addIf(
      failures,
      definition.prompt.trim().length > 0 || definition.answerOptions.length > 0,
      'bank_return_contains_copied_content',
      'Bank return definitions must not contain copied prompt or answer option text.'
    );
  }

  return { valid: failures.length === 0, failures };
}

function requiresExpectedOptions(definition: Readonly<DrillDefinition>): boolean {
  return (
    definition.activityType === 'component_identification' ||
    definition.activityType === 'binary_comparison' ||
    definition.activityType === 'distractor_elimination' ||
    definition.activityType === 'exam_scenario' ||
    definition.activityType === 'bank_return'
  );
}

function addIf(
  failures: DrillValidationFailure[],
  condition: boolean,
  code: DrillValidationCode,
  message: string,
  details?: Record<string, unknown>
): void {
  if (condition) {
    add(failures, code, message, details);
  }
}

function add(
  failures: DrillValidationFailure[],
  code: DrillValidationCode,
  message: string,
  details?: Record<string, unknown>
): void {
  failures.push({ code, message, ...(details ? { details } : {}) });
}
