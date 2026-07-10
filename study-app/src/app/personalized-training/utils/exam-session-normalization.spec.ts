import { currentSchemaImportFixture, legacyImportFixture } from '../testing/imported-session.fixtures';
import {
  deriveImportId,
  deriveCorrectness,
  normalizeAnswerArray,
  normalizeAnswerRecord,
  normalizeImportedExamSession
} from './exam-session-normalization';

describe('exam session normalization', () => {
  it('imports the current schema into a normalized session', () => {
    const result = normalizeImportedExamSession(currentSchemaImportFixture, { importedAt: '2026-07-10T12:00:00.000Z' });

    expect(result.session?.id).toBe('source:sim-session-current-1');
    expect(result.session?.bankType).toBe('verified');
    expect(result.session?.totalRecords).toBe(3);
    expect(result.session?.correctCount).toBe(1);
    expect(result.session?.attempts[0]?.questionId).toBe(1);
    expect(result.session?.attempts[0]?.domainName).toBe('Fixture domain');
  });

  it('derives a deterministic import identity when no source session ID exists', () => {
    const importId = deriveImportId({
      sourceSessionId: null,
      startedAt: '2026-07-10T10:00:00.000Z',
      completedAt: '2026-07-10T10:10:00.000Z',
      bankType: 'verified',
      totalRecords: 65
    });

    expect(importId).toBe('derived:2026-07-10t10-00-00-000z:2026-07-10t10-10-00-000z:verified:65');
  });

  it('normalizes legacy answer and correct_answer strings to arrays', () => {
    const result = normalizeImportedExamSession(legacyImportFixture);

    expect(result.session?.attempts[0]?.selectedAnswers).toEqual(['A']);
    expect(result.session?.attempts[0]?.correctAnswers).toEqual(['A']);
  });

  it('normalizes lowercase answers to uppercase', () => {
    expect(normalizeAnswerArray(['a', 'c']).answers).toEqual(['A', 'C']);
  });

  it('removes duplicate answers while preserving order', () => {
    expect(normalizeAnswerArray(['b', 'a', 'B', 'c']).answers).toEqual(['B', 'A', 'C']);
  });

  it('flags invalid answer values without accepting them', () => {
    const result = normalizeAnswerRecord({ questionId: 1, answer: ['A', 'AA', 7], correctAnswer: 'A' }, 0);

    expect(result.attempt?.selectedAnswers).toEqual(['A']);
    expect(result.attempt?.qualityFlags.some((flag) => flag.code === 'invalid_answer_value')).toBe(true);
  });

  it('imports usable records while reporting skipped malformed records', () => {
    const result = normalizeImportedExamSession({
      sessionId: 'partial-malformed',
      answers: [
        { questionId: 1, answer: 'A', correctAnswer: 'A' },
        'not-a-record',
        { answer: 'B', correctAnswer: 'B' }
      ]
    });

    expect(result.session?.attempts.length).toBe(1);
    expect(result.session?.qualityFlags.some((flag) => flag.code === 'malformed_answer_record')).toBe(true);
    expect(result.session?.qualityFlags.some((flag) => flag.code === 'missing_question_id')).toBe(true);
    expect(result.session?.qualityFlags.some((flag) => flag.code === 'incomplete_session')).toBe(true);
  });

  it('derives single-choice correctness correctly', () => {
    expect(deriveCorrectness(['A'], ['A'])).toBe('correct');
    expect(deriveCorrectness(['B'], ['A'])).toBe('wrong');
  });

  it('derives multi-select exact match as correct', () => {
    expect(deriveCorrectness(['A', 'C'], ['C', 'A'])).toBe('correct');
  });

  it('derives incomplete multi-select as partial', () => {
    expect(deriveCorrectness(['A'], ['A', 'C'])).toBe('partial');
  });

  it('derives multi-select with a wrong option as wrong', () => {
    expect(deriveCorrectness(['A', 'B'], ['A', 'C'])).toBe('wrong');
  });

  it('derives missing selected answer as unanswered', () => {
    expect(deriveCorrectness([], ['A'])).toBe('unanswered');
  });

  it('uses unknown when correct answers are missing and warns', () => {
    const result = normalizeAnswerRecord({ questionId: 12, answer: 'A' }, 0);

    expect(result.attempt?.result).toBe('unknown');
    expect(result.attempt?.qualityFlags.some((flag) => flag.code === 'missing_correct_answers')).toBe(true);
    expect(result.attempt?.qualityFlags.some((flag) => flag.code === 'correctness_not_verifiable')).toBe(true);
  });

  it('preserves confidence values 1 through 5', () => {
    const values = [1, 2, 3, 4, 5].map((confidence) =>
      normalizeAnswerRecord({ questionId: confidence, answer: 'A', correctAnswer: 'A', confidence }, confidence).attempt
        ?.confidence
    );

    expect(values).toEqual([1, 2, 3, 4, 5]);
  });

  it('turns invalid confidence into null with a warning', () => {
    const result = normalizeAnswerRecord({ questionId: 1, answer: 'A', correctAnswer: 'A', confidence: 6 }, 0);

    expect(result.attempt?.confidence).toBeNull();
    expect(result.attempt?.qualityFlags.some((flag) => flag.code === 'invalid_confidence')).toBe(true);
  });

  it('keeps missing confidence as null', () => {
    const result = normalizeAnswerRecord({ questionId: 1, answer: 'A', correctAnswer: 'A' }, 0);

    expect(result.attempt?.confidence).toBeNull();
  });

  it('keeps missing response time as null', () => {
    const result = normalizeAnswerRecord({ questionId: 1, answer: 'A', correctAnswer: 'A' }, 0);

    expect(result.attempt?.responseTimeSeconds).toBeNull();
  });

  it('does not persist question or option text in normalized attempts', () => {
    const result = normalizeAnswerRecord(
      {
        questionId: 1,
        questionText: 'Do not persist',
        options: [{ id: 'A', text: 'Do not persist' }],
        answer: 'A',
        correctAnswer: 'A'
      },
      0
    );
    const serialized = JSON.stringify(result.attempt);

    expect(serialized).not.toContain('Do not persist');
    expect(Object.keys(result.attempt ?? {})).not.toContain('questionText');
    expect(Object.keys(result.attempt ?? {})).not.toContain('options');
  });
});
