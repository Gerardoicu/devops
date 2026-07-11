import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { VerifiedBankQuestionResolverService } from './verified-bank-question-resolver.service';

describe('VerifiedBankQuestionResolverService', () => {
  let service: VerifiedBankQuestionResolverService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(VerifiedBankQuestionResolverService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads verified bank questions in read-only adapter mode', async () => {
    const promise = firstValueFrom(service.load());

    http.expectOne('assets/simulator-bank.json').flush([
      {
        id: 10,
        questionType: 'single',
        question: 'Choose one.',
        options: { B: 'Second', A: 'First' },
        correctAnswers: ['A'],
        explanation: 'A wins.'
      }
    ]);

    await expect(promise).resolves.toEqual({ loaded: true, count: 1 });
    const resolved = service.resolve({ bank: 'verified', questionId: 10 });

    expect(resolved?.prompt).toBe('Choose one.');
    expect(resolved?.answerOptions.map((option) => option.id)).toEqual(['A', 'B']);
    expect(service.resolve({ bank: 'public', questionId: 10 })).toBeNull();
  });

  it('returns cloned resolved content and marks known issues non-diagnostic', async () => {
    const promise = firstValueFrom(service.load());

    http.expectOne('assets/simulator-bank.json').flush([
      {
        id: 49,
        questionType: 'multi',
        question: 'Known issue.',
        options: { A: 'First' },
        correctAnswers: ['A'],
        explanation: 'A.'
      }
    ]);
    await promise;

    const first = service.resolve({ bank: 'verified', questionId: 49 });
    const second = service.resolve({ bank: 'verified', questionId: 49 });
    first?.answerOptions.push({ id: 'Z', label: 'Mutation attempt' });

    expect(second?.answerOptions.map((option) => option.id)).toEqual(['A']);
    expect(second?.knownIssue).toBe(true);
  });

  it('reports unavailable questions recoverably as null', async () => {
    const promise = firstValueFrom(service.load());

    http.expectOne('assets/simulator-bank.json').flush([], { status: 200, statusText: 'OK' });
    await promise;

    expect(service.resolve({ bank: 'verified', questionId: 999 })).toBeNull();
  });
});
