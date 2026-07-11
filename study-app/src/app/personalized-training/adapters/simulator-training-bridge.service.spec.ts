import { TestBed } from '@angular/core/testing';
import {
  SimulatorTrainingBridgeService,
  SIMULATOR_HISTORY_STORAGE_KEY
} from './simulator-training-bridge.service';
import {
  PERSONALIZED_TRAINING_STORAGE_KEY,
  PersonalizedTrainingStateService
} from '../services/personalized-training-state.service';
import { currentSchemaImportFixture } from '../testing/imported-session.fixtures';

describe('SimulatorTrainingBridgeService', () => {
  let bridge: SimulatorTrainingBridgeService;
  let stateService: PersonalizedTrainingStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    bridge = TestBed.inject(SimulatorTrainingBridgeService);
    stateService = TestBed.inject(PersonalizedTrainingStateService);
  });

  it('copies a completed simulator session through the Phase 2 import pipeline', () => {
    const result = bridge.syncCompletedSimulatorSession(currentSchemaImportFixture);

    expect(result.syncedCount).toBe(1);
    expect(stateService.getImportedSessions()[0].importParserVersion).toBe('personalized-training-import-v2');
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toContain('source:sim-session-current-1');
  });

  it('does not copy duplicate simulator sessions twice', () => {
    bridge.syncCompletedSimulatorSession(currentSchemaImportFixture);
    const result = bridge.syncCompletedSimulatorSession(currentSchemaImportFixture);

    expect(result.duplicateCount).toBe(1);
    expect(stateService.getImportedSessions()).toHaveLength(1);
  });

  it('backfills existing simulator history without writing the simulator-history key', () => {
    localStorage.setItem(SIMULATOR_HISTORY_STORAGE_KEY, JSON.stringify([currentSchemaImportFixture]));
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');

    const result = bridge.syncExistingSimulatorHistory();

    expect(result.syncedCount).toBe(1);
    expect(setSpy.mock.calls.some((call) => call[0] === SIMULATOR_HISTORY_STORAGE_KEY)).toBe(false);
    expect(localStorage.getItem(SIMULATOR_HISTORY_STORAGE_KEY)).toBe(JSON.stringify([currentSchemaImportFixture]));
    setSpy.mockRestore();
  });

  it('contains synchronization failures and leaves simulator history untouched', () => {
    localStorage.setItem(SIMULATOR_HISTORY_STORAGE_KEY, '{bad-json');

    const result = bridge.syncExistingSimulatorHistory();

    expect(result.failedCount).toBe(1);
    expect(stateService.getImportedSessions()).toEqual([]);
    expect(localStorage.getItem(SIMULATOR_HISTORY_STORAGE_KEY)).toBe('{bad-json');
  });
});
