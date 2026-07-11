import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PersonalizedTrainingFacadeService } from './personalized-training-facade.service';
import {
  PERSONALIZED_TRAINING_STORAGE_KEY,
  PersonalizedTrainingStateService
} from './personalized-training-state.service';
import {
  bankReturn49Fixture,
  correctDraftFixture,
  drillPlanFixture,
  singleChoiceDrillFixture
} from '../testing/drill-engine.fixtures';
import { currentSchemaImportFixture } from '../testing/imported-session.fixtures';
import { missingConfidenceSession, priorityEngineNow } from '../testing/priority-engine.fixtures';
import { TrainingSessionPlan } from '../models/personalized-training.models';

describe('PersonalizedTrainingFacadeService', () => {
  let facade: PersonalizedTrainingFacadeService;
  let stateService: PersonalizedTrainingStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    facade = TestBed.inject(PersonalizedTrainingFacadeService);
    stateService = TestBed.inject(PersonalizedTrainingStateService);
    facade.initialize();
  });

  it('handles an empty dashboard without imported sessions', () => {
    expect(facade.uiState().mode).toBe('dashboard');
    expect(facade.importedSessions()).toEqual([]);
    expect(facade.actionablePriorityCount()).toBe(0);
  });

  it('previews JSON text without persistence, then explicit confirmation persists', () => {
    facade.previewImportText(JSON.stringify(currentSchemaImportFixture));

    expect(facade.uiState().mode).toBe('import_preview');
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toBeNull();

    facade.commitImport();

    expect(stateService.getImportedSessions().length).toBe(1);
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toContain('source:sim-session-current-1');
  });

  it('previews a file without persistence and canceling keeps storage empty', async () => {
    const file = new File([JSON.stringify(currentSchemaImportFixture)], 'sim.json', { type: 'application/json' });

    await facade.previewImportFile(file);

    expect(facade.uiState().importPreview?.session?.sourceFileName).toBe('sim.json');
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toBeNull();

    facade.cancelImport();

    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toBeNull();
  });

  it('shows invalid and duplicate imports as recoverable states', () => {
    facade.previewImportText('{bad json');
    expect(facade.uiState().mode).toBe('import_error');
    expect(facade.uiState().notice?.message).not.toContain('SyntaxError');

    facade.previewImportText(JSON.stringify(currentSchemaImportFixture));
    facade.commitImport();
    facade.previewImportText(JSON.stringify(currentSchemaImportFixture));

    expect(facade.uiState().importPreview?.status).toBe('duplicate');
  });

  it('labels import warnings as possible or unreliable, not as learner facts', () => {
    stateService.commitImportedSession(missingConfidenceSession);
    facade.generatePriorities(priorityEngineNow);

    expect(facade.reasonLabel('rushed_evidence_discounted')).toBe('Evidencia rapida descontada');
    expect(facade.uiState().notice?.message).not.toContain('low confidence');
  });

  it('generates priorities and a plan through the Phase 3 service within selected minutes', () => {
    facade.previewImportText(JSON.stringify(currentSchemaImportFixture));
    facade.commitImport();

    facade.generatePriorities(priorityEngineNow);
    facade.generatePlan(10, 'low', priorityEngineNow);

    expect(facade.uiState().prioritySnapshot?.priorityEngineVersion).toContain('priority');
    expect(facade.uiState().plan?.estimatedMinutes).toBeLessThanOrEqual(10);
    expect(facade.reasonLabels(['known_bank_issue_excluded', 'rushed_evidence_discounted'])).toContain('Evidencia conocida');
  });

  it('unresolved content creates a recoverable state without attempts or evidence', () => {
    stateService.saveTrainingSessionPlan(drillPlanFixture);
    facade.initialize();

    facade.startPlan([]);

    expect(facade.uiState().mode).toBe('content_unavailable');
    expect(stateService.getDrillAttempts()).toEqual([]);
    expect(stateService.getGeneratedEvidence()).toEqual([]);
  });

  it('uses pre-answer views and preserves reasoning with null confidence through submission', () => {
    const definition = {
      ...singleChoiceDrillFixture,
      activityType: 'distractor_elimination' as const,
      drillForm: 'distractor_elimination' as const
    };
    stateService.saveTrainingSessionPlan(drillPlanFixture);
    facade.initialize();
    facade.startPlan([definition]);

    const preAnswer = JSON.stringify(facade.uiState().currentActivityView);
    expect(preAnswer).not.toContain('correctOptionIds');
    expect(preAnswer).not.toContain('explanation');
    expect(preAnswer).not.toContain('decisiveKeywords');
    expect(preAnswer).not.toContain('wrong_resource_scope');
    expect(preAnswer).not.toContain('security_compliance');
    expect(facade.uiState().currentDraft.confidence).toBeNull();

    facade.submitCurrentActivity({
      ...correctDraftFixture,
      selectedAnswers: ['A'],
      confidence: null,
      reasoningSummary: null,
      identifiedKeywords: []
    });

    const attempt = stateService.getDrillAttempts()[0];
    expect(attempt.confidence).toBeNull();
    expect(attempt.reasoning.reasoningSummary).toBeNull();
    expect(facade.uiState().mode).toBe('activity_review');
  });

  it('pausing and resuming preserve drafts, and fatigue stop does not create negative evidence', () => {
    const definition = {
      ...singleChoiceDrillFixture,
      activityType: 'distractor_elimination' as const,
      drillForm: 'distractor_elimination' as const
    };
    stateService.saveTrainingSessionPlan(drillPlanFixture);
    facade.initialize();
    facade.startPlan([definition]);
    facade.saveDraft({ ...correctDraftFixture, uncertaintyNotes: 'Duda entre A y B', confidence: null });
    facade.pauseSession();
    facade.resumeActiveSession([definition]);

    expect(facade.uiState().currentDraft.uncertaintyNotes).toBe('Duda entre A y B');

    facade.stopSession('fatigue');

    expect(stateService.getDrillAttempts()).toEqual([]);
    expect(stateService.getGeneratedEvidence()).toEqual([]);
    expect(facade.uiState().summary?.stopReason).toBe('fatigue');
  });

  it('session summary distinguishes partial and unanswered submitted results', () => {
    const definition = {
      ...singleChoiceDrillFixture,
      activityType: 'distractor_elimination' as const,
      drillForm: 'distractor_elimination' as const
    };
    stateService.saveTrainingSessionPlan(oneActivityPlan('summary-plan'));
    facade.initialize();
    facade.startPlan([definition]);
    facade.submitCurrentActivity({ ...correctDraftFixture, selectedAnswers: [] });
    facade.completeSession();

    expect(facade.uiState().summary?.unanswered).toBe(1);
    expect(facade.uiState().summary?.partial).toBe(0);
  });

  it('bank-return attempts persist selected IDs and source refs without resolved text', () => {
    stateService.saveTrainingSessionPlan(bankPlan());
    facade.initialize();
    facade.startPlan([bankReturn49Fixture]);
    facade.submitCurrentActivity({ ...correctDraftFixture, selectedAnswers: ['A'] });

    const serialized = localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY) ?? '';
    expect(serialized).toContain('"questionId":49');
    expect(serialized).toContain('"selectedAnswers":["A"]');
    expect(serialized).not.toContain('Memory only prompt');
    expect(serialized).not.toContain('Memory only A');
  });

  it('uses only personalized-training storage for facade operations', () => {
    facade.previewImportText(JSON.stringify(currentSchemaImportFixture));
    facade.commitImport();

    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem('dop-c02-runtime-state-v1')).toBeNull();
    expect(localStorage.getItem('dop-c02-simulator-session-history-v1')).toBeNull();
  });
});

function oneActivityPlan(id: string): TrainingSessionPlan {
  return {
    ...drillPlanFixture,
    planId: id,
    plannedActivities: [drillPlanFixture.plannedActivities[0]],
    estimatedMinutes: drillPlanFixture.plannedActivities[0].estimatedMinutes
  };
}

function bankPlan(): TrainingSessionPlan {
  return {
    ...drillPlanFixture,
    planId: 'bank-plan',
    plannedActivities: [
      {
        activityId: 'bank-49',
        topicId: bankReturn49Fixture.topicId,
        type: 'bank_return',
        estimatedMinutes: 5,
        reasonCodes: ['bank_return_failure']
      }
    ],
    estimatedMinutes: 5
  };
}
