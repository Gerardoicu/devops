import { Injectable } from '@angular/core';
import { PersonalizedTrainingImportService } from '../services/personalized-training-import.service';

export const SIMULATOR_HISTORY_STORAGE_KEY = 'dop-c02-simulator-session-history-v1';

export interface SimulatorTrainingSyncResult {
  syncedCount: number;
  duplicateCount: number;
  invalidCount: number;
  failedCount: number;
}

@Injectable({ providedIn: 'root' })
export class SimulatorTrainingBridgeService {
  constructor(private readonly importService: PersonalizedTrainingImportService) {}

  syncCompletedSimulatorSession(session: unknown): SimulatorTrainingSyncResult {
    return this.syncSessions([cloneUnknown(session)]);
  }

  syncExistingSimulatorHistory(): SimulatorTrainingSyncResult {
    try {
      const raw = localStorage.getItem(SIMULATOR_HISTORY_STORAGE_KEY);
      if (!raw) {
        return emptyResult();
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return { ...emptyResult(), invalidCount: 1 };
      }
      return this.syncSessions(parsed.map(cloneUnknown));
    } catch {
      return { ...emptyResult(), failedCount: 1 };
    }
  }

  private syncSessions(sessions: readonly unknown[]): SimulatorTrainingSyncResult {
    const result = emptyResult();
    for (const session of sessions) {
      try {
        const preview = this.importService.importParsedSession(session, { sourceFileName: 'simulator-history' });
        if (preview.status === 'invalid' || !preview.session) {
          result.invalidCount += 1;
          continue;
        }
        if (preview.status === 'duplicate') {
          result.duplicateCount += 1;
          continue;
        }
        const committed = this.importService.commitImport(preview.session);
        if (committed.status === 'duplicate') {
          result.duplicateCount += 1;
        } else {
          result.syncedCount += 1;
        }
      } catch {
        result.failedCount += 1;
      }
    }
    return result;
  }
}

function emptyResult(): SimulatorTrainingSyncResult {
  return {
    syncedCount: 0,
    duplicateCount: 0,
    invalidCount: 0,
    failedCount: 0
  };
}

function cloneUnknown(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value)) as unknown;
}
