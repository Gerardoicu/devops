import {
  ImportedExamSession,
  ImportedQuestionAttempt,
  ImportQualityFlag,
  SuspectedRushedSegment
} from '../models/personalized-training.models';

export const CONSTANT_CONFIDENCE_MIN_RECORDS = 8;
export const CONSTANT_CONFIDENCE_RATIO = 0.9;
export const SHORT_RESPONSE_TIME_SECONDS = 5;
export const LONG_RESPONSE_TIME_SECONDS = 600;
export const POSSIBLE_PAUSE_SECONDS = 900;
export const ELAPSED_TIME_TOLERANCE_RATIO = 0.2;
export const ELAPSED_TIME_TOLERANCE_SECONDS = 60;
export const RUSHED_SEGMENT_MIN_LENGTH = 4;
export const RUSHED_SEGMENT_SHORT_RATIO = 0.75;
export const RUSHED_SEGMENT_CORRECTNESS_DROP = 0.25;
export const KNOWN_BANK_DATA_ISSUES: Readonly<Record<number, string>> = {
  36: 'Option F may be embedded in option E in some source versions.',
  49: 'Multi-select instruction may not match stored correct-answer count.',
  71: 'Multi-select instruction may not match stored correct-answer count.'
};

export function analyzeSessionQuality(session: ImportedExamSession): {
  flags: ImportQualityFlag[];
  attempts: ImportedQuestionAttempt[];
  suspectedRushedSegment: SuspectedRushedSegment | null;
} {
  const attempts = session.attempts.map((attempt) => ({
    ...attempt,
    qualityFlags: [...attempt.qualityFlags]
  }));
  const sessionFlags: ImportQualityFlag[] = [];

  for (const attempt of attempts) {
    if (attempt.confidence === null) {
      attempt.qualityFlags.push(createQuestionFlag('missing_confidence', 'info', attempt.questionId, 'Confidence was not supplied.'));
    }

    if (attempt.responseTimeSeconds === null) {
      attempt.qualityFlags.push(
        createQuestionFlag('missing_response_time', 'info', attempt.questionId, 'Response time was not supplied.')
      );
    } else if (attempt.responseTimeSeconds < SHORT_RESPONSE_TIME_SECONDS) {
      attempt.qualityFlags.push(
        createQuestionFlag('anomalous_short_response_time', 'warning', attempt.questionId, 'Response time is unusually short.', {
          responseTimeSeconds: attempt.responseTimeSeconds,
          thresholdSeconds: SHORT_RESPONSE_TIME_SECONDS
        })
      );
    } else if (attempt.responseTimeSeconds > LONG_RESPONSE_TIME_SECONDS) {
      attempt.qualityFlags.push(
        createQuestionFlag('anomalous_long_response_time', 'warning', attempt.questionId, 'Response time is unusually long.', {
          responseTimeSeconds: attempt.responseTimeSeconds,
          thresholdSeconds: LONG_RESPONSE_TIME_SECONDS
        })
      );
    }

    if (attempt.responseTimeSeconds !== null && attempt.responseTimeSeconds > POSSIBLE_PAUSE_SECONDS) {
      attempt.qualityFlags.push(
        createQuestionFlag('possible_long_pause', 'warning', attempt.questionId, 'Response time may include a long pause.', {
          responseTimeSeconds: attempt.responseTimeSeconds,
          thresholdSeconds: POSSIBLE_PAUSE_SECONDS
        })
      );
    }

    const knownIssue = KNOWN_BANK_DATA_ISSUES[attempt.questionId];
    if (knownIssue) {
      attempt.qualityFlags.push(createQuestionFlag('known_bank_data_issue', 'warning', attempt.questionId, knownIssue));
    }
  }

  const confidenceFlag = analyzeConstantConfidence(attempts);
  if (confidenceFlag) {
    sessionFlags.push(confidenceFlag);
  }

  sessionFlags.push(...analyzeElapsedTimeConsistency(session, attempts));

  const suspectedRushedSegment = detectRushedSegment(attempts);
  if (suspectedRushedSegment) {
    sessionFlags.push({
      code: 'possible_rushed_segment',
      severity: 'warning',
      scope: 'session',
      message: 'A sustained fast segment near the end may make part of this import less reliable.',
      details: suspectedRushedSegment.evidence
    });
  }

  return { flags: sessionFlags, attempts, suspectedRushedSegment };
}

