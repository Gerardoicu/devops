import {
  DrillAttempt,
  DrillSet,
  PersonalizedSession,
  SourceQuestionReference,
  TopicMastery
} from '../models/personalized-training.models';

export const sourceQuestionReferenceFixture: SourceQuestionReference = {
  bank: 'verified',
  questionId: 36
};

export const drillSetFixture: DrillSet = {
  id: 'drill-empty-foundation',
  schemaVersion: '1.0',
  topicId: 'topic-foundation',
  title: 'Foundation drill fixture',
  level: 'intro',
  form: 'component_identification',
  sourceQuestions: [sourceQuestionReferenceFixture],
  questions: [
    {
      id: 'drill-question-1',
      type: 'single',
      prompt: 'Fixture prompt',
      options: [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' }
      ],
      correctOptionIds: ['A'],
      explanation: {
        correct: 'Fixture explanation',
        traps: [],
        sourceQuestions: [sourceQuestionReferenceFixture]
      },
      sourceQuestions: [sourceQuestionReferenceFixture]
    }
  ]
};

export const drillAttemptFixture: DrillAttempt = {
  id: 'attempt-1',
  drillSetId: 'drill-empty-foundation',
  questionId: 'drill-question-1',
  selectedOptionIds: ['A'],
  result: 'correct',
  confidence: 4,
  errorCauses: [],
  responseTimeSeconds: 12,
  attemptedAt: '2026-07-10T00:00:00.000Z'
};

export const personalizedSessionFixture: PersonalizedSession = {
  id: 'session-1',
  startedAt: '2026-07-10T00:00:00.000Z',
  completedAt: '2026-07-10T00:05:00.000Z',
  goal: 'close_weak_areas',
  steps: [
    {
      id: 'step-1',
      kind: 'drill',
      targetId: 'drill-empty-foundation',
      result: 'completed'
    }
  ],
  result: {
    completedSteps: 1,
    drillAttempts: 1,
    errorCauses: [],
    nextReviewTopics: ['topic-foundation']
  }
};

export const weakTopicMasteryFixture: TopicMastery = {
  topicId: 'topic-foundation',
  attempts: 3,
  correctAttempts: 0,
  partialAttempts: 0,
  consecutiveCorrect: 0,
  highestCompletedDrillLevel: null,
  lastConfidence: 2,
  recentErrorCauses: ['knowledge_gap'],
  bankReturnSuccess: null,
  lastReviewedAt: '2026-07-09T00:00:00.000Z',
  nextReviewAt: '2026-07-10T00:00:00.000Z',
  status: 'weak'
};
