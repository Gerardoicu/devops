import {
  bankReturn36Fixture,
  correctDraftFixture,
  fakeBankResolver,
  mappingDrillFixture,
  mechanismReviewFixture,
  multiSelectDrillFixture,
  singleChoiceDrillFixture,
  spacedReviewFixture,
  workflowDrillFixture
} from '../testing/drill-engine.fixtures';
import { evaluateDrillAttempt } from './drill-attempt-evaluation';

describe('drill attempt evaluation', () => {
  it('evaluates single-choice correct, wrong, and unanswered attempts', () => {
    expect(evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft: correctDraftFixture }).result).toBe('correct');
    expect(evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft: { ...correctDraftFixture, selectedAnswers: ['B'] } }).result).toBe('wrong');
    expect(evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft: { ...correctDraftFixture, selectedAnswers: [] } }).result).toBe('unanswered');
  });

  it('normalizes duplicate selected answers', () => {
    const result = evaluateDrillAttempt({ definition: singleChoiceDrillFixture, draft: { ...correctDraftFixture, selectedAnswers: ['A', 'A'] } });

    expect(result.normalizedSelectedAnswers).toEqual(['A']);
  });

  it('evaluates multi-select exact, subset, and wrong-option attempts', () => {
    expect(evaluateDrillAttempt({ definition: multiSelectDrillFixture, draft: { ...correctDraftFixture, selectedAnswers: ['A', 'C'] } }).result).toBe('correct');
    expect(evaluateDrillAttempt({ definition: multiSelectDrillFixture, draft: { ...correctDraftFixture, selectedAnswers: ['A'] } }).result).toBe('partial');
    expect(evaluateDrillAttempt({ definition: multiSelectDrillFixture, draft: { ...correctDraftFixture, selectedAnswers: ['A', 'B'] } }).result).toBe('wrong');
  });

  it('evaluates workflow exact order, invalid order, and configured equivalent order', () => {
    expect(evaluateDrillAttempt({ definition: workflowDrillFixture, draft: { ...correctDraftFixture, orderedItems: ['one', 'two', 'three'] } }).result).toBe('correct');
    expect(evaluateDrillAttempt({ definition: workflowDrillFixture, draft: { ...correctDraftFixture, orderedItems: ['two', 'one', 'three'] } }).result).toBe('partial');
    expect(evaluateDrillAttempt({ definition: workflowDrillFixture, draft: { ...correctDraftFixture, orderedItems: ['one', 'three', 'two'] } }).result).toBe('correct');
  });

  it('evaluates mapping by stable IDs with configured partial credit', () => {
    expect(evaluateDrillAttempt({ definition: mappingDrillFixture, draft: { ...correctDraftFixture, mappingSelections: { source: 'target' } } }).result).toBe('correct');
    expect(evaluateDrillAttempt({ definition: mappingDrillFixture, draft: { ...correctDraftFixture, mappingSelections: { source: 'wrong' } } }).result).toBe('wrong');
  });

  it('returns completed for mechanism review and spaced review', () => {
    expect(evaluateDrillAttempt({ definition: mechanismReviewFixture, draft: correctDraftFixture }).result).toBe('completed');
    expect(evaluateDrillAttempt({ definition: spacedReviewFixture, draft: correctDraftFixture }).result).toBe('completed');
  });

  it('marks known bank issue bank returns as non-diagnostic', () => {
    const reference = bankReturn36Fixture.sourceQuestionRefs[0];
    const result = evaluateDrillAttempt({
      definition: bankReturn36Fixture,
      draft: correctDraftFixture,
      resolvedBankQuestion: reference ? fakeBankResolver.resolve(reference) : null
    });

    expect(result.reliability).toBe('excluded');
    expect(result.qualityFlags.some((flag) => flag.code === 'known_bank_data_issue')).toBe(true);
  });
});
