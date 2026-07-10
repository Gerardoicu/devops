import {
  correctDraftFixture,
  drillNow,
  singleChoiceDrillFixture
} from '../testing/drill-engine.fixtures';
import { evaluateDrillAttempt } from './drill-attempt-evaluation';
import { applyRootCauseAnalysis } from './drill-root-cause-analysis';
import { convertAttemptToEvidence, createDrillReviewView } from './drill-evidence-conversion';
import { PersonalizedDrillAttempt } from '../models/personalized-training.models';

describe('drill evidence conversion', () => {
  it('converts submitted attempts into Phase 3-compatible evidence without mastery changes', () => {
    const attempt = attemptFixture();
    const evidence = convertAttemptToEvidence(attempt);

    expect(evidence.topicId).toBe(singleChoiceDrillFixture.topicId);
    expect(evidence.observedResult).toBe('correct');
    expect(JSON.stringify(evidence)).not.toContain('status');
  });

  it('creates a concise post-answer review', () => {
    const review = createDrillReviewView(attemptFixture());

    expect(review.result).toBe('correct');
    expect(review.correctAnswerIds).toEqual(['A']);
    expect(review.testedExamPattern).toBe('component_identification');
  });
});

function attemptFixture(): PersonalizedDrillAttempt {
  const assessment = applyRootCauseAnalysis(
    singleChoiceDrillFixture,
    correctDraftFixture,
    evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft: correctDraftFixture })
  );
  return {
    attemptId: 'attempt-1',
    runtimeSessionId: 'runtime-1',
    activityId: 'activity-1',
    drillId: singleChoiceDrillFixture.drillId,
    topicId: singleChoiceDrillFixture.topicId,
    domainId: singleChoiceDrillFixture.domainId,
    activityType: singleChoiceDrillFixture.activityType,
    drillForm: singleChoiceDrillFixture.drillForm,
    difficulty: singleChoiceDrillFixture.difficulty,
    sourceQuestionRefs: [],
    selectedAnswers: ['A'],
    orderedItems: [],
    mappingSelections: {},
    confidence: 4,
    reasoning: correctDraftFixture,
    submittedAt: drillNow.toISOString(),
    responseTimeSeconds: 30,
    activeTimeSeconds: 28,
    assessment,
    drillEngineVersion: 'test',
    runtimeEngineVersion: 'test'
  };
}
