import { Injectable } from '@angular/core';
import {
  BankQuestionResolver,
  DrillAttemptDraft,
  DrillDefinition,
  PersonalizedTrainingRuntimeSession,
  RuntimeStopReason,
  TrainingSessionPlan
} from '../models/personalized-training.models';
import {
  abandonSession,
  completeSession,
  createRuntimeSession,
  markActivitySubmitted,
  pauseSession,
  resumeSession,
  saveAttemptDraft,
  skipActivity,
  startActivity,
  startRuntimeSession
} from '../utils/drill-session-execution';
import { convertAttemptToEvidence } from '../utils/drill-evidence-conversion';
import { PersonalizedTrainingDrillService } from './personalized-training-drill.service';
import { PersonalizedTrainingStateService } from './personalized-training-state.service';

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingRuntimeService {
  constructor(
    private readonly stateService: PersonalizedTrainingStateService,
    private readonly drillService: PersonalizedTrainingDrillService
  ) {}

  createRuntimeSession(plan: TrainingSessionPlan, definitions: readonly DrillDefinition[], now: Date): PersonalizedTrainingRuntimeSession {
    const session = createRuntimeSession(plan, definitions, now);
    this.stateService.saveActiveRuntimeSession(session);
    return session;
  }

  startRuntimeSession(session: PersonalizedTrainingRuntimeSession, now: Date): PersonalizedTrainingRuntimeSession {
    const next = startRuntimeSession(session, now);
    this.stateService.saveActiveRuntimeSession(next);
    return next;
  }

  startActivity(session: PersonalizedTrainingRuntimeSession, activityId: string, now: Date): PersonalizedTrainingRuntimeSession {
    const next = startActivity(session, activityId, now);
    this.stateService.saveActiveRuntimeSession(next);
    return next;
  }

  saveAttemptDraft(session: PersonalizedTrainingRuntimeSession, activityId: string, draft: DrillAttemptDraft, now: Date): PersonalizedTrainingRuntimeSession {
    const next = saveAttemptDraft(session, activityId, draft, now);
    this.stateService.saveActiveRuntimeSession(next);
    return next;
  }

  submitActivity(input: {
    session: PersonalizedTrainingRuntimeSession;
    activityId: string;
    definition: DrillDefinition;
    draft: DrillAttemptDraft;
    now: Date;
    bankResolver?: BankQuestionResolver;
  }): PersonalizedTrainingRuntimeSession {
    const result = this.drillService.submitAttempt({
      runtimeSessionId: input.session.runtimeSessionId,
      activityId: input.activityId,
      definition: input.definition,
      draft: input.draft,
      submittedAt: input.now.toISOString(),
      bankResolver: input.bankResolver
    });
    this.stateService.appendDrillAttempt(result.attempt);
    this.stateService.appendGeneratedEvidence(convertAttemptToEvidence(result.attempt));
    const next = markActivitySubmitted(input.session, input.activityId, result.attempt.attemptId, input.now);
    this.stateService.saveActiveRuntimeSession(next);
    return next;
  }

  pauseSession(session: PersonalizedTrainingRuntimeSession, now: Date): PersonalizedTrainingRuntimeSession {
    const next = pauseSession(session, now);
    this.stateService.saveActiveRuntimeSession(next);
    return next;
  }

  resumeSession(session: PersonalizedTrainingRuntimeSession, now: Date): PersonalizedTrainingRuntimeSession {
    const next = resumeSession(session, now);
    this.stateService.saveActiveRuntimeSession(next);
    return next;
  }

  skipActivity(session: PersonalizedTrainingRuntimeSession, activityId: string, reason: string, now: Date): PersonalizedTrainingRuntimeSession {
    const next = skipActivity(session, activityId, reason, now);
    this.stateService.saveActiveRuntimeSession(next);
    return next;
  }

  completeSession(session: PersonalizedTrainingRuntimeSession, now: Date): PersonalizedTrainingRuntimeSession {
    const next = completeSession(session, now);
    this.stateService.appendRuntimeSessionHistory(next);
    this.stateService.clearActiveRuntimeSession();
    return next;
  }

  abandonSession(session: PersonalizedTrainingRuntimeSession, reason: RuntimeStopReason, now: Date): PersonalizedTrainingRuntimeSession {
    const next = abandonSession(session, reason, now);
    this.stateService.appendRuntimeSessionHistory(next);
    this.stateService.clearActiveRuntimeSession();
    return next;
  }
}
