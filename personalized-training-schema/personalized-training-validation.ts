import {
  Confidence,
  DrillSet,
  ErrorCause,
  PersonalizedTrainingManifest,
  SourceQuestionReference
} from '../models/personalized-training.models';

const ERROR_CAUSES: readonly ErrorCause[] = [
  'knowledge_gap',
  'service_confusion',
  'missed_keyword',
  'english_interpretation',
  'elimination_failure',
  'incorrect_assumption',
  'incomplete_multi_select',
  'wrong_resource_scope',
  'rushed_reading',
  'confidence_miscalibration'
];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isConfidence(value: unknown): value is Confidence {
  return value === null || value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function isErrorCause(value: unknown): value is ErrorCause {
  return typeof value === 'string' && ERROR_CAUSES.includes(value as ErrorCause);
}

export function isSourceQuestionReference(value: unknown): value is SourceQuestionReference {
  if (!isRecord(value)) {
    return false;
  }

  const keys = Object.keys(value);
  return (
    keys.length === 2 &&
    (value['bank'] === 'verified' || value['bank'] === 'public') &&
    Number.isInteger(value['questionId']) &&
    typeof value['questionId'] === 'number' &&
    value['questionId'] > 0
  );
}

export function isPersonalizedTrainingManifest(value: unknown): value is PersonalizedTrainingManifest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value['schemaVersion'] === '1.0' &&
    typeof value['contentVersion'] === 'string' &&
    typeof value['updatedAt'] === 'string' &&
    isStringArray(value['profileFiles']) &&
    isStringArray(value['topicFiles']) &&
    isStringArray(value['mapFiles']) &&
    isStringArray(value['drillFiles'])
  );
}

export function isDrillSet(value: unknown): value is DrillSet {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value['schemaVersion'] !== '1.0' ||
    typeof value['id'] !== 'string' ||
    typeof value['topicId'] !== 'string' ||
    typeof value['title'] !== 'string' ||
    typeof value['level'] !== 'string' ||
    typeof value['form'] !== 'string' ||
    !Array.isArray(value['questions']) ||
    !Array.isArray(value['sourceQuestions']) ||
    !value['sourceQuestions'].every(isSourceQuestionReference)
  ) {
    return false;
  }

  return value['questions'].every((question) => {
    if (!isRecord(question)) {
      return false;
    }

    return (
      typeof question['id'] === 'string' &&
      typeof question['type'] === 'string' &&
      typeof question['prompt'] === 'string' &&
      Array.isArray(question['options']) &&
      Array.isArray(question['correctOptionIds']) &&
      Array.isArray(question['sourceQuestions']) &&
      question['sourceQuestions'].every(isSourceQuestionReference)
    );
  });
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
