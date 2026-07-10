import { TestBed } from '@angular/core/testing';
import { PersonalizedTrainingRuntimeService } from './personalized-training-runtime.service';
import { PersonalizedTrainingStateService, PERSONALIZED_TRAINING_STORAGE_KEY } from './personalized-training-state.service';
import {
  correctDraftFixture,
  drillNow,
  drillPlanFixture,
  singleChoiceDrillFixture
} from '../testing/drill-engine.fixtures';

describe('PersonalizedTrainingRuntimeService', () => {
  let service: PersonalizedTrainingRuntimeService;
  let stateService: PersonalizedTrainingStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalizedTrainingRuntimeService);
    stateService = TestBed.inject(PersonalizedTrainingStateService);
  });

  it('runs a completed attempt through state and generated evidence', () => {
    const session = service.startRuntimeSession(service.createRuntimeSession(drillPlanFixture, [singleChoiceDrillFixture], drillNow), drillNow);
    const active = service.startActivity(session, session.activities[0].activityId, drillNow);
    const submitted = service.submitActivity({
      session: active,
      activityId: active.activities[0].activityId,
      definition: singleChoiceDrillFixture,
      draft: correctDraftFixture,
      now: drillNow
    });

    expect(submitted.activities[0].status).toBe('completed');
    expect(stateService.getDrillAttempts().length).toBe(1);
    expect(stateService.getGeneratedEvidence().length).toBe(1);
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toContain('attempt:');
    expect(localStorage.getItem('dop-c02-runtime-state-v1')).toBeNull();
  });

  it('abandoning for fatigue preserves completed attempts and clears only active runtime', () => {
    const session = service.startRuntimeSession(service.createRuntimeSession(drillPlanFixture, [singleChoiceDrillFixture], drillNow), drillNow);
    const active = service.startActivity(session, session.activities[0].activityId, drillNow);
    service.submitActivity({
      session: active,
      activityId: active.activities[0].activityId,
      definition: singleChoiceDrillFixture,
      draft: correctDraftFixture,
      now: drillNow
    });

    service.abandonSession(active, 'fatigue', drillNow);

    expect(stateService.getActiveRuntimeSession()).toBeNull();
    expect(stateService.getDrillAttempts().length).toBe(1);
    expect(stateService.getRuntimeSessionHistory()[0]?.stopReason).toBe('fatigue');
  });
});
