import { Injectable } from '@angular/core';
import {
  BankQuestionResolver,
  DrillActivityView,
  DrillAttemptDraft,
  DrillDefinition,
  DrillReviewView,
  PersonalizedDrillAttempt
} from '../models/personalized-training.models';
import { DRILL_EVALUATION_ENGINE_VERSION, RUNTIME_SESSION_ENGINE_VERSION } from '../config/drill-engine.config';
import { evaluateDrillAttempt } from '../utils/drill-attempt-evaluation';
import { applyRootCauseAnalysis } from '../utils/drill-root-cause-analysis';
import { createDrillReviewView } from '../utils/drill-evidence-conversion';
import { createPreAnswerView } from '../utils/drill-session-execution';

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingDrillService {
  createPreAnswerView(definition: DrillDefinition, activityId: string, progressLabel: string): DrillActivityView {
    return createPreAnswerView(definition, activityId, progressLabel);
  }

  submitAttempt(input: {
    runtimeSessionId: string;
    activityId: string;
    definition: DrillDefinition;
    draft: DrillAttemptDraft;
    submittedAt: string;
    bankResolver?: BankQuestionResolver;
    rushedSession?: boolean;
    invalidDefinition?: boolean;
  }): { attempt: PersonalizedDrillAttempt; review: DrillReviewView } {
    const reference = input.definition.sourceQuestionRefs[0] ?? null;
    const resolved = input.definition.activityType === 'bank_return' && reference ? input.bankResolver?.resolve(reference) ?? null : null;
    const assessment = applyRootCauseAnalysis(
      input.definition,
      input.draft,
      evaluateDrillAttempt({
        definition: input.definition,
        draft: input.draft,
        resolvedBankQuestion: resolved,
        rushedSession: input.rushedSession,
        invalidDefinition: input.invalidDefinition
      })
    );
    const attempt: PersonalizedDrillAttempt = {
      attemptId: `attempt:${input.runtimeSessionId}:${input.activityId}`,
      runtimeSessionId: input.runtimeSessionId,
      activityId: input.activityId,
      drillId: input.definition.drillId,
      topicId: input.definition.topicId,
      domainId: input.definition.domainId,
      activityType: input.definition.activityType,
      drillForm: input.definition.drillForm,
      difficulty: input.definition.difficulty,
      sourceQuestionRefs: [...input.definition.sourceQuestionRefs],
      selectedAnswers: [...assessment.normalizedSelectedAnswers],
      orderedItems: [...input.draft.orderedItems],
      mappingSelections: { ...input.draft.mappingSelections },
      confidence: input.draft.confidence,
      reasoning: {
        identifiedKeywords: [...input.draft.identifiedKeywords],
        eliminatedOptions: [...input.draft.eliminatedOptions],
        eliminationReasons: { ...input.draft.eliminationReasons },
        uncertaintyNotes: input.draft.uncertaintyNotes,
        reasoningSummary: input.draft.reasoningSummary,
        selectedAnswers: [...input.draft.selectedAnswers],
        orderedItems: [...input.draft.orderedItems],
        mappingSelections: { ...input.draft.mappingSelections },
        confidence: input.draft.confidence,
        responseTimeSeconds: input.draft.responseTimeSeconds,
        activeTimeSeconds: input.draft.activeTimeSeconds,
        manualCauseOverride: input.draft.manualCauseOverride
      },
      submittedAt: input.submittedAt,
      responseTimeSeconds: input.draft.responseTimeSeconds,
      activeTimeSeconds: input.draft.activeTimeSeconds,
      assessment,
      drillEngineVersion: DRILL_EVALUATION_ENGINE_VERSION,
      runtimeEngineVersion: RUNTIME_SESSION_ENGINE_VERSION
    };
    return { attempt, review: createDrillReviewView(attempt) };
  }
}
