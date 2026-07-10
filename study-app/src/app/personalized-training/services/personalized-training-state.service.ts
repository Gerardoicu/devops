import { Injectable } from '@angular/core';
import {
  DrillAttempt,
  ImportedExamSession,
  PersonalizedSession,
  PersonalizedTrainingState,
  PersonalizedDrillAttempt,
  PersonalizedTrainingRuntimeSession,
  TrainingEvidenceItem,
  TrainingPrioritySnapshot,
  TrainingSessionPlan,
  TopicMastery
} from '../models/personalized-training.models';
import { IMPORT_PARSER_VERSION } from '../utils/exam-session-normalization';
import { PRIORITY_ENGINE_VERSION } from '../config/priority-engine.config';
import { DRILL_EVALUATION_ENGINE_VERSION } from '../config/drill-engine.config';
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
      return this.isPersistedState(parsed) ? this.withStateDefaults(parsed) : this.createEmptyState();
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
      importHistory: [],
      importParserVersion: IMPORT_PARSER_VERSION,
      latestPrioritySnapshot: null,
      latestTrainingSessionPlan: null,
      trainingSessionPlanHistory: [],
      priorityEngineVersion: PRIORITY_ENGINE_VERSION,
      activeRuntimeSession: null,
      runtimeSessionHistory: [],
      personalizedDrillAttempts: [],
      generatedEvidence: [],
      drillEngineVersion: DRILL_EVALUATION_ENGINE_VERSION,
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

  getImportedSessions(): ImportedExamSession[] {
    return this.loadState().importedExamSessions;
  }

  findImportedSession(importId: string): ImportedExamSession | null {
    return this.getImportedSessions().find((session) => session.id === importId) ?? null;
  }

  hasImportedSession(importId: string): boolean {
    return this.findImportedSession(importId) !== null;
  }

  commitImportedSession(session: ImportedExamSession): PersonalizedTrainingState {
    const state = this.loadState();
    if (state.importedExamSessions.some((importedSession) => importedSession.id === session.id)) {
      return state;
    }

    const next: PersonalizedTrainingState = {
      ...state,
      importedExamSessions: [...state.importedExamSessions, session],
      importHistory: [
        ...state.importHistory,
        {
          importId: session.id,
          importedAt: session.importedAt,
          sourceFileName: session.sourceFileName,
          status: this.getImportFlags(session).some((flag) => flag.severity === 'warning' || flag.severity === 'info')
            ? 'valid_with_warnings'
            : 'valid',
          flagCodes: this.getImportFlags(session).map((flag) => flag.code)
        }
      ],
      importParserVersion: IMPORT_PARSER_VERSION,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  removeImportedSession(importId: string): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      importedExamSessions: state.importedExamSessions.filter((session) => session.id !== importId),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  savePrioritySnapshot(snapshot: TrainingPrioritySnapshot): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      latestPrioritySnapshot: snapshot,
      priorityEngineVersion: snapshot.priorityEngineVersion,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  getLatestPrioritySnapshot(): TrainingPrioritySnapshot | null {
    return this.loadState().latestPrioritySnapshot;
  }

  saveTrainingSessionPlan(plan: TrainingSessionPlan): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      latestTrainingSessionPlan: plan,
      trainingSessionPlanHistory: [...state.trainingSessionPlanHistory, plan],
      priorityEngineVersion: plan.priorityEngineVersion,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  getLatestTrainingSessionPlan(): TrainingSessionPlan | null {
    return this.loadState().latestTrainingSessionPlan;
  }

  getTrainingSessionPlanHistory(): TrainingSessionPlan[] {
    return this.loadState().trainingSessionPlanHistory;
  }

  clearGeneratedPlans(): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      latestTrainingSessionPlan: null,
      trainingSessionPlanHistory: [],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  getActiveRuntimeSession(): PersonalizedTrainingRuntimeSession | null {
    return this.loadState().activeRuntimeSession;
  }

  saveActiveRuntimeSession(session: PersonalizedTrainingRuntimeSession): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      activeRuntimeSession: session,
      drillEngineVersion: DRILL_EVALUATION_ENGINE_VERSION,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  clearActiveRuntimeSession(): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      activeRuntimeSession: null,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  appendDrillAttempt(attempt: PersonalizedDrillAttempt): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      personalizedDrillAttempts: [...state.personalizedDrillAttempts, attempt],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  getDrillAttempts(): PersonalizedDrillAttempt[] {
    return this.loadState().personalizedDrillAttempts;
  }

  appendRuntimeSessionHistory(session: PersonalizedTrainingRuntimeSession): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      runtimeSessionHistory: [...state.runtimeSessionHistory, session],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  getRuntimeSessionHistory(): PersonalizedTrainingRuntimeSession[] {
    return this.loadState().runtimeSessionHistory;
  }

  appendGeneratedEvidence(evidence: TrainingEvidenceItem): PersonalizedTrainingState {
    const state = this.loadState();
    const next: PersonalizedTrainingState = {
      ...state,
      generatedEvidence: [...state.generatedEvidence, evidence],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSONALIZED_TRAINING_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  getGeneratedEvidence(): TrainingEvidenceItem[] {
    return this.loadState().generatedEvidence;
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
      (!Object.prototype.hasOwnProperty.call(value, 'importHistory') || Array.isArray(value['importHistory'])) &&
      (!Object.prototype.hasOwnProperty.call(value, 'importParserVersion') || typeof value['importParserVersion'] === 'string') &&
      (!Object.prototype.hasOwnProperty.call(value, 'latestPrioritySnapshot') ||
        value['latestPrioritySnapshot'] === null ||
        isRecord(value['latestPrioritySnapshot'])) &&
      (!Object.prototype.hasOwnProperty.call(value, 'latestTrainingSessionPlan') ||
        value['latestTrainingSessionPlan'] === null ||
        isRecord(value['latestTrainingSessionPlan'])) &&
      (!Object.prototype.hasOwnProperty.call(value, 'trainingSessionPlanHistory') || Array.isArray(value['trainingSessionPlanHistory'])) &&
      (!Object.prototype.hasOwnProperty.call(value, 'priorityEngineVersion') ||
        typeof value['priorityEngineVersion'] === 'string' ||
        value['priorityEngineVersion'] === null) &&
      (!Object.prototype.hasOwnProperty.call(value, 'activeRuntimeSession') ||
        value['activeRuntimeSession'] === null ||
        isRecord(value['activeRuntimeSession'])) &&
      (!Object.prototype.hasOwnProperty.call(value, 'runtimeSessionHistory') || Array.isArray(value['runtimeSessionHistory'])) &&
      (!Object.prototype.hasOwnProperty.call(value, 'personalizedDrillAttempts') || Array.isArray(value['personalizedDrillAttempts'])) &&
      (!Object.prototype.hasOwnProperty.call(value, 'generatedEvidence') || Array.isArray(value['generatedEvidence'])) &&
      (!Object.prototype.hasOwnProperty.call(value, 'drillEngineVersion') ||
        typeof value['drillEngineVersion'] === 'string' ||
        value['drillEngineVersion'] === null) &&
      Array.isArray(value['recommendations']) &&
      typeof value['updatedAt'] === 'string'
    );
  }

  private withStateDefaults(state: PersonalizedTrainingState): PersonalizedTrainingState {
    return {
      ...state,
      importHistory: state.importHistory ?? [],
      importParserVersion: state.importParserVersion ?? IMPORT_PARSER_VERSION,
      latestPrioritySnapshot: state.latestPrioritySnapshot ?? null,
      latestTrainingSessionPlan: state.latestTrainingSessionPlan ?? null,
      trainingSessionPlanHistory: state.trainingSessionPlanHistory ?? [],
      priorityEngineVersion: state.priorityEngineVersion ?? PRIORITY_ENGINE_VERSION,
      activeRuntimeSession: state.activeRuntimeSession ?? null,
      runtimeSessionHistory: state.runtimeSessionHistory ?? [],
      personalizedDrillAttempts: state.personalizedDrillAttempts ?? [],
      generatedEvidence: state.generatedEvidence ?? [],
      drillEngineVersion: state.drillEngineVersion ?? DRILL_EVALUATION_ENGINE_VERSION
    };
  }

  private getImportFlags(session: ImportedExamSession) {
    return [...session.qualityFlags, ...session.attempts.flatMap((attempt) => attempt.qualityFlags)];
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
