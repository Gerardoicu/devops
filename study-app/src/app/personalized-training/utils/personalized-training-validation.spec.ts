import { drillSetFixture, sourceQuestionReferenceFixture } from '../testing/personalized-training.fixtures';
import {
  isConfidence,
  isDrillSet,
  isSourceQuestionReference
} from './personalized-training-validation';

describe('personalized training validation', () => {
  it('accepts only confidence values 1 through 5 or null', () => {
    expect([1, 2, 3, 4, 5, null].every(isConfidence)).toBe(true);
    expect([0, 6, '5', undefined].some(isConfidence)).toBe(false);
  });

  it('rejects malformed drill content', () => {
    const malformed = {
      ...drillSetFixture,
      questions: [
        {
          id: 'bad-question',
          type: 'single',
          prompt: 'Bad',
          options: [],
          correctOptionIds: ['A'],
          sourceQuestions: [{ bank: 'verified', questionId: 36, questionText: 'Not allowed' }]
        }
      ]
    };

    expect(isDrillSet(drillSetFixture)).toBe(true);
    expect(isDrillSet(malformed)).toBe(false);
  });

  it('keeps source question references limited to bank and question ID', () => {
    expect(isSourceQuestionReference(sourceQuestionReferenceFixture)).toBe(true);
    expect(Object.keys(sourceQuestionReferenceFixture)).toEqual(['bank', 'questionId']);
    expect(isSourceQuestionReference({ bank: 'verified', questionId: 36, question: 'copied text' })).toBe(false);
  });
});