function analyzeConstantConfidence(attempts: ImportedQuestionAttempt[]): ImportQualityFlag | null {
  const values = attempts
    .filter((attempt) => attempt.selectedAnswers.length > 0 && attempt.confidence !== null)
    .map((attempt) => attempt.confidence);

  if (values.length < CONSTANT_CONFIDENCE_MIN_RECORDS) {
    return null;
  }

  const counts = new Map<number, number>();
  for (const value of values) {
    if (value !== null) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  const max = Math.max(...counts.values());
  const ratio = max / values.length;
  return ratio >= CONSTANT_CONFIDENCE_RATIO
    ? {
        code: 'suspicious_constant_confidence',
        severity: 'warning',
        scope: 'session',
        message: 'Nearly all supplied confidence values are identical.',
        details: { nonNullConfidenceCount: values.length, largestIdenticalRatio: ratio, threshold: CONSTANT_CONFIDENCE_RATIO }
      }
    : null;
}

function analyzeElapsedTimeConsistency(
  session: ImportedExamSession,
  attempts: ImportedQuestionAttempt[]
): ImportQualityFlag[] {
  const flags: ImportQualityFlag[] = [];
  const elapsed = session.elapsedSeconds;
  const activeElapsed = session.activeElapsedSeconds;
  const wallClockSeconds =
    session.startedAt && session.completedAt
      ? Math.abs(Date.parse(session.completedAt) - Date.parse(session.startedAt)) / 1000
      : null;

  if (wallClockSeconds !== null && elapsed !== null && substantiallyDifferent(wallClockSeconds, elapsed)) {
    flags.push({
      code: 'elapsed_time_inconsistency',
      severity: 'warning',
      scope: 'session',
      message: 'Wall-clock duration differs substantially from elapsedSeconds.',
      details: { wallClockSeconds, elapsedSeconds: elapsed }
    });
  }

  if (activeElapsed !== null && elapsed !== null && activeElapsed > elapsed) {
    flags.push({
      code: 'elapsed_time_inconsistency',
      severity: 'warning',
      scope: 'session',
      message: 'activeElapsedSeconds exceeds elapsedSeconds.',
      details: { activeElapsedSeconds: activeElapsed, elapsedSeconds: elapsed }
    });
  }

  const summedQuestionTime = attempts.reduce((total, attempt) => total + (attempt.responseTimeSeconds ?? 0), 0);
  if (activeElapsed !== null && summedQuestionTime > 0 && substantiallyDifferent(summedQuestionTime, activeElapsed)) {
    flags.push({
      code: 'elapsed_time_inconsistency',
      severity: 'warning',
      scope: 'session',
      message: 'Summed question response time differs substantially from activeElapsedSeconds.',
      details: { summedQuestionTime, activeElapsedSeconds: activeElapsed }
    });
  }

  return flags;
}

function substantiallyDifferent(left: number, right: number): boolean {
  const delta = Math.abs(left - right);
  const tolerance = Math.max(ELAPSED_TIME_TOLERANCE_SECONDS, Math.max(left, right) * ELAPSED_TIME_TOLERANCE_RATIO);
  return delta > tolerance;
}

export function detectRushedSegment(attempts: ImportedQuestionAttempt[]): SuspectedRushedSegment | null {
  if (attempts.length < RUSHED_SEGMENT_MIN_LENGTH * 2) {
    return null;
  }

  const start = attempts.length - RUSHED_SEGMENT_MIN_LENGTH;
  const head = attempts.slice(0, start).filter((attempt) => attempt.responseTimeSeconds !== null);
  const tail = attempts.slice(start);
  const tailTimes = tail.filter((attempt) => attempt.responseTimeSeconds !== null).map((attempt) => attempt.responseTimeSeconds as number);
  if (head.length < RUSHED_SEGMENT_MIN_LENGTH || tailTimes.length < RUSHED_SEGMENT_MIN_LENGTH) {
    return null;
  }

  const headMedian = median(head.map((attempt) => attempt.responseTimeSeconds as number));
  const tailMedian = median(tailTimes);
  const shortTailCount = tailTimes.filter((time) => time < SHORT_RESPONSE_TIME_SECONDS).length;
  const tailShortRatio = shortTailCount / tail.length;
  const headReliableRatio = correctOrPartialRatio(attempts.slice(0, start));
  const tailReliableRatio = correctOrPartialRatio(tail);
  const unansweredTailRatio = tail.filter((attempt) => attempt.result === 'unanswered').length / tail.length;
  const hasCorrectnessDrop = headReliableRatio - tailReliableRatio >= RUSHED_SEGMENT_CORRECTNESS_DROP || unansweredTailRatio >= 0.5;
  const hasTimeDrop = tailMedian <= headMedian * 0.35 || tailShortRatio >= RUSHED_SEGMENT_SHORT_RATIO;

  if (!hasTimeDrop || !hasCorrectnessDrop) {
    return null;
  }

  return {
    startIndex: start,
    questionId: tail[0]?.questionId ?? null,
    evidence: {
      headMedianSeconds: headMedian,
      tailMedianSeconds: tailMedian,
      tailShortRatio,
      headCorrectOrPartialRatio: headReliableRatio,
      tailCorrectOrPartialRatio: tailReliableRatio,
      unansweredTailRatio,
      segmentLength: tail.length
    }
  };
}

function correctOrPartialRatio(attempts: ImportedQuestionAttempt[]): number {
  if (attempts.length === 0) {
    return 0;
  }

  return attempts.filter((attempt) => attempt.result === 'correct' || attempt.result === 'partial').length / attempts.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
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
