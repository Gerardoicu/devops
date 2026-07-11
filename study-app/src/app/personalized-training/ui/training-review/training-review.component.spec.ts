import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TrainingReviewComponent } from './training-review.component';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';
import { PersonalizedTrainingStateService } from '../../services/personalized-training-state.service';
import { bankReturn49Fixture, correctDraftFixture } from '../../testing/drill-engine.fixtures';
import { TrainingSessionPlan } from '../../models/personalized-training.models';

describe('TrainingReviewComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TrainingReviewComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('appears only after submission and shows known bank warning when present', () => {
    const state = TestBed.inject(PersonalizedTrainingStateService);
    const facade = TestBed.inject(PersonalizedTrainingFacadeService);
    state.saveTrainingSessionPlan(bankPlan());
    facade.initialize();
    facade.startPlan([bankReturn49Fixture]);

    let fixture = TestBed.createComponent(TrainingReviewComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');

    facade.submitCurrentActivity({ ...correctDraftFixture, selectedAnswers: ['A'] });
    fixture = TestBed.createComponent(TrainingReviewComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Resultado');
    expect(text).toContain('Known source-bank inconsistency');
  });

  it('does not display an ungrounded root cause as fact', () => {
    const fixture = TestBed.createComponent(TrainingReviewComponent);
    const component = fixture.componentInstance;

    expect(component.mappingEntries({ source: 'target' })).toEqual([{ key: 'source', value: 'target' }]);
  });
});

function bankPlan(): TrainingSessionPlan {
  return {
    planId: 'bank-review-plan',
    generatedAt: '2026-07-10T12:00:00.000Z',
    planningEngineVersion: 'test',
    priorityEngineVersion: 'test',
    availableMinutes: 5,
    energyLevel: 'low',
    primaryObjective: bankReturn49Fixture.topicId,
    selectedTopics: [],
    plannedActivities: [
      {
        activityId: 'bank-49',
        topicId: bankReturn49Fixture.topicId,
        type: 'bank_return',
        estimatedMinutes: 5,
        reasonCodes: ['bank_return_failure']
      }
    ],
    estimatedMinutes: 5,
    deferredPriorities: [],
    planningReasonCodes: []
  };
}
