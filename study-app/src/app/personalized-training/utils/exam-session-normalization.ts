import {
  Confidence,
  ImportedExamSession,
  ImportedQuestionAttempt,
  ImportedQuestionResult,
  ImportQualityFlag
} from '../models/personalized-training.models';
import { isRecord } from './personalized-training-validation';
import { analyzeSessionQuality } from './exam-session-quality-analysis';

export const IMPORT_PARSER_VERSION = 'personalized-training-import-v2';
const ANSWER_OPTION_PATTERN = /^[A-Z]$/;

export interface ImportMetadata {
  importedAt?: string;
  sourceFileName?: string | null;
}

export interface NormalizationResult {
  session: ImportedExamSession | null;
  flags: ImportQualityFlag[];
}

interface RawSessionMetadata {
  sourceSessionId: string | null;
  sourceSchemaVersion: string | null;
  sourceAppVersion: string | null;
  bankType: string | null;
  assessmentMode: string | null;
  startedAt: string | null;
  completedAt: string | null;
  elapsedSeconds: number | null;
  activeElapsedSeconds: number | null;
}

export function normalizeImportedExamSession(value: unknown, metadata: ImportMetadata = {}): NormalizationResult {
  if (!isRecord(value)) {
    return {
      session: null,
      flags: [createSessionFlag('unsupported_schema', 'error', 'Imported value must be a JSON object.')]
    };
  }

  const rawRecords = locateAnswerRecords(value);
  const sessionFlags: ImportQualityFlag[] = [];
  const sessionMetadata = readSessionMetadata(value);

  if (!hasAnySessionMetadata(sessionMetadata)) {
    sessionFlags.push(createSessionFlag('missing_session_metadata', 'warning', 'No stable session metadata was supplied.'));
  }

  if (!rawRecords) {
    return {
      session: null,
      flags: [createSessionFlag('missing_answer_records', 'error', 'No answer-record array was found.'), ...sessionFlags]
    };
  }

  const attempts: ImportedQuestionAttempt[] = [];
  rawRecords.forEach((record, index) => {
    const normalized = normalizeAnswerRecord(record, index);
    if (normalized.attempt) {
      attempts.push(normalized.attempt);
    }
    sessionFlags.push(...normalized.sessionFlags);
  });

  if (attempts.length === 0) {
    return {
      session: null,
      flags: [
        createSessionFlag('unsupported_schema', 'error', 'No usable answer records were found.'),
        ...sessionFlags
      ]
    };
  }

  if (attempts.length < rawRecords.length) {
    sessionFlags.push(
      createSessionFlag('incomplete_session', 'warning', 'Some malformed answer records were skipped.', {
        totalRecords: rawRecords.length,
        importedRecords: attempts.length
      })
    );
  }

  const baseSession = buildSession(sessionMetadata, attempts, rawRecords.length, metadata, sessionFlags);
  const analysis = analyzeSessionQuality(baseSession);
  const analyzedAttempts = analysis.attempts;
  const allSessionFlags = [...baseSession.qualityFlags, ...analysis.flags];
  const session: ImportedExamSession = {
    ...baseSession,
    attempts: analyzedAttempts,
    qualityFlags: allSessionFlags,
    suspectedRushedSegment: analysis.suspectedRushedSegment
  };

  return { session, flags: allSessionFlags };
}

