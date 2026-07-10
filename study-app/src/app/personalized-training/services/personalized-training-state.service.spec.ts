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
