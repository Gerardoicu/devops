import {
  bankReturn49Fixture,
  copiedBankReturnFixture,
  singleChoiceDrillFixture,
  workflowDrillFixture
} from '../testing/drill-engine.fixtures';
import { validateDrillDefinition } from './drill-definition-validation';

describe('drill definition validation', () => {
  it('accepts a valid drill definition', () => {
    expect(validateDrillDefinition(singleChoiceDrillFixture).valid).toBe(true);
  });

  it('returns typed validation errors for missing IDs and invalid minutes', () => {
    const result = validateDrillDefinition({ ...singleChoiceDrillFixture, drillId: '', topicId: '', estimatedMinutes: 0 });

    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toEqual(
      expect.arrayContaining(['missing_drill_id', 'missing_topic_id', 'invalid_estimated_minutes'])
    );
  });

  it('rejects duplicate option IDs and invalid expected options', () => {
    const result = validateDrillDefinition({
      ...singleChoiceDrillFixture,
      answerOptions: [
        { id: 'A', label: 'A' },
        { id: 'A', label: 'Duplicate' }
      ],
      expectedAnswer: { optionIds: ['Z'] }
    });

    expect(result.failures.map((failure) => failure.code)).toEqual(
      expect.arrayContaining(['duplicate_option_ids', 'expected_option_not_present'])
    );
  });

  it('rejects invalid workflow definitions', () => {
    const result = validateDrillDefinition({
      ...workflowDrillFixture,
      workflowItems: [
        { id: 'one', label: 'One' },
        { id: 'one', label: 'Duplicate' }
      ],
      expectedAnswer: { workflowOrder: ['missing'] }
    });

    expect(result.failures.map((failure) => failure.code)).toEqual(
      expect.arrayContaining(['duplicate_workflow_ids', 'invalid_workflow_sequence'])
    );
  });

  it('accepts bank returns with source references and no copied prompt or option text', () => {
    expect(validateDrillDefinition(bankReturn49Fixture).valid).toBe(true);
  });

  it('rejects bank return definitions containing copied prompt or option text', () => {
    const result = validateDrillDefinition(copiedBankReturnFixture);

    expect(result.failures.some((failure) => failure.code === 'bank_return_contains_copied_content')).toBe(true);
  });
});
