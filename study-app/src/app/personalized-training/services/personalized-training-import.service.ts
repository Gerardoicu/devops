import { Injectable } from '@angular/core';
import {
  ImportedExamSession,
  ImportQualityFlag,
  ImportResultStatus
} from '../models/personalized-training.models';
import { normalizeImportedExamSession, ImportMetadata } from '../utils/exam-session-normalization';
import { PersonalizedTrainingStateService } from './personalized-training-state.service';

export interface PersonalizedTrainingImportResult {
  status: ImportResultStatus;
  session: ImportedExamSession | null;
  flags: ImportQualityFlag[];
}

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingImportService {
  constructor(private readonly stateService: PersonalizedTrainingStateService) {}

  parseJsonText(jsonText: string, metadata: ImportMetadata = {}): PersonalizedTrainingImportResult {
    try {
      const parsed: unknown = JSON.parse(jsonText);
      return this.previewImport(parsed, metadata);
    } catch {
      return {
        status: 'invalid',
        session: null,
        flags: [
          {
            code: 'malformed_json',
            severity: 'error',
            scope: 'session',
            message: 'JSON text could not be parsed.'
          }
        ]
      };
    }
  }

  importParsedSession(value: unknown, metadata: ImportMetadata = {}): PersonalizedTrainingImportResult {
    return this.previewImport(value, metadata);
  }

  async importFile(file: File): Promise<PersonalizedTrainingImportResult> {
    const text = await file.text();
    return this.parseJsonText(text, { sourceFileName: file.name });
  }

  previewImport(value: unknown, metadata: ImportMetadata = {}): PersonalizedTrainingImportResult {
    const result = normalizeImportedExamSession(value, metadata);
    if (!result.session) {
      return { status: 'invalid', session: null, flags: result.flags };
    }

    if (this.stateService.hasImportedSession(result.session.id)) {
      const duplicateFlag: ImportQualityFlag = {
        code: 'duplicate_import',
        severity: 'warning',
        scope: 'session',
        message: 'An imported session with this stable ID already exists.',
        details: { importId: result.session.id }
      };
      return {
        status: 'duplicate',
        session: {
          ...result.session,
          qualityFlags: [...result.session.qualityFlags, duplicateFlag]
        },
        flags: [...collectImportFlags(result.session), duplicateFlag]
      };
    }

    const hasWarnings = hasNonErrorQualityFlags(result.session);
    return {
      status: hasWarnings ? 'valid_with_warnings' : 'valid',
      session: result.session,
      flags: collectImportFlags(result.session)
    };
  }

  commitImport(session: ImportedExamSession): PersonalizedTrainingImportResult {
    if (this.stateService.hasImportedSession(session.id)) {
      const duplicateFlag: ImportQualityFlag = {
        code: 'duplicate_import',
        severity: 'warning',
        scope: 'session',
        message: 'An imported session with this stable ID already exists.',
        details: { importId: session.id }
      };
      return {
        status: 'duplicate',
        session: {
          ...session,
          qualityFlags: [...session.qualityFlags, duplicateFlag]
        },
        flags: [...collectImportFlags(session), duplicateFlag]
      };
    }

    this.stateService.commitImportedSession(session);
    const hasWarnings = hasNonErrorQualityFlags(session);
    return {
      status: hasWarnings ? 'valid_with_warnings' : 'valid',
      session,
      flags: collectImportFlags(session)
    };
  }
}

function hasNonErrorQualityFlags(session: ImportedExamSession): boolean {
  return collectImportFlags(session).some(
    (flag) => flag.severity === 'warning' || flag.severity === 'info'
  );
}

function collectImportFlags(session: ImportedExamSession): ImportQualityFlag[] {
  return [...session.qualityFlags, ...session.attempts.flatMap((attempt) => attempt.qualityFlags)];
}
