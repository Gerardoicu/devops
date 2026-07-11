import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TrainingSessionComponent } from './training-session.component';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';
import { PersonalizedTrainingStateService } from '../../services/personalized-training-state.service';
import { drillPlanFixture, singleChoiceDrillFixture } from '../../testing/drill-engine.fixtures';

describe('TrainingSessionComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TrainingSessionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('renders only the pre-answer view and keeps confidence unset', () => {
    const state = TestBed.inject(PersonalizedTrainingStateService);
    const facade = TestBed.inject(PersonalizedTrainingFacadeService);
    const definition = {
      ...singleChoiceDrillFixture,
      activityType: 'distractor_elimination' as const,
      drillForm: 'distractor_elimination' as const
    };
    state.saveTrainingSessionPlan(drillPlanFixture);
    facade.initialize();
    facade.startPlan([definition]);

    const fixture = TestBed.createComponent(TrainingSessionComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Neutral fixture prompt');
    expect(text).not.toContain('Configured concise explanation');
    expect(text).not.toContain('wrong_resource_scope');
    expect(text).toContain('Sin seleccionar');
    expect(facade.uiState().currentDraft.confidence).toBeNull();
  });

  it('multi-select toggles without automatic submission and incomplete answers can submit', () => {
    const state = TestBed.inject(PersonalizedTrainingStateService);
    const facade = TestBed.inject(PersonalizedTrainingFacadeService);
    const definition = {
      ...singleChoiceDrillFixture,
      activityType: 'distractor_elimination' as const,
      drillForm: 'distractor_elimination' as const,
      answerOptions: [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
        { id: 'C', label: 'C' }
      ],
      expectedAnswer: { optionIds: ['A', 'C'] }
    };
    state.saveTrainingSessionPlan(drillPlanFixture);
    facade.initialize();
    facade.startPlan([definition]);
    const fixture = TestBed.createComponent(TrainingSessionComponent);
    fixture.detectChanges();

    fixture.componentInstance.toggleOption({ id: 'A', label: 'A' }, true);

    expect(facade.uiState().mode).toBe('session_active');

    fixture.componentInstance.submit();

    expect(facade.uiState().mode).toBe('activity_review');
    expect(state.getDrillAttempts()[0].assessment.result).toBe('partial');
  });
});
