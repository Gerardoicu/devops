import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TrainingSessionSummaryComponent } from './training-session-summary.component';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';
import { PersonalizedTrainingStateService } from '../../services/personalized-training-state.service';
import { correctDraftFixture, drillPlanFixture, singleChoiceDrillFixture } from '../../testing/drill-engine.fixtures';

describe('TrainingSessionSummaryComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TrainingSessionSummaryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('renders submitted result counts without readiness claims', () => {
    const state = TestBed.inject(PersonalizedTrainingStateService);
    const facade = TestBed.inject(PersonalizedTrainingFacadeService);
    const definition = {
      ...singleChoiceDrillFixture,
      activityType: 'distractor_elimination' as const,
      drillForm: 'distractor_elimination' as const
    };
    state.saveTrainingSessionPlan({
      ...drillPlanFixture,
      plannedActivities: [drillPlanFixture.plannedActivities[0]],
      estimatedMinutes: 5
    });
    facade.initialize();
    facade.startPlan([definition]);
    facade.submitCurrentActivity({ ...correctDraftFixture, selectedAnswers: [] });
    facade.completeSession();

    const fixture = TestBed.createComponent(TrainingSessionSummaryComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Sin responder');
    expect(text).toContain('1');
    expect(text).not.toContain('readiness');
    expect(text).not.toContain('listo');
  });
});
