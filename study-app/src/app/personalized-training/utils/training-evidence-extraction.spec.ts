import {
  constantConfidenceSession,
  knownBankIssueSession,
  manualOverrideEvidence,
  priorityEngineNow,
  repeatedReliableCrossAccountSessionA,
  rushedTail75QuestionSession,
  singleRushedWrongSession,
  topicDescriptorsFixture,
  unknownCorrectnessSession
} from '../testing/priority-engine.fixtures';
import { extractTrainingEvidence } from './training-evidence-extraction';

describe('training evidence extraction', () => {
  it('keeps known bank issue evidence visible but excluded', () => {
    const result = extractTrainingEvidence({
      importedSessions: [knownBankIssueSession],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });

    expect(result.evidence.length).toBe(2);
    expect(result.evidence.every((item) => item.reliability === 'excluded')).toBe(true);
    expect(result.evidence.map((item) => item.relatedQuestionId)).toEqual([49, 71]);
    expect(result.evidence.every((item) => item.exclusionReason === 'known_bank_issue_excluded')).toBe(true);
  });

  it('discounts rushed-segment attempts without discarding them', () => {
    const result = extractTrainingEvidence({
      importedSessions: [rushedTail75QuestionSession],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });
    const rushed = result.evidence.filter((item) => item.reliability === 'low');

    expect(rushed.length).toBeGreaterThan(0);
    expect(rushed.some((item) => item.errorCause === 'rushed_reading')).toBe(true);
  });

  it('does not let one rushed wrong answer become high reliability', () => {
    const result = extractTrainingEvidence({
      importedSessions: [singleRushedWrongSession],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });

    expect(result.evidence[0]?.reliability).toBe('low');
  });

  it('treats unknown correctness as non-diagnostic', () => {
    const result = extractTrainingEvidence({
      importedSessions: [unknownCorrectnessSession],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });

    expect(result.evidence[0]?.reliability).toBe('excluded');
    expect(result.evidence[0]?.exclusionReason).toBe('insufficient_evidence');
  });

  it('excludes suspicious constant confidence from confidence calibration', () => {
    const result = extractTrainingEvidence({
      importedSessions: [constantConfidenceSession],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });

    expect(result.evidence.every((item) => item.errorCause !== 'confidence_miscalibration')).toBe(true);
  });

  it('keeps manual coaching evidence as high-reliability root-cause evidence', () => {
    const result = extractTrainingEvidence({
      manualEvidence: manualOverrideEvidence,
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });

    expect(result.evidence[0]?.sourceType).toBe('manual_coaching');
    expect(result.evidence[0]?.errorCause).toBe('service_confusion');
    expect(result.evidence[0]?.reliability).toBe('high');
  });

  it('maps imported question IDs to topic descriptors without copying text', () => {
    const result = extractTrainingEvidence({
      importedSessions: [repeatedReliableCrossAccountSessionA],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    });

    expect(result.evidence[0]?.topicId).toBe('topic-cross-account');
    expect(JSON.stringify(result.evidence)).not.toContain('questionText');
  });
});
