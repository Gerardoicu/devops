import { TestBed } from '@angular/core/testing';
import { PersonalizedTrainingDrillService } from './personalized-training-drill.service';
import {
  bankReturn49Fixture,
  correctDraftFixture,
  drillNow,
  fakeBankResolver,
  singleChoiceDrillFixture
} from '../testing/drill-engine.fixtures';

describe('PersonalizedTrainingDrillService', () => {
  let service: PersonalizedTrainingDrillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalizedTrainingDrillService);
  });

  it('submits a single-choice attempt and preserves reasoning fields', () => {
    const result = service.submitAttempt({
      runtimeSessionId: 'runtime-1',
      activityId: 'activity-1',
      definition: singleChoiceDrillFixture,
      draft: correctDraftFixture,
      submittedAt: drillNow.toISOString()
    });

    expect(result.attempt.assessment.result).toBe('correct');
    expect(result.attempt.reasoning.reasoningSummary).toBe('A matches the mechanism.');
    expect(result.review.result).toBe('correct');
  });

  it('bank-return persistence stores only source references and selected IDs', () => {
    const result = service.submitAttempt({
      runtimeSessionId: 'runtime-1',
      activityId: 'activity-bank',
      definition: bankReturn49Fixture,
      draft: correctDraftFixture,
      submittedAt: drillNow.toISOString(),
      bankResolver: fakeBankResolver
    });
    const serialized = JSON.stringify(result.attempt);

    expect(result.attempt.sourceQuestionRefs).toEqual([{ bank: 'verified', questionId: 49 }]);
    expect(result.attempt.selectedAnswers).toEqual(['A']);
    expect(serialized).not.toContain('Memory only prompt');
    expect(serialized).not.toContain('Memory only A');
    expect(result.attempt.assessment.reliability).toBe('excluded');
  });
});
