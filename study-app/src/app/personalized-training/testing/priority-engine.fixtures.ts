import {
  ImportedExamSession,
  ImportedQuestionAttempt,
  ManualCoachingEvidence,
  PersonalizedSession,
  ReviewSchedule,
  TopicMastery,
  TrainingTopicDescriptor
} from '../models/personalized-training.models';

export const priorityEngineNow = new Date('2026-07-10T12:00:00.000Z');

export const topicDescriptorsFixture: readonly TrainingTopicDescriptor[] = [
  descriptor('topic-cross-account', 'Cross-account access patterns', 'security_compliance', 'weak', [49, 101, 102]),
  descriptor('topic-config-scope', 'Config scope and remediation', 'configuration_management_iac', 'developing', [71, 201]),
  descriptor('topic-deployment-strategy', 'Deployment strategy selection', 'sdlc_automation', 'untested', [301]),
  descriptor('topic-autoscaling-ops', 'Auto Scaling operational behavior', 'resilient_cloud_solutions', 'strong', [401]),
  descriptor('topic-observability', 'Observability and logging', 'monitoring_logging', 'developing', [501]),
  descriptor('topic-incident-events', 'Incident event flow', 'incident_event_response', 'untested', [601]),
  descriptor('topic-routing-failover', 'Resilient routing and failover', 'resilient_cloud_solutions', 'developing', [701]),
  descriptor('topic-governance', 'Advanced governance patterns', 'security_compliance', 'untested', [801])
];

export const repeatedReliableCrossAccountSessionA: ImportedExamSession = session('reliable-a', '2026-07-01T10:00:00.000Z', [
  attempt(101, 0, 'wrong', 5, 45),
  attempt(102, 1, 'partial', 4, 50)
]);

export const repeatedReliableCrossAccountSessionB: ImportedExamSession = session('reliable-b', '2026-07-04T10:00:00.000Z', [
  attempt(101, 0, 'wrong', 4, 42),
  attempt(201, 1, 'correct', 3, 35)
]);

export const knownBankIssueSession: ImportedExamSession = session('known-issues', '2026-07-02T10:00:00.000Z', [
  attempt(49, 0, 'wrong', 4, 30, ['known_bank_data_issue']),
  attempt(71, 1, 'wrong', 4, 30, ['known_bank_data_issue'])
]);

export const rushedTail75QuestionSession: ImportedExamSession = {
  ...session(
    'rushed-75',
    '2026-07-03T10:00:00.000Z',
    Array.from({ length: 75 }, (_unused, index) =>
      index < 67
        ? attempt(index + 1, index, 'correct', 3, 35)
        : attempt(index + 1, index, index % 2 === 0 ? 'wrong' : 'unanswered', 3, 2, ['anomalous_short_response_time'])
    )
  ),
  suspectedRushedSegment: {
    startIndex: 67,
    questionId: 68,
    evidence: { tailShortRatio: 1, segmentLength: 8 }
  }
};

export const constantConfidenceSession: ImportedExamSession = {
  ...session(
    'constant-confidence',
    '2026-07-05T10:00:00.000Z',
    Array.from({ length: 10 }, (_unused, index) => attempt(301 + index, index, 'wrong', 3, 30))
  ),
  qualityFlags: [
    {
      code: 'suspicious_constant_confidence',
      severity: 'warning',
      scope: 'session',
      message: 'Nearly all supplied confidence values are identical.'
    }
  ]
};

export const missingConfidenceSession: ImportedExamSession = session('missing-confidence', '2026-07-06T10:00:00.000Z', [
  attempt(501, 0, 'wrong', null, 35, ['missing_confidence'])
]);

export const longPauseSession: ImportedExamSession = session('long-pause', '2026-07-06T11:00:00.000Z', [
  attempt(601, 0, 'wrong', 3, 1200, ['anomalous_long_response_time', 'possible_long_pause'])
]);

export const singleRushedWrongSession: ImportedExamSession = {
  ...session('single-rushed', '2026-07-06T12:00:00.000Z', [
    attempt(701, 0, 'wrong', 3, 2, ['anomalous_short_response_time'])
  ]),
  suspectedRushedSegment: {
    startIndex: 0,
    questionId: 701,
    evidence: { segmentLength: 1 }
  }
};

export const partialMultiSelectSession: ImportedExamSession = session('partial-multi', '2026-07-06T13:00:00.000Z', [
  { ...attempt(102, 0, 'partial', 3, 40), selectedAnswers: ['A'], correctAnswers: ['A', 'C'] }
]);

export const unknownCorrectnessSession: ImportedExamSession = session('unknown-correctness', '2026-07-06T14:00:00.000Z', [
  attempt(801, 0, 'unknown', 3, 40, ['correctness_not_verifiable'])
]);

