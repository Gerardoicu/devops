import {
  constantConfidenceFixture,
  currentSchemaImportFixture,
  rushedTailFixture
} from '../testing/imported-session.fixtures';
import { normalizeImportedExamSession } from './exam-session-normalization';

describe('exam session quality analysis', () => {
  it('warns on suspicious constant confidence', () => {
    const result = normalizeImportedExamSession(constantConfidenceFixture);

    expect(result.session?.qualityFlags.some((flag) => flag.code === 'suspicious_constant_confidence')).toBe(true);
  });

  it('warns on anomalously long response time', () => {
    const result = normalizeImportedExamSession({
      sessionId: 'long-response',
      answers: [{ questionId: 1, answer: 'A', correctAnswer: 'A', confidence: 3, timeSeconds: 700 }]
    });

    expect(result.session?.attempts[0]?.qualityFlags.some((flag) => flag.code === 'anomalous_long_response_time')).toBe(true);
  });

  it('warns when wall-clock duration and elapsed time mismatch', () => {
    const result = normalizeImportedExamSession({
      sessionId: 'elapsed-mismatch',
      startedAt: '2026-07-10T10:00:00.000Z',
      completedAt: '2026-07-10T11:00:00.000Z',
      elapsedSeconds: 300,
      answers: [{ questionId: 1, answer: 'A', correctAnswer: 'A', confidence: 3, timeSeconds: 30 }]
    });

    expect(result.session?.qualityFlags.some((flag) => flag.code === 'elapsed_time_inconsistency')).toBe(true);
  });

  it('does not create a rushed-segment warning from one fast answer', () => {
    const result = normalizeImportedExamSession({
      sessionId: 'one-fast-answer',
      answers: [
        { questionId: 1, answer: 'A', correctAnswer: 'A', confidence: 3, timeSeconds: 40 },
        { questionId: 2, answer: 'A', correctAnswer: 'A', confidence: 3, timeSeconds: 45 },
        { questionId: 3, answer: 'B', correctAnswer: 'A', confidence: 3, timeSeconds: 2 }
      ]
    });

    expect(result.session?.qualityFlags.some((flag) => flag.code === 'possible_rushed_segment')).toBe(false);
    expect(result.session?.suspectedRushedSegment).toBeNull();
  });

  it('warns when a sustained fast and inaccurate tail appears', () => {
    const result = normalizeImportedExamSession(rushedTailFixture);

    expect(result.session?.qualityFlags.some((flag) => flag.code === 'possible_rushed_segment')).toBe(true);
    expect(result.session?.suspectedRushedSegment?.startIndex).toBe(8);
  });

  it('adds known bank issue flags for configured questions', () => {
    const result = normalizeImportedExamSession(currentSchemaImportFixture);
    const knownIssueAttempt = result.session?.attempts.find((attempt) => attempt.questionId === 36);

    expect(knownIssueAttempt?.qualityFlags.some((flag) => flag.code === 'known_bank_data_issue')).toBe(true);
  });

  it('does not use a known bank issue as a learner result change', () => {
    const result = normalizeImportedExamSession(currentSchemaImportFixture);
    const knownIssueAttempt = result.session?.attempts.find((attempt) => attempt.questionId === 36);

    expect(knownIssueAttempt?.selectedAnswers).toEqual(['E']);
    expect(knownIssueAttempt?.result).toBe('partial');
  });
});
