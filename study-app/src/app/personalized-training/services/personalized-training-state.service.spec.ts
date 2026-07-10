import { TestBed } from '@angular/core/testing';
import {
  PERSONALIZED_TRAINING_STORAGE_KEY,
  PersonalizedTrainingStateService
} from './personalized-training-state.service';
import {
  drillAttemptFixture,
  personalizedSessionFixture,
  weakTopicMasteryFixture
} from '../testing/personalized-training.fixtures';
import { currentSchemaImportFixture } from '../testing/imported-session.fixtures';
import { priorityEngineNow, topicDescriptorsFixture } from '../testing/priority-engine.fixtures';
import { correctDraftFixture, singleChoiceDrillFixture } from '../testing/drill-engine.fixtures';
import { normalizeImportedExamSession } from '../utils/exam-session-normalization';
import { DOP_C02_BLUEPRINT_VERSION } from '../config/dop-c02-blueprint';
import { PLANNING_ENGINE_VERSION, PRIORITY_ENGINE_VERSION } from '../config/priority-engine.config';
import { evaluateDrillAttempt } from '../utils/drill-attempt-evaluation';

describe('PersonalizedTrainingStateService', () => {
  let service: PersonalizedTrainingStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalizedTrainingStateService);
  });

  it('initializes an empty state', () => {
    const state = service.loadState();

    expect(state.schemaVersion).toBe('1.0');
    expect(state.drillAttempts).toEqual([]);
    expect(state.sessions).toEqual([]);
    expect(state.topicMastery).toEqual({});
  });

  it('saves and reloads state', () => {
    const state = service.createEmptyState();
    const next = {
      ...state,
      sessions: [personalizedSessionFixture]
    };

    service.saveState(next);

    expect(service.loadState().sessions).toEqual([personalizedSessionFixture]);
  });

  it('falls back safely when localStorage contains malformed data', () => {
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, '{not-json');

    expect(service.loadState().schemaVersion).toBe('1.0');
    expect(service.loadState().sessions).toEqual([]);
  });

  it('records a drill attempt without writing simulator keys', () => {
    service.recordDrillAttempt(drillAttemptFixture);

    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toContain('attempt-1');
    expect(localStorage.getItem('dop-c02-runtime-state-v1')).toBeNull();
    expect(localStorage.getItem('dop-c02-simulator-session-history-v1')).toBeNull();
  });

  it('records a personalized session', () => {
    service.recordPersonalizedSession(personalizedSessionFixture);

    expect(service.loadState().sessions[0]?.id).toBe('session-1');
  });

  it('commits and finds imported sessions', () => {
    const normalized = normalizeImportedExamSession(currentSchemaImportFixture).session;
    expect(normalized).not.toBeNull();

    service.commitImportedSession(normalized!);

    expect(service.hasImportedSession('source:sim-session-current-1')).toBe(true);
    expect(service.findImportedSession('source:sim-session-current-1')?.totalRecords).toBe(3);
  });

  it('does not persist the same imported session twice', () => {
    const normalized = normalizeImportedExamSession(currentSchemaImportFixture).session;
    expect(normalized).not.toBeNull();

    service.commitImportedSession(normalized!);
    service.commitImportedSession(normalized!);

    expect(service.getImportedSessions().length).toBe(1);
  });

  it('removing an import leaves drill attempts untouched', () => {
    const normalized = normalizeImportedExamSession(currentSchemaImportFixture).session;
    expect(normalized).not.toBeNull();
    service.recordDrillAttempt(drillAttemptFixture);
    service.commitImportedSession(normalized!);

    service.removeImportedSession(normalized!.id);

    const state = service.loadState();
    expect(state.importedExamSessions).toEqual([]);
    expect(state.drillAttempts).toEqual([drillAttemptFixture]);
  });

  it('saves generated priority snapshots and plans separately from imported sessions and drill attempts', () => {
    const snapshot = {
      snapshotId: 'snapshot-1',
      generatedAt: priorityEngineNow.toISOString(),
      priorityEngineVersion: PRIORITY_ENGINE_VERSION,
      blueprintVersion: DOP_C02_BLUEPRINT_VERSION,
      evidenceCount: 0,
      priorities: []
    };
    const plan = {
      planId: 'plan-1',
      generatedAt: priorityEngineNow.toISOString(),
      planningEngineVersion: PLANNING_ENGINE_VERSION,
      priorityEngineVersion: PRIORITY_ENGINE_VERSION,
      availableMinutes: 5,
      energyLevel: 'low' as const,
      primaryObjective: topicDescriptorsFixture[0].topicId,
      selectedTopics: [],
      plannedActivities: [],
      estimatedMinutes: 0,
      deferredPriorities: [],
      planningReasonCodes: []
    };
    const imported = normalizeImportedExamSession(currentSchemaImportFixture).session;
    expect(imported).not.toBeNull();
    service.recordDrillAttempt(drillAttemptFixture);
    service.commitImportedSession(imported!);

    service.savePrioritySnapshot(snapshot);
    service.saveTrainingSessionPlan(plan);
    service.clearGeneratedPlans();

    const state = service.loadState();
    expect(state.latestPrioritySnapshot?.snapshotId).toBe('snapshot-1');
    expect(state.latestTrainingSessionPlan).toBeNull();
    expect(state.trainingSessionPlanHistory).toEqual([]);
    expect(state.importedExamSessions.length).toBe(1);
    expect(state.drillAttempts).toEqual([drillAttemptFixture]);
  });

  it('clearing generated plans and removing imports preserve personalized attempts', () => {
    const assessment = evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft: correctDraftFixture });
    const imported = normalizeImportedExamSession(currentSchemaImportFixture).session;
    expect(imported).not.toBeNull();
    service.commitImportedSession(imported!);
    service.appendDrillAttempt({
      attemptId: 'personalized-attempt-1',
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
      submittedAt: priorityEngineNow.toISOString(),
      responseTimeSeconds: 30,
      activeTimeSeconds: 28,
      assessment,
      drillEngineVersion: 'test',
      runtimeEngineVersion: 'test'
    });

    service.clearGeneratedPlans();
    service.removeImportedSession(imported!.id);

    expect(service.getDrillAttempts().length).toBe(1);
    expect(service.getImportedSessions()).toEqual([]);
  });

  it('returns review-due topics', () => {
    const state = service.createEmptyState();
    service.saveState({
      ...state,
      topicMastery: {
        [weakTopicMasteryFixture.topicId]: weakTopicMasteryFixture
      }
    });

    expect(service.getReviewDueTopics(new Date('2026-07-11T00:00:00.000Z'))[0]?.topicId).toBe('topic-foundation');
  });

  it('allows mastery to remain weak after one isolated correct answer', () => {
    const state = service.createEmptyState();
    service.saveState({
      ...state,
      topicMastery: {
        [weakTopicMasteryFixture.topicId]: weakTopicMasteryFixture
      }
    });

    const next = service.updateTopicMastery('topic-foundation', drillAttemptFixture);

    expect(next.topicMastery['topic-foundation']?.status).toBe('weak');
  });
});
