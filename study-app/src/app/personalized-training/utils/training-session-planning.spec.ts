import {
  priorityEngineNow,
  repeatedReliableCrossAccountSessionA,
  repeatedReliableCrossAccountSessionB,
  topicDescriptorsFixture
} from '../testing/priority-engine.fixtures';
import { extractTrainingEvidence } from './training-evidence-extraction';
import { rankTrainingPriorities } from './training-priority-ranking';
import { planTrainingSession } from './training-session-planning';

describe('training session planning', () => {
  const rankedPriorities = rankTrainingPriorities({
    topicDescriptors: topicDescriptorsFixture,
    evidence: extractTrainingEvidence({
      importedSessions: [repeatedReliableCrossAccountSessionA, repeatedReliableCrossAccountSessionB],
      topicDescriptors: topicDescriptorsFixture,
      now: priorityEngineNow
    }).evidence,
    now: priorityEngineNow
  }).priorities;

  it('low-energy plan stays within budget and begins with a lightweight activity', () => {
    const plan = planTrainingSession({
      rankedPriorities,
      availableMinutes: 15,
      energyLevel: 'low',
      generatedAt: priorityEngineNow.toISOString()
    });

    expect(plan.estimatedMinutes).toBeLessThanOrEqual(15);
    expect(plan.selectedTopics.length).toBe(1);
    expect(plan.plannedActivities[0]?.type).toBe('mechanism_review');
  });

  it('normal-energy plan progresses from mechanism to scenario when time allows', () => {
    const plan = planTrainingSession({
      rankedPriorities,
      availableMinutes: 30,
      energyLevel: 'normal',
      generatedAt: priorityEngineNow.toISOString()
    });

    expect(plan.plannedActivities[0]?.type).toBe('mechanism_review');
    expect(plan.plannedActivities.some((activity) => activity.type === 'exam_scenario')).toBe(true);
  });

  it('high-energy plan can include a complex scenario or bank return', () => {
    const plan = planTrainingSession({
      rankedPriorities,
      availableMinutes: 30,
      energyLevel: 'high',
      generatedAt: priorityEngineNow.toISOString()
    });

    expect(plan.plannedActivities.some((activity) => activity.type === 'exam_scenario' || activity.type === 'bank_return')).toBe(true);
  });

  it('a five-minute plan remains valid', () => {
    const plan = planTrainingSession({
      rankedPriorities,
      availableMinutes: 5,
      energyLevel: 'low',
      generatedAt: priorityEngineNow.toISOString()
    });

    expect(plan.estimatedMinutes).toBe(5);
    expect(plan.plannedActivities.length).toBe(1);
  });

  it('no plan exceeds available minutes and no activity has zero minutes', () => {
    for (const minutes of [5, 10, 15, 20, 30]) {
      const plan = planTrainingSession({
        rankedPriorities,
        availableMinutes: minutes,
        energyLevel: 'normal',
        generatedAt: priorityEngineNow.toISOString()
      });
      expect(plan.estimatedMinutes).toBeLessThanOrEqual(minutes);
      expect(plan.plannedActivities.every((activity) => activity.estimatedMinutes > 0)).toBe(true);
    }
  });

  it('deferred priorities are explained', () => {
    const plan = planTrainingSession({
      rankedPriorities,
      availableMinutes: 10,
      energyLevel: 'low',
      generatedAt: priorityEngineNow.toISOString()
    });

    expect(plan.deferredPriorities.length).toBeGreaterThan(0);
    expect(plan.deferredPriorities.every((item) => item.reasonCodes.length > 0)).toBe(true);
  });

  it('planning does not copy question text or option text', () => {
    const plan = planTrainingSession({
      rankedPriorities,
      availableMinutes: 20,
      energyLevel: 'normal',
      generatedAt: priorityEngineNow.toISOString()
    });

    expect(JSON.stringify(plan)).not.toContain('questionText');
    expect(JSON.stringify(plan)).not.toContain('optionText');
  });
});
