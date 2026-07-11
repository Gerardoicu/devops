import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  BankQuestionResolver,
  DrillAnswerOption,
  ResolvedBankQuestion,
  SourceQuestionReference
} from '../models/personalized-training.models';

interface SimulatorBankQuestionRecord {
  id: number;
  question: string;
  options: Record<string, string>;
  correctAnswers: string[];
}

const KNOWN_NON_DIAGNOSTIC_BANK_ISSUES = new Set([36, 49, 71]);

@Injectable({ providedIn: 'root' })
export class VerifiedBankQuestionResolverService implements BankQuestionResolver {
  private readonly http = inject(HttpClient);
  private readonly questions = new Map<number, Readonly<ResolvedBankQuestion>>();

  load(): Observable<{ loaded: boolean; count: number }> {
    return this.http.get<unknown>('assets/simulator-bank.json').pipe(
      map((value) => (Array.isArray(value) ? value.filter(isSimulatorBankQuestionRecord) : [])),
      tap((records) => {
        this.questions.clear();
        for (const record of records) {
          const reference: SourceQuestionReference = { bank: 'verified', questionId: record.id };
          this.questions.set(record.id, {
            reference,
            prompt: record.question,
            answerOptions: optionRecordToArray(record.options),
            correctOptionIds: [...record.correctAnswers],
            knownIssue: KNOWN_NON_DIAGNOSTIC_BANK_ISSUES.has(record.id)
          });
        }
      }),
      map((records) => ({ loaded: true, count: records.length })),
      catchError(() => of({ loaded: false, count: 0 }))
    );
  }

  resolve(reference: SourceQuestionReference): Readonly<ResolvedBankQuestion> | null {
    if (reference.bank !== 'verified') {
      return null;
    }
    const resolved = this.questions.get(reference.questionId) ?? null;
    return resolved
      ? {
          reference: { ...resolved.reference },
          prompt: resolved.prompt,
          answerOptions: resolved.answerOptions.map((option) => ({ ...option })),
          correctOptionIds: [...resolved.correctOptionIds],
          knownIssue: resolved.knownIssue
        }
      : null;
  }
}

function isSimulatorBankQuestionRecord(value: unknown): value is SimulatorBankQuestionRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'number' &&
    typeof (value as { question?: unknown }).question === 'string' &&
    isOptionRecord((value as { options?: unknown }).options) &&
    Array.isArray((value as { correctAnswers?: unknown }).correctAnswers) &&
    (value as { correctAnswers: unknown[] }).correctAnswers.every((item) => typeof item === 'string')
  );
}

function isOptionRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function optionRecordToArray(options: Record<string, string>): DrillAnswerOption[] {
  return Object.entries(options)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, label]) => ({ id, label }));
}
