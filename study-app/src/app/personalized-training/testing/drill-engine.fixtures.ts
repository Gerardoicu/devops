import {
  BankQuestionResolver,
  DrillDefinition,
  DrillAttemptDraft,
  ResolvedBankQuestion,
  TrainingSessionPlan
} from '../models/personalized-training.models';
import { DRILL_DEFINITION_SCHEMA_VERSION } from '../config/drill-engine.config';
import { PLANNING_ENGINE_VERSION, PRIORITY_ENGINE_VERSION } from '../config/priority-engine.config';

export const drillNow = new Date('2026-07-10T12:00:00.000Z');

export const singleChoiceDrillFixture: DrillDefinition = baseDrill('drill-single', 'component_identification', {
  optionIds: ['A']
});

export const multiSelectDrillFixture: DrillDefinition = {
  ...baseDrill('drill-multi', 'distractor_elimination', { optionIds: ['A', 'C'] }),
  answerOptions: [
    { id: 'A', label: 'Choice A' },
    { id: 'B', label: 'Choice B' },
    { id: 'C', label: 'Choice C' }
  ]
};

export const workflowDrillFixture: DrillDefinition = {
  ...baseDrill('drill-workflow', 'workflow_ordering', { workflowOrder: ['one', 'two', 'three'], equivalentWorkflowOrders: [['one', 'three', 'two']] }),
  workflowItems: [
    { id: 'one', label: 'One' },
    { id: 'two', label: 'Two' },
    { id: 'three', label: 'Three' }
  ],
  evaluationRules: { allowPartialCredit: true, partialMappingCredit: false }
};

export const mappingDrillFixture: DrillDefinition = {
  ...baseDrill('drill-mapping', 'architecture_mapping', { mappings: { source: 'target' } }),
  mappingItems: [
    { id: 'source', label: 'Source' },
    { id: 'target', label: 'Target' }
  ],
  evaluationRules: { allowPartialCredit: false, partialMappingCredit: true }
};

export const mechanismReviewFixture: DrillDefinition = baseDrill('drill-mechanism', 'mechanism_review', {});
export const spacedReviewFixture: DrillDefinition = baseDrill('drill-spaced', 'spaced_review', {});

export const bankReturn36Fixture: DrillDefinition = bankDrill(36);
export const bankReturn49Fixture: DrillDefinition = bankDrill(49);
export const bankReturn71Fixture: DrillDefinition = bankDrill(71);

export const copiedBankReturnFixture: DrillDefinition = {
  ...bankReturn49Fixture,
  prompt: 'Copied bank prompt text',
  answerOptions: [{ id: 'A', label: 'Copied option text' }]
};

export const drillPlanFixture: TrainingSessionPlan = {
  planId: 'plan-phase-4',
  generatedAt: drillNow.toISOString(),
  planningEngineVersion: PLANNING_ENGINE_VERSION,
  priorityEngineVersion: PRIORITY_ENGINE_VERSION,
  availableMinutes: 15,
  energyLevel: 'low',
  primaryObjective: 'topic-cross-account',
  selectedTopics: [],
  plannedActivities: [
    {
      activityId: 'activity-single',
      topicId: 'topic-cross-account',
      type: 'distractor_elimination',
      estimatedMinutes: 5,
      reasonCodes: ['weak_topic']
    },
    {
      activityId: 'activity-review',
      topicId: 'topic-cross-account',
      type: 'mechanism_review',
      estimatedMinutes: 5,
      reasonCodes: ['review_due']
    }
  ],
  estimatedMinutes: 10,
  deferredPriorities: [],
  planningReasonCodes: []
};

export const correctDraftFixture: DrillAttemptDraft = {
  identifiedKeywords: ['must'],
  eliminatedOptions: ['B'],
  eliminationReasons: { B: 'Not enough scope' },
  uncertaintyNotes: null,
  reasoningSummary: 'A matches the mechanism.',
  selectedAnswers: ['A'],
  orderedItems: [],
  mappingSelections: {},
  confidence: 4,
  responseTimeSeconds: 30,
  activeTimeSeconds: 28
};

export const fakeBankResolver: BankQuestionResolver = {
  resolve(reference): Readonly<ResolvedBankQuestion> | null {
    return {
      reference,
      prompt: `Memory only prompt ${reference.questionId}`,
      answerOptions: [
        { id: 'A', label: 'Memory only A' },
        { id: 'B', label: 'Memory only B' }
      ],
      correctOptionIds: ['A'],
      knownIssue: reference.questionId === 36 || reference.questionId === 49 || reference.questionId === 71
    };
  }
};

function baseDrill(
  drillId: string,
  activityType: DrillDefinition['activityType'],
  expectedAnswer: DrillDefinition['expectedAnswer']
): DrillDefinition {
  return {
    drillId,
    version: DRILL_DEFINITION_SCHEMA_VERSION,
    topicId: 'topic-cross-account',
    domainId: 'security_compliance',
    activityType,
    drillForm: activityType,
    title: 'Fixture drill',
    difficulty: 'practice',
    estimatedMinutes: 5,
    promptLanguage: 'en',
    reviewLanguage: 'es',
    instructions: 'Choose the best answer.',
    prompt: 'Neutral fixture prompt',
    answerOptions: [
      { id: 'A', label: 'Choice A' },
      { id: 'B', label: 'Choice B' }
    ],
    workflowItems: [],
    mappingItems: [],
    expectedAnswer,
    evaluationRules: { allowPartialCredit: false, partialMappingCredit: false },
    decisiveKeywords: ['must'],
    distractorMetadata: [
      { optionId: 'B', errorCause: 'wrong_resource_scope', attraction: 'Looks scoped', failure: 'Wrong scope' }
    ],
    explanation: {
      concise: 'Configured concise explanation.',
      testedPattern: 'Fixture exam pattern',
      correctChoiceWins: 'A wins by configuration.',
      distractorReview: [
        { optionId: 'B', errorCause: 'wrong_resource_scope', attraction: 'Looks scoped', failure: 'Wrong scope' }
      ]
    },
    sourceQuestionRefs: [],
    prerequisiteTopicIds: [],
    tags: [],
    active: true
  };
}

function bankDrill(questionId: number): DrillDefinition {
  return {
    ...baseDrill(`bank-${questionId}`, 'bank_return', { optionIds: ['A'] }),
    prompt: '',
    answerOptions: [],
    sourceQuestionRefs: [{ bank: 'verified', questionId }]
  };
}