export const manualWrongScopeEvidence: readonly ManualCoachingEvidence[] = [
  {
    evidenceId: 'manual:scope:1',
    topicId: 'topic-config-scope',
    domainId: 'configuration_management_iac',
    observedResult: 'wrong',
    occurredAt: '2026-07-07T10:00:00.000Z',
    reliability: 'high',
    errorCause: 'wrong_resource_scope'
  },
  {
    evidenceId: 'manual:scope:2',
    topicId: 'topic-config-scope',
    domainId: 'configuration_management_iac',
    observedResult: 'wrong',
    occurredAt: '2026-07-08T10:00:00.000Z',
    reliability: 'high',
    errorCause: 'wrong_resource_scope'
  }
];

export const manualOverrideEvidence: readonly ManualCoachingEvidence[] = [
  {
    evidenceId: 'manual:override:1',
    topicId: 'topic-observability',
    domainId: 'monitoring_logging',
    observedResult: 'wrong',
    occurredAt: '2026-07-08T11:00:00.000Z',
    reliability: 'high',
    errorCause: 'service_confusion'
  }
];

export const reinforcedMasteryFixture: Readonly<Record<string, TopicMastery>> = {
  'topic-autoscaling-ops': {
    topicId: 'topic-autoscaling-ops',
    attempts: 5,
    correctAttempts: 5,
    partialAttempts: 0,
    consecutiveCorrect: 5,
    highestCompletedDrillLevel: 'exam_like',
    lastConfidence: 4,
    recentErrorCauses: [],
    bankReturnSuccess: true,
    lastReviewedAt: '2026-07-09T10:00:00.000Z',
    nextReviewAt: null,
    status: 'strong'
  }
};

export const dueReviewScheduleFixture: Readonly<Record<string, ReviewSchedule>> = {
  'topic-incident-events': {
    topicId: 'topic-incident-events',
    priority: 'urgent',
    dueAt: '2026-07-09T10:00:00.000Z',
    reason: 'fixture review'
  }
};

export const recentSessionHistoryFixture: readonly PersonalizedSession[] = [
  recentSession('recent-1', 'topic-cross-account'),
  recentSession('recent-2', 'topic-cross-account')
];

function descriptor(
  topicId: string,
  title: string,
  domainId: TrainingTopicDescriptor['domainId'],
  status: TrainingTopicDescriptor['currentStatus'],
  questionIds: readonly number[]
): TrainingTopicDescriptor {
  return {
    topicId,
    title,
    domainId,
    blueprintRelevance: 1,
    currentStatus: status,
    prerequisiteTopicIds: topicId === 'topic-routing-failover' ? ['topic-autoscaling-ops'] : [],
    relatedPatternIds: [],
    sourceQuestions: questionIds.map((questionId) => ({ bank: 'verified', questionId }))
  };
}

function session(id: string, completedAt: string, attempts: readonly ImportedQuestionAttempt[]): ImportedExamSession {
  return {
    id,
    sourceSessionId: id,
    sourceSchemaVersion: 'fixture',
    sourceAppVersion: null,
    bankType: 'verified',
    assessmentMode: 'exam',
    startedAt: null,
    completedAt,
    elapsedSeconds: null,
    activeElapsedSeconds: null,
    importedAt: completedAt,
    sourceFileName: null,
    totalRecords: attempts.length,
    answeredCount: attempts.filter((item) => item.result !== 'unanswered').length,
    correctCount: attempts.filter((item) => item.result === 'correct').length,
    partialCount: attempts.filter((item) => item.result === 'partial').length,
    wrongCount: attempts.filter((item) => item.result === 'wrong').length,
    unansweredCount: attempts.filter((item) => item.result === 'unanswered').length,
    scorePercent: null,
    attempts: [...attempts],
    qualityFlags: [],
    suspectedRushedSegment: null,
    importParserVersion: 'fixture'
  };
}

function attempt(
  questionId: number,
  order: number,
  result: ImportedQuestionAttempt['result'],
  confidence: ImportedQuestionAttempt['confidence'],
  responseTimeSeconds: number | null,
  qualityFlagCodes: Array<ImportedQuestionAttempt['qualityFlags'][number]['code']> = []
): ImportedQuestionAttempt {
  return {
    questionId,
    order,
    questionType: questionId === 102 ? 'multi' : 'single',
    selectedAnswers: result === 'unanswered' ? [] : ['A'],
    correctAnswers: result === 'unknown' ? [] : ['B'],
    result,
    confidence,
    responseTimeSeconds,
    notes: null,
    topic: null,
    domainName: null,
    qualityFlags: qualityFlagCodes.map((code) => ({
      code,
      severity: 'warning',
      scope: 'question',
      questionId,
      message: code
    }))
  };
}

function recentSession(id: string, topicId: string): PersonalizedSession {
  return {
    id,
    startedAt: '2026-07-09T10:00:00.000Z',
    completedAt: '2026-07-09T10:20:00.000Z',
    goal: 'close_weak_areas',
    steps: [{ id: `${id}:step`, kind: 'drill', targetId: topicId, result: 'completed' }],
    result: null
  };
}
