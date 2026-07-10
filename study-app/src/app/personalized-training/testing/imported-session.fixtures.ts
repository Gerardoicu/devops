export const currentSchemaImportFixture = {
  id: 'sim-session-current-1',
  schemaVersion: '2.0',
  appVersion: '2026.7.10',
  assessmentMode: 'exam',
  bankType: 'verified',
  startedAt: '2026-07-10T10:00:00.000Z',
  completedAt: '2026-07-10T10:10:00.000Z',
  elapsedSeconds: 600,
  activeElapsedSeconds: 120,
  answers: [
    {
      questionId: 1,
      selectedAnswers: ['A'],
      correctAnswers: ['A'],
      questionType: 'single',
      confidence: 4,
      responseTimeSeconds: 30,
      domainName: 'Fixture domain',
      topic: 'Fixture topic'
    },
    {
      questionId: 2,
      selectedAnswers: ['B'],
      correctAnswers: ['C'],
      questionType: 'single',
      confidence: 3,
      responseTimeSeconds: 40
    },
    {
      questionId: 36,
      selectedAnswers: ['E'],
      correctAnswers: ['E', 'F'],
      questionType: 'multi',
      confidence: 2,
      responseTimeSeconds: 50
    }
  ]
};

export const legacyImportFixture = {
  sessionId: 'legacy-session-1',
  schemaVersion: '1.0',
  bankType: 'public',
  records: [
    {
      question: 'question-10',
      answer: 'a',
      correct_answer: 'A',
      time_seconds: 20,
      confidence: 5
    },
    {
      question_id: 11,
      selected_answers: ['a', 'c', 'a'],
      correct_answers: ['A', 'C'],
      response_time_seconds: 25,
      confidence: 1
    }
  ]
};

export const constantConfidenceFixture = {
  sessionId: 'constant-confidence-session',
  bankType: 'verified',
  answers: Array.from({ length: 10 }, (_unused, index) => ({
    questionId: index + 1,
    selectedAnswers: ['A'],
    correctAnswers: ['A'],
    confidence: 3,
    responseTimeSeconds: 30
  }))
};

export const rushedTailFixture = {
  sessionId: 'rushed-tail-session',
  bankType: 'verified',
  answers: [
    ...Array.from({ length: 8 }, (_unused, index) => ({
      questionId: index + 1,
      selectedAnswers: ['A'],
      correctAnswers: ['A'],
      confidence: 3,
      responseTimeSeconds: 45
    })),
    ...Array.from({ length: 4 }, (_unused, index) => ({
      questionId: index + 9,
      selectedAnswers: index === 0 ? [] : ['B'],
      correctAnswers: ['A'],
      confidence: 3,
      responseTimeSeconds: 2
    }))
  ]
};