export function normalizeAnswerRecord(
  value: unknown,
  index: number
): { attempt: ImportedQuestionAttempt | null; sessionFlags: ImportQualityFlag[] } {
  if (!isRecord(value)) {
    return {
      attempt: null,
      sessionFlags: [createSessionFlag('malformed_answer_record', 'warning', 'An answer record was not an object.', { index })]
    };
  }

  const questionId = readQuestionId(value);
  if (questionId === null) {
    return {
      attempt: null,
      sessionFlags: [createSessionFlag('missing_question_id', 'warning', 'An answer record was missing a usable question ID.', { index })]
    };
  }

  const qualityFlags: ImportQualityFlag[] = [];
  const selected = normalizeAnswerArray(readFirst(value, ['selectedAnswers', 'selected_answers', 'selectedAnswer', 'answer']));
  const correct = normalizeAnswerArray(
    readFirst(value, ['correctAnswers', 'correct_answers', 'correctAnswer', 'correct_answer'])
  );
  if (!selected.valid) {
    qualityFlags.push(createQuestionFlag('invalid_answer_value', 'warning', questionId, 'Selected answer contained invalid option IDs.', selected.details));
  }
  if (!correct.valid) {
    qualityFlags.push(createQuestionFlag('invalid_answer_value', 'warning', questionId, 'Correct answer contained invalid option IDs.', correct.details));
  }
  if (correct.answers.length === 0) {
    qualityFlags.push(createQuestionFlag('missing_correct_answers', 'warning', questionId, 'Correct answers were not supplied.'));
  }

  const explicitResult = normalizeExplicitResult(readFirst(value, ['result', 'isCorrect', 'is_correct']));
  const result = explicitResult ?? deriveCorrectness(selected.answers, correct.answers);
  if (result === 'unknown') {
    qualityFlags.push(
      createQuestionFlag('correctness_not_verifiable', 'warning', questionId, 'Correctness could not be verified from the imported data.')
    );
  }

  const confidenceResult = normalizeConfidence(readFirst(value, ['confidence']));
  if (confidenceResult.invalid) {
    qualityFlags.push(
      createQuestionFlag('invalid_confidence', 'warning', questionId, 'Confidence was outside the supported 1-5 range.', {
        value: confidenceResult.original
      })
    );
  }

  return {
    attempt: {
      questionId,
      order: index,
      questionType: readString(value, ['questionType', 'question_type']),
      selectedAnswers: selected.answers,
      correctAnswers: correct.answers,
      result,
      confidence: confidenceResult.confidence,
      responseTimeSeconds: normalizeSeconds(readFirst(value, ['timeSeconds', 'time_seconds', 'responseTimeSeconds', 'response_time_seconds'])),
      notes: readString(value, ['notes']),
      domainName: readString(value, ['domain', 'domainName', 'domain_name']),
      topic: readString(value, ['topic']),
      qualityFlags
    },
    sessionFlags: []
  };
}

export function normalizeAnswerArray(value: unknown): { answers: string[]; valid: boolean; details?: Record<string, unknown> } {
  if (value === null || value === undefined || value === '') {
    return { answers: [], valid: true };
  }

  const rawValues = Array.isArray(value) ? value : [value];
  const answers: string[] = [];
  const invalidValues: unknown[] = [];

  for (const raw of rawValues) {
    if (typeof raw !== 'string') {
      invalidValues.push(raw);
      continue;
    }

    const normalized = raw.trim().toUpperCase();
    if (!ANSWER_OPTION_PATTERN.test(normalized)) {
      invalidValues.push(raw);
      continue;
    }

    if (!answers.includes(normalized)) {
      answers.push(normalized);
    }
  }

  return {
    answers,
    valid: invalidValues.length === 0,
    ...(invalidValues.length > 0 ? { details: { invalidValues } } : {})
  };
}

export function deriveCorrectness(selectedAnswers: string[], correctAnswers: string[]): ImportedQuestionResult {
  if (selectedAnswers.length === 0) {
    return 'unanswered';
  }

  if (correctAnswers.length === 0) {
    return 'unknown';
  }

  const correctSet = new Set(correctAnswers);
  const selectedSet = new Set(selectedAnswers);
  const hasWrongSelection = selectedAnswers.some((answer) => !correctSet.has(answer));
  if (hasWrongSelection) {
    return 'wrong';
  }

  if (selectedSet.size === correctSet.size && correctAnswers.every((answer) => selectedSet.has(answer))) {
    return 'correct';
  }

  return correctAnswers.length > 1 && selectedAnswers.length > 0 ? 'partial' : 'wrong';
}

export function deriveImportId(session: Pick<ImportedExamSession, 'sourceSessionId' | 'startedAt' | 'completedAt' | 'bankType' | 'totalRecords'>): string {
  if (session.sourceSessionId) {
    return `source:${sanitizeIdPart(session.sourceSessionId)}`;
  }

  return [
    'derived',
    sanitizeIdPart(session.startedAt ?? 'missing-start'),
    sanitizeIdPart(session.completedAt ?? 'missing-complete'),
    sanitizeIdPart(session.bankType ?? 'unknown-bank'),
    String(session.totalRecords)
  ].join(':');
}

