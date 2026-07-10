import { DOP_C02_BLUEPRINT_DOMAINS } from '../config/dop-c02-blueprint';
import {
  constantConfidenceSession,
  dueReviewScheduleFixture,
  knownBankIssueSession,
  longPauseSession,
  manualOverrideEvidence,
  manualWrongScopeEvidence,
  missingConfidenceSession,
  partialMultiSelectSession,
  priorityEngineNow,
  recentSessionHistoryFixture,
  reinforcedMasteryFixture,
  repeatedReliableCrossAccountSessionA,
  repeatedReliableCrossAccountSessionB,
  rushedTail75QuestionSession,
  singleRushedWrongSession,
  topicDescriptorsFixture,
  unknownCorrectnessSession
} from '../testing/priority-engine.fixtures';
import { extractTrainingEvidence } from './training-evidence-extraction';
import { rankTrainingPriorities } from './training-priority-ranking';

describe('training priority ranking', () => {
  it('official blueprint weights sum to 100 and include six domains', () => {
    expect(DOP_C02_BLUEPRINT_DOMAINS.reduce((total, domain) => total + domain.weightPercent, 0)).toBe(100);
    expect(DOP_C02_BLUEPRINT_DOMAINS.length).toBe(6);
  });

  it('same input produces identical ranking', () => {
    const input = rankingInput([repeatedReliableCrossAccountSessionA]);

    expect(rankTrainingPriorities(input)).toEqual(rankTrainingPriorities(input));
  });

  it('uses stable tie-breaking by score, urgency, weight, and topic ID', () => {
    const priorities = rankTrainingPriorities({
      topicDescriptors: topicDescriptorsFixture.filter((topic) => topic.topicId === 'topic-deployment-strategy' || topic.topicId === 'topic-incident-events'),
      evidence: [],
      now: priorityEngineNow
    }).priorities;

    expect(priorities.map((priority) => priority.topicId)).toEqual(['topic-deployment-strategy', 'topic-incident-events']);
  });

  it('untested topics receive coverage priority', () => {
    const priority = rankTrainingPriorities({ topicDescriptors: topicDescriptorsFixture, evidence: [], now: priorityEngineNow }).priorities.find(
      (item) => item.topicId === 'topic-deployment-strategy'
    );

    expect(priority?.reasonCodes).toContain('untested_topic');
    expect(priority?.reasonCodes).toContain('coverage_gap');
  });

  it('repeated reliable errors outrank a single rushed error', () => {
    const priorities = rankTrainingPriorities(rankingInput([repeatedReliableCrossAccountSessionA, repeatedReliableCrossAccountSessionB, singleRushedWrongSession])).priorities;

    expect(priorities[0]?.topicId).toBe('topic-cross-account');
    expect(priorities.find((item) => item.topicId === 'topic-routing-failover')?.reasonCodes).toContain('rushed_evidence_discounted');
  });

  it('repeated errors across sessions receive stronger evidence', () => {
    const priority = rankTrainingPriorities(rankingInput([repeatedReliableCrossAccountSessionA, repeatedReliableCrossAccountSessionB])).priorities[0];

    expect(priority?.reasonCodes).toContain('repeated_cross_session_error');
    expect(priority?.evidenceSummary.crossSessionErrorCount).toBe(2);
  });

  it('a rushed error supported by later reliable evidence becomes meaningful', () => {
    const priorities = rankTrainingPriorities(rankingInput([singleRushedWrongSession, { ...repeatedReliableCrossAccountSessionA, attempts: [{ ...repeatedReliableCrossAccountSessionA.attempts[0], questionId: 701 }] }])).priorities;

    expect(priorities.find((item) => item.topicId === 'topic-routing-failover')?.evidenceSummary.reliableErrors).toBe(1);
  });

  it('known bank issue attempts do not create weakness penalties and remain visible', () => {
    const priority = rankTrainingPriorities(rankingInput([knownBankIssueSession])).priorities.find((item) => item.topicId === 'topic-cross-account');

    expect(priority?.reasonCodes).toContain('known_bank_issue_excluded');
    expect(priority?.evidenceSummary.reliableErrors).toBe(0);
    expect(priority?.evidenceSummary.excludedEvidence).toBeGreaterThan(0);
  });

  it('question 49 and 71 issues remain excluded evidence', () => {
    const evidence = extractTrainingEvidence({ importedSessions: [knownBankIssueSession], topicDescriptors: topicDescriptorsFixture, now: priorityEngineNow }).evidence;

    expect(evidence.find((item) => item.relatedQuestionId === 49)?.reliability).toBe('excluded');
    expect(evidence.find((item) => item.relatedQuestionId === 71)?.reliability).toBe('excluded');
  });

  it('missing confidence is neutral', () => {
    const priority = rankTrainingPriorities(rankingInput([missingConfidenceSession])).priorities.find((item) => item.topicId === 'topic-observability');

    expect(priority?.reasonCodes).not.toContain('reliable_high_confidence_wrong');
  });

  it('reliable high-confidence wrong answers increase misconception urgency', () => {
    const priority = rankTrainingPriorities(rankingInput([repeatedReliableCrossAccountSessionA])).priorities.find((item) => item.topicId === 'topic-cross-account');

    expect(priority?.reasonCodes).toContain('reliable_high_confidence_wrong');
  });

  it('long response time alone does not increase weakness', () => {
    const priority = rankTrainingPriorities(rankingInput([longPauseSession])).priorities.find((item) => item.topicId === 'topic-incident-events');

    expect(priority?.reasonCodes).not.toContain('repeated_reliable_errors');
  });

  it('unknown correctness is non-diagnostic', () => {
    const priority = rankTrainingPriorities(rankingInput([unknownCorrectnessSession])).priorities.find((item) => item.topicId === 'topic-governance');

    expect(priority?.evidenceSummary.reliableErrors).toBe(0);
    expect(priority?.reasonCodes).toContain('insufficient_evidence');
  });

  it('reliable partial multi-select evidence increases relevant priority', () => {
    const priority = rankTrainingPriorities(rankingInput([partialMultiSelectSession])).priorities.find((item) => item.topicId === 'topic-cross-account');

    expect(priority?.reasonCodes).toContain('multi_select_failure');
  });

  it('wrong-resource-scope recurrence is prioritized', () => {
    const priority = rankTrainingPriorities(rankingInput([], manualWrongScopeEvidence)).priorities.find((item) => item.topicId === 'topic-config-scope');

    expect(priority?.reasonCodes).toContain('wrong_resource_scope_pattern');
    expect(priority?.reasonCodes).toContain('repeated_reliable_errors');
  });

  it('recently reinforced and strong topics receive reductions but remain reviewable', () => {
    const priority = rankTrainingPriorities({
      ...rankingInput([]),
      topicMastery: reinforcedMasteryFixture
    }).priorities.find((item) => item.topicId === 'topic-autoscaling-ops');

    expect(priority?.reasonCodes).toContain('strong_topic_capped');
    expect(priority).toBeDefined();
  });

  it('high-weight domains influence otherwise similar priorities', () => {
    const priorities = rankTrainingPriorities({ topicDescriptors: topicDescriptorsFixture, evidence: [], now: priorityEngineNow }).priorities;

    expect(priorities.findIndex((item) => item.topicId === 'topic-deployment-strategy')).toBeLessThan(
      priorities.findIndex((item) => item.topicId === 'topic-incident-events')
    );
  });

  it('review-due evidence increases urgency', () => {
    const priority = rankTrainingPriorities({
      ...rankingInput([]),
      reviewSchedule: dueReviewScheduleFixture
    }).priorities.find((item) => item.topicId === 'topic-incident-events');

    expect(priority?.reasonCodes).toContain('review_due');
    expect(priority?.reviewUrgency).toBe('urgent');
  });

  it('overtraining protection prevents unnecessary repetition but persistent weakness can override it', () => {
    const capped = rankTrainingPriorities({
      ...rankingInput([repeatedReliableCrossAccountSessionA]),
      sessionHistory: recentSessionHistoryFixture
    }).priorities.find((item) => item.topicId === 'topic-cross-account');
    const persistent = rankTrainingPriorities({
      ...rankingInput([repeatedReliableCrossAccountSessionA, repeatedReliableCrossAccountSessionB]),
      sessionHistory: recentSessionHistoryFixture
    }).priorities.find((item) => item.topicId === 'topic-cross-account');

    expect(capped?.reasonCodes).toContain('overtraining_cap');
    expect(persistent?.reasonCodes).not.toContain('overtraining_cap');
  });

  it('manual coaching evidence can override weak inference', () => {
    const priority = rankTrainingPriorities(rankingInput([constantConfidenceSession], manualOverrideEvidence)).priorities.find((item) => item.topicId === 'topic-observability');

    expect(priority?.reasonCodes).toContain('service_confusion_pattern');
  });

  it('one isolated correct answer does not mark a topic strong', () => {
    const priority = rankTrainingPriorities(rankingInput([rushedTail75QuestionSession])).priorities.find((item) => item.topicId === 'topic-routing-failover');

    expect(priority?.recommendedTrainingAction).not.toBe('reinforce_success');
  });
});

function rankingInput(importedSessions: Parameters<typeof extractTrainingEvidence>[0]['importedSessions'] = [], manualEvidence: Parameters<typeof extractTrainingEvidence>[0]['manualEvidence'] = []) {
  const extraction = extractTrainingEvidence({
    importedSessions,
    manualEvidence,
    topicDescriptors: topicDescriptorsFixture,
    now: priorityEngineNow
  });
  return {
    topicDescriptors: topicDescriptorsFixture,
    evidence: extraction.evidence,
    now: priorityEngineNow
  };
}
