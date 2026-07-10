import { TestBed } from '@angular/core/testing';
import { currentSchemaImportFixture } from '../testing/imported-session.fixtures';
import {
  PERSONALIZED_TRAINING_STORAGE_KEY,
  PersonalizedTrainingStateService
} from './personalized-training-state.service';
import { PersonalizedTrainingImportService } from './personalized-training-import.service';

describe('PersonalizedTrainingImportService', () => {
  let service: PersonalizedTrainingImportService;
  let stateService: PersonalizedTrainingStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalizedTrainingImportService);
    stateService = TestBed.inject(PersonalizedTrainingStateService);
  });

  it('previews imports without writing localStorage', () => {
    const result = service.previewImport(currentSchemaImportFixture);

    expect(result.session?.id).toBe('source:sim-session-current-1');
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toBeNull();
  });

  it('imports parsed unknown JSON values without persistence', () => {
    const parsed: unknown = currentSchemaImportFixture;

    const result = service.importParsedSession(parsed);

    expect(result.status).toBe('valid_with_warnings');
    expect(result.flags.some((flag) => flag.code === 'known_bank_data_issue')).toBe(true);
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toBeNull();
  });

  it('commits imports only into personalized-training state', () => {
    const preview = service.previewImport(currentSchemaImportFixture);
    expect(preview.session).not.toBeNull();

    const committed = service.commitImport(preview.session!);

    expect(committed.status).toBe('valid_with_warnings');
    expect(stateService.getImportedSessions()[0]?.id).toBe('source:sim-session-current-1');
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toContain('source:sim-session-current-1');
    expect(localStorage.getItem('dop-c02-runtime-state-v1')).toBeNull();
    expect(localStorage.getItem('dop-c02-simulator-session-history-v1')).toBeNull();
  });

  it('detects duplicate imports during preview and commit', () => {
    const preview = service.previewImport(currentSchemaImportFixture);
    expect(preview.session).not.toBeNull();
    service.commitImport(preview.session!);

    const duplicatePreview = service.previewImport(currentSchemaImportFixture);
    const duplicateCommit = service.commitImport(preview.session!);

    expect(duplicatePreview.status).toBe('duplicate');
    expect(duplicatePreview.flags.some((flag) => flag.code === 'duplicate_import')).toBe(true);
    expect(duplicateCommit.status).toBe('duplicate');
    expect(stateService.getImportedSessions().length).toBe(1);
  });

  it('returns a typed invalid result for malformed JSON', () => {
    const result = service.parseJsonText('{bad-json');

    expect(result.status).toBe('invalid');
    expect(result.session).toBeNull();
    expect(result.flags[0]?.code).toBe('malformed_json');
  });

  it('returns a typed invalid result when answer records are missing', () => {
    const result = service.previewImport({ sessionId: 'no-records' });

    expect(result.status).toBe('invalid');
    expect(result.flags.some((flag) => flag.code === 'missing_answer_records')).toBe(true);
  });

  it('parses JSON text and supports source file metadata', () => {
    const result = service.parseJsonText(JSON.stringify(currentSchemaImportFixture), { sourceFileName: 'sim-export.json' });

    expect(result.session?.sourceFileName).toBe('sim-export.json');
  });

  it('imports browser File input asynchronously', async () => {
    const file = new File([JSON.stringify(currentSchemaImportFixture)], 'browser-export.json', {
      type: 'application/json'
    });

    const result = await service.importFile(file);

    expect(result.session?.sourceFileName).toBe('browser-export.json');
    expect(localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY)).toBeNull();
  });
});
