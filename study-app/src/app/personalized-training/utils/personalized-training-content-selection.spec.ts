import { PersonalizedDrillAttempt, TrainingSessionPlan } from '../models/personalized-training.models';
import { correctDraftFixture, drillPlanFixture, singleChoiceDrillFixture } from '../testing/drill-engine.fixtures';
import { evaluateDrillAttempt } from './drill-attempt-evaluation';
import { resolveTrainingPlanContent } from './personalized-training-content-selection';

describe('personalized training content selection', () => {
  it('resolves plan activities deterministically by topic, activity, active status, and stable ID', () => {
    const plan = oneActivityPlan('topic-cross-account', 'distractor_elimination');
    const drills = [
      drill('drill-b', 'topic-cross-account', 'distractor_elimination'),
      drill('drill-a', 'topic-cross-account', 'distractor_elimination'),
      { ...drill('drill-inactive', 'topic-cross-account', 'distractor_elimination'), active: false }
    ];

    const result = resolveTrainingPlanContent({ plan, drills });

    expect(result.selectedDrillIds).toEqual(['drill-a']);
    expect(result.unresolvedActivities).toEqual([]);
  });

  it('avoids immediate recent repetition when an alternative exists', () => {
    const plan = oneActivityPlan('topic-cross-account', 'distractor_elimination');
    const recent = attemptFor('drill-a');
    const result = resolveTrainingPlanContent({
      plan,
      drills: [
        drill('drill-a', 'topic-cross-account', 'distractor_elimination'),
        drill('drill-b', 'topic-cross-account', 'distractor_elimination')
      ],
      recentAttempts: [recent]
    });

    expect(result.selectedDrillIds).toEqual(['drill-b']);
    expect(result.resolvedActivities[0].reasonCodes).toContain('avoided_recent_repetition');
  });

  it('reuses a drill for persistent review when no alternative exists', () => {
    const plan = oneActivityPlan('topic-cross-account', 'distractor_elimination');
    const result = resolveTrainingPlanContent({
      plan,
      drills: [drill('drill-a', 'topic-cross-account', 'distractor_elimination')],
      recentAttempts: [attemptFor('drill-a')]
    });

    expect(result.selectedDrillIds).toEqual(['drill-a']);
    expect(result.resolvedActivities[0].reasonCodes).toContain('selected_reused_persistent_review');
  });

  it('marks missing content unresolved without fabricating a drill', () => {
    const plan = oneActivityPlan('topic-cross-account', 'distractor_elimination');
    const result = resolveTrainingPlanContent({ plan, drills: [] });

    expect(result.resolvedActivities).toEqual([]);
    expect(result.unresolvedActivities[0].reasonCodes).toContain('unresolved_no_active_drill');
  });

  it('selects a deterministic same-topic fallback when the requested activity type is unavailable', () => {
    const plan = oneActivityPlan('topic-cross-account', 'exam_scenario');
    const result = resolveTrainingPlanContent({
      plan,
      drills: [
        drill('drill-z', 'topic-cross-account', 'mechanism_review'),
        drill('drill-a', 'topic-cross-account', 'mechanism_review')
      ],
      energyLevel: 'low'
    });

    expect(result.selectedDrillIds).toEqual(['drill-a']);
    expect(result.resolvedActivities[0].activity.type).toBe('mechanism_review');
    expect(result.resolvedActivities[0].reasonCodes).toContain('selected_activity_type_fallback');
  });

  it('does not use demanding fallback content for low energy', () => {
    const plan = oneActivityPlan('topic-cross-account', 'workflow_ordering');
    const result = resolveTrainingPlanContent({
      plan,
      drills: [drill('drill-exam', 'topic-cross-account', 'exam_scenario')],
      energyLevel: 'low'
    });

    expect(result.resolvedActivities).toEqual([]);
    expect(result.unresolvedActivities[0].reasonCodes).toContain('unresolved_no_active_drill');
  });

  it('respects the available time budget during fallback', () => {
    const plan = { ...oneActivityPlan('topic-cross-account', 'workflow_ordering'), availableMinutes: 5 };
    const result = resolveTrainingPlanContent({
      plan,
      drills: [{ ...drill('drill-map', 'topic-cross-account', 'architecture_mapping'), estimatedMinutes: 8 }],
      energyLevel: 'normal'
    });

    expect(result.resolvedActivities).toEqual([]);
    expect(result.unresolvedActivities[0].reasonCodes).toContain('unresolved_time_budget');
  });
});

function oneActivityPlan(topicId: string, type: TrainingSessionPlan['plannedActivities'][number]['type']): TrainingSessionPlan {
  return {
    ...drillPlanFixture,
    selectedTopics: [{ topicId, domainId: 'security_compliance', rank: 1, plannedMinutes: 5, reasonCodes: ['weak_topic'] }],
    plannedActivities: [{ activityId: `${topicId}:${type}:0`, topicId, type, estimatedMinutes: 5, reasonCodes: ['weak_topic'] }],
    estimatedMinutes: 5
  };
}

function drill(drillId: string, topicId: string, activityType: TrainingSessionPlan['plannedActivities'][number]['type']) {
  return {
    ...singleChoiceDrillFixture,
    drillId,
    topicId,
    activityType,
    drillForm: activityType === 'spaced_review' ? 'spaced_review' as const : activityType === 'mechanism_review' ? 'mechanism_review' as const : 'distractor_elimination' as const,
    active: true
  };
}

function attemptFor(drillId: string): PersonalizedDrillAttempt {
  return {
    attemptId: `attempt:${drillId}`,
    runtimeSessionId: 'runtime',
    activityId: 'activity',
    drillId,
    topicId: 'topic-cross-account',
    domainId: 'security_compliance',
    activityType: 'distractor_elimination',
    drillForm: 'distractor_elimination',
    difficulty: 'practice',
    sourceQuestionRefs: [],
    selectedAnswers: ['A'],
    orderedItems: [],
    mappingSelections: {},
    confidence: null,
    reasoning: correctDraftFixture,
    submittedAt: '2026-07-10T12:00:00.000Z',
    responseTimeSeconds: null,
    activeTimeSeconds: null,
    assessment: evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft: correctDraftFixture }),
    drillEngineVersion: 'test',
    runtimeEngineVersion: 'test'
  };
}
