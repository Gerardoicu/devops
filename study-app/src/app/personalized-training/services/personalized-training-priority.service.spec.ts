import { TestBed } from '@angular/core/testing';
import {
  PERSONALIZED_TRAINING_STORAGE_KEY,
  PersonalizedTrainingStateService
} from './personalized-training-state.service';
import { PersonalizedTrainingPriorityService } from './personalized-training-priority.service';
import {
  priorityEngineNow,
  repeatedReliableCrossAccountSessionA,
  topicDescriptorsFixture
} from '../testing/priority-engine.fixtures';

describe('PersonalizedTrainingPriorityService', () => {
  let service: PersonalizedTrainingPriorityService;
  let stateService: PersonalizedTrainingStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalizedTrainingPriorityService);
    stateService = TestBed.inject(PersonalizedTrainingStateService);
  });

  it('generates and saves a priority snapshot under personalized-training state', () => {
    const snapshot = service.generatePrioritySnapshot({
      importedSessions: [repeatedReliableCrossAccountSessionA],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });

    service.savePrioritySnapshot(snapshot);

    expect(stateService.getLatestPrioritySnapshot()?.snapshotId).toBe(snapshot.snapshotId);
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toContain(snapshot.snapshotId);
    expect(localStorage.getItem('dop-c02-runtime-state-v1')).toBeNull();
    expect(localStorage.getItem('dop-c02-simulator-session-history-v1')).toBeNull();
  });

  it('does not mutate imported sessions while generating priorities', () => {
    const before = JSON.stringify(repeatedReliableCrossAccountSessionA);

    service.generatePrioritySnapshot({
      importedSessions: [repeatedReliableCrossAccountSessionA],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });

    expect(JSON.stringify(repeatedReliableCrossAccountSessionA)).toBe(before);
  });

  it('generates and saves a training session plan', () => {
    const plan = service.generateTrainingSessionPlan({
      importedSessions: [repeatedReliableCrossAccountSessionA],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow,
      availableMinutes: 15,
      energyLevel: 'low'
    });

    service.saveTrainingSessionPlan(plan);

    expect(stateService.getLatestTrainingSessionPlan()?.planId).toBe(plan.planId);
    expect(stateService.getTrainingSessionPlanHistory().length).toBe(1);
  });
});