function buildSession(
  metadata: RawSessionMetadata,
  attempts: ImportedQuestionAttempt[],
  totalRecords: number,
  importMetadata: ImportMetadata,
  qualityFlags: ImportQualityFlag[]
): ImportedExamSession {
  const answeredCount = attempts.filter((attempt) => attempt.result !== 'unanswered').length;
  const correctCount = attempts.filter((attempt) => attempt.result === 'correct').length;
  const partialCount = attempts.filter((attempt) => attempt.result === 'partial').length;
  const wrongCount = attempts.filter((attempt) => attempt.result === 'wrong').length;
  const unansweredCount = attempts.filter((attempt) => attempt.result === 'unanswered').length;
  const verifiableCount = correctCount + partialCount + wrongCount + unansweredCount;
  const scorePercent = attempts.some((attempt) => attempt.result === 'unknown')
    ? null
    : Math.round((correctCount / Math.max(verifiableCount, 1)) * 10000) / 100;
  const partialSession: Omit<ImportedExamSession, 'id'> = {
    ...metadata,
    importedAt: importMetadata.importedAt ?? new Date().toISOString(),
    sourceFileName: importMetadata.sourceFileName ?? null,
    totalRecords,
    answeredCount,
    correctCount,
    partialCount,
    wrongCount,
    unansweredCount,
    scorePercent,
    attempts,
    qualityFlags,
    suspectedRushedSegment: null,
    importParserVersion: IMPORT_PARSER_VERSION
  };

  return {
    ...partialSession,
    id: deriveImportId({
      sourceSessionId: partialSession.sourceSessionId,
      startedAt: partialSession.startedAt,
      completedAt: partialSession.completedAt,
      bankType: partialSession.bankType,
      totalRecords: partialSession.totalRecords
    })
  };
}

function locateAnswerRecords(value: Record<string, unknown>): unknown[] | null {
  for (const key of ['answers', 'questions', 'records', 'results']) {
    const direct = value[key];
    if (Array.isArray(direct)) {
      return direct;
    }
  }

  const summary = value['summary'];
  if (isRecord(summary)) {
    for (const key of ['answers', 'questions', 'records', 'results']) {
      const nested = summary[key];
      if (Array.isArray(nested)) {
        return nested;
      }
    }
  }

  return null;
}

function readSessionMetadata(value: Record<string, unknown>): RawSessionMetadata {
  return {
    sourceSessionId: readString(value, ['sessionId', 'id']),
    sourceSchemaVersion: readString(value, ['schemaVersion']),
    sourceAppVersion: readString(value, ['appVersion']),
    bankType: readString(value, ['bankType']),
    assessmentMode: readString(value, ['assessmentMode']),
    startedAt: readString(value, ['startedAt']),
    completedAt: readString(value, ['completedAt']),
    elapsedSeconds: normalizeSeconds(value['elapsedSeconds']),
    activeElapsedSeconds: normalizeSeconds(value['activeElapsedSeconds'])
  };
}

function hasAnySessionMetadata(metadata: RawSessionMetadata): boolean {
  return Object.values(metadata).some((value) => value !== null);
}

function readQuestionId(value: Record<string, unknown>): number | null {
  const raw = readFirst(value, ['question', 'questionId', 'question_id', 'id']);
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) {
    return raw;
  }

  if (typeof raw === 'string') {
    const match = raw.match(/\d+/);
    if (match) {
      const parsed = Number.parseInt(match[0], 10);
      return parsed > 0 ? parsed : null;
    }
  }

  return null;
}

function readString(value: Record<string, unknown>, keys: string[]): string | null {
  const raw = readFirst(value, keys);
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
}

function readFirst(value: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      return value[key];
    }
  }

  return undefined;
}

function normalizeExplicitResult(value: unknown): ImportedQuestionResult | null {
  if (value === true) {
    return 'correct';
  }
  if (value === false) {
    return 'wrong';
  }
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'correct') {
    return 'correct';
  }
  if (normalized === 'partial') {
    return 'partial';
  }
  if (normalized === 'wrong' || normalized === 'incorrect') {
    return 'wrong';
  }
  if (normalized === 'unanswered' || normalized === 'blank') {
    return 'unanswered';
  }
  if (normalized === 'unknown') {
    return 'unknown';
  }

  return null;
}

function normalizeConfidence(value: unknown): { confidence: Confidence; invalid: boolean; original?: unknown } {
  if (value === null || value === undefined || value === '') {
    return { confidence: null, invalid: false };
  }

  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4 || parsed === 5
    ? { confidence: parsed, invalid: false }
    : { confidence: null, invalid: true, original: value };
}

function normalizeSeconds(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function sanitizeIdPart(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'missing';
}

function createSessionFlag(
  code: ImportQualityFlag['code'],
  severity: ImportQualityFlag['severity'],
  message: string,
  details?: Record<string, unknown>
): ImportQualityFlag {
  return {
    code,
    severity,
    scope: 'session',
    message,
    ...(details ? { details } : {})
  };
}

function createQuestionFlag(
  code: ImportQualityFlag['code'],
  severity: ImportQualityFlag['severity'],
  questionId: number,
  message: string,
  details?: Record<string, unknown>
): ImportQualityFlag {
  return {
    code,
    severity,
    scope: 'question',
    questionId,
    message,
    ...(details ? { details } : {})
  };
}
