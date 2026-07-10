import {
  correctDraftFixture,
  multiSelectDrillFixture,
  singleChoiceDrillFixture
} from '../testing/drill-engine.fixtures';
import { evaluateDrillAttempt } from './drill-attempt-evaluation';
import { applyRootCauseAnalysis } from './drill-root-cause-analysis';

describe('drill root-cause analysis', () => {
  it('classifies incomplete multi-select when grounded', () => {
    const draft = { ...correctDraftFixture, selectedAnswers: ['A'] };
    const assessment = applyRootCauseAnalysis(multiSelectDrillFixture, draft, evaluateDrillAttempt({ definition: multiSelectDrillFixture, draft }));

    expect(assessment.finalCause).toBe('incomplete_multi_select');
  });

  it('classifies wrong-scope and service-confusion distractor metadata', () => {
    const draft = { ...correctDraftFixture, selectedAnswers: ['B'] };
    const wrongScope = applyRootCauseAnalysis(singleChoiceDrillFixture, draft, evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft }));
    const serviceConfusionDefinition = {
      ...singleChoiceDrillFixture,
      distractorMetadata: [{ ...singleChoiceDrillFixture.distractorMetadata[0], errorCause: 'service_confusion' as const }]
    };
    const serviceConfusion = applyRootCauseAnalysis(serviceConfusionDefinition, draft, evaluateDrillAttempt({ definition: serviceConfusionDefinition, draft }));

    expect(wrongScope.finalCause).toBe('wrong_resource_scope');
    expect(serviceConfusion.finalCause).toBe('service_confusion');
  });

  it('does not infer missed keyword without keyword analysis', () => {
    const draft = { ...correctDraftFixture, selectedAnswers: ['B'], identifiedKeywords: [] };
    const assessment = applyRootCauseAnalysis(singleChoiceDrillFixture, draft, evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft }));

    expect(assessment.finalCause).not.toBe('missed_keyword');
  });

  it('does not infer english interpretation or knowledge gap from wrongness alone', () => {
    const definition = { ...singleChoiceDrillFixture, distractorMetadata: [], decisiveKeywords: [] };
    const draft = { ...correctDraftFixture, selectedAnswers: ['B'], confidence: null };
    const assessment = applyRootCauseAnalysis(definition, draft, evaluateDrillAttempt({ definition, draft }));

    expect(assessment.finalCause).toBeNull();
    expect(assessment.inferredCause).toBeNull();
  });

  it('does not infer rushed reading from response time alone', () => {
    const draft = { ...correctDraftFixture, selectedAnswers: ['B'], responseTimeSeconds: 1 };
    const assessment = applyRootCauseAnalysis(singleChoiceDrillFixture, draft, evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft }));

    expect(assessment.finalCause).not.toBe('rushed_reading');
  });

  it('classifies high-confidence wrong and preserves manual override history', () => {
    const definition = { ...singleChoiceDrillFixture, distractorMetadata: [], decisiveKeywords: [] };
    const draft = { ...correctDraftFixture, selectedAnswers: ['B'], confidence: 5 as const, manualCauseOverride: 'service_confusion' as const };
    const assessment = applyRootCauseAnalysis(definition, draft, evaluateDrillAttempt({ definition, draft }));

    expect(assessment.inferredCause).toBe('confidence_miscalibration');
    expect(assessment.finalCause).toBe('service_confusion');
    expect(assessment.causeSource).toBe('manual_override');
    expect(assessment.causeEvidence.some((item) => item.includes('confidence'))).toBe(true);
  });
});
