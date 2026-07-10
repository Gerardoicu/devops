import { Injectable } from '@angular/core';
import {
  DrillAttempt,
  PersonalizedSession,
  PersonalizedTrainingState,
  TopicMastery
} from '../models/personalized-training.models';
import { isConfidence, isErrorCause, isRecord } from '../utils/personalized-training-validation';

export const PERSONALIZED_TRAINING_STORAGE_KEY = 'dop-c02-personalized-training-v1';

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingStateService {
  loadState(): PersonalizedTrainingState {
    const raw = localStorage.getItem(PERSONALIZED_TRAINING_STORAGE_KEY);
    if (!raw) {
      return this.createEmptyState();
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return this.isPersistedState(parsed) ? parsed : this.createEmptyState();
    } catch {
      return this.createEmptyState();
    }
  }

  createEmptyState(): PersonalizedTrainingState {
    return {
      schemaVersion: '1.0',
      topicMastery: {},
      drillAttempts: [],
      sessions: [],
      reviewSchedule: {},
      importedExamSessions: [],
      recommendations: [],
      updatedAt: new Date().toISOString()
    };
  }

  saveState(state: PersonalizedTrainingState): void {
    const next: PersonalizedTrainingState = {
      ...state,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
  }

  resetState(): PersonalizedTrainingState {
    const empty = this.createEmptyState();
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }

  recordDrillAttempt(attempt: DrillAttempt): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      drillAttempts: [...state.drillAttempts, attempt],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  recordPersonalizedSession(session: PersonalizedSession): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      sessions: [...state.sessions, session],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  updateTopicMastery(topicId: string, attempt: DrillAttempt): PersonalizedTrainingState {
    const state = this.loadState();
    const current = state.topicMastery[topicId] ?? this.createUntestedMastery(topicId);
    const isCorrect = attempt.result === 'correct';
    const isPartial = attempt.result === 'partial';
    const nextAttempts = current.attempts + 1;
    const nextCorrect = current.correctAttempts + (isCorrect ? 1 : 0);
    const nextPartial = current.partialAttempts + (isPartial ? 1 : 0);
    const nextConsecutiveCorrect = isCorrect ? current.consecutiveCorrect + 1 : 0;
    const recentErrorCauses = [...attempt.errorCauses, ...current.recentErrorCauses].slice(0, 5);

    const nextMastery: TopicMastery = {
      ...current,
      attempts: nextAttempts,
      correctAttempts: nextCorrect,
      partialAttempts: nextPartial,
      consecutiveCorrect: nextConsecutiveCorrect,
      lastConfidence: attempt.confidence,
      recentErrorCauses,
      lastReviewedAt: attempt.attemptedAt,
      status: this.calculateStatus(current.status, nextAttempts, nextCorrect, nextPartial, nextConsecutiveCorrect)
    };

    const next: PersonalizedTrainingState = {
      ...state,
      topicMastery: {
        ...state.topicMastery,
        [topicId]: nextMastery
      },
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  getReviewDueTopics(now: Date = new Date()): TopicMastery[] {
    const nowMs = now.getTime();
    return Object.values(this.loadState().topicMastery).filter((mastery) => {
      if (!mastery.nextReviewAt) {
        return false;
      }

      return Date.parse(mastery.nextReviewAt) <= nowMs;
    });
  }

  private createUntestedMastery(topicId: string): TopicMastery {
    return {
      topicId,
      attempts: 0,
      correctAttempts: 0,
      partialAttempts: 0,
      consecutiveCorrect: 0,
      highestCompletedDrillLevel: null,
      lastConfidence: null,
      recentErrorCauses: [],
      bankReturnSuccess: null,
      lastReviewedAt: null,
      nextReviewAt: null,
      status: 'untested'
    };
  }

  private calculateStatus(
    previousStatus: TopicMastery['status'],
    attempts: number,
    correctAttempts: number,
    partialAttempts: number,
    consecutiveCorrect: number
  ): TopicMastery['status'] {
    if (attempts === 0) {
      return 'untested';
    }

    if (attempts === 1) {
      return previousStatus === 'weak' ? 'weak' : 'developing';
    }

    if (previousStatus === 'weak' && consecutiveCorrect < 2) {
      return 'weak';
    }

    if (consecutiveCorrect >= 4 && correctAttempts >= 4) {
      return 'strong';
    }

    if (consecutiveCorrect >= 2 && correctAttempts + partialAttempts >= Math.ceil(attempts * 0.6)) {
      return 'moderate';
    }

    if (correctAttempts + partialAttempts > 0) {
      return 'developing';
    }

    return 'weak';
  }

  private isPersistedState(value: unknown): value is PersonalizedTrainingState {
    if (!isRecord(value) || value['schemaVersion'] !== '1.0') {
      return false;
    }

    return (
      isRecord(value['topicMastery']) &&
      Array.isArray(value['drillAttempts']) &&
      value['drillAttempts'].every((attempt) => this.isDrillAttempt(attempt)) &&
      Array.isArray(value['sessions']) &&
      isRecord(value['reviewSchedule']) &&
      Array.isArray(value['importedExamSessions']) &&
      Array.isArray(value['recommendations']) &&
      typeof value['updatedAt'] === 'string'
    );
  }

  private isDrillAttempt(value: unknown): value is DrillAttempt {
    if (!isRecord(value)) {
      return false;
    }

    return (
      typeof value['id'] === 'string' &&
      typeof value['drillSetId'] === 'string' &&
      typeof value['questionId'] === 'string' &&
      Array.isArray(value['selectedOptionIds']) &&
      value['selectedOptionIds'].every((item) => typeof item === 'string') &&
      (value['result'] === 'correct' || value['result'] === 'partial' || value['result'] === 'incorrect') &&
      isConfidence(value['confidence']) &&
      Array.isArray(value['errorCauses']) &&
      value['errorCauses'].every(isErrorCause) &&
      (typeof value['responseTimeSeconds'] === 'number' || value['responseTimeSeconds'] === null) &&
      typeof value['attemptedAt'] === 'string'
    );
  }
}
