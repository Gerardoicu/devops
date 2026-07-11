import {
  DrillActivityView,
  DrillAttemptDraft,
  DrillDefinition,
  PersonalizedTrainingRuntimeSession,
  RuntimeStopReason,
  TrainingSessionPlan
} from '../models/personalized-training.models';
import { DEFAULT_DRILL_ATTEMPT_DRAFT, RUNTIME_SESSION_ENGINE_VERSION } from '../config/drill-engine.config';

export function createRuntimeSession(
  plan: Readonly<TrainingSessionPlan>,
  definitions: readonly DrillDefinition[],
  now: Date
): PersonalizedTrainingRuntimeSession {
  const activities = plan.plannedActivities.map((activity) => {
    const definition = definitions.find((item) => item.topicId === activity.topicId && item.activityType === activity.type);
    return {
      activityId: `runtime:${plan.planId}:${activity.activityId}`,
      planActivityId: activity.activityId,
      drillId: definition?.drillId ?? activity.activityId,
      topicId: activity.topicId,
      status: 'pending' as const,
      startedAt: null,
      submittedAt: null,
      completedAt: null,
      draft: null,
      attemptId: null,
      unavailableReason: definition ? null : 'content_unavailable'
    };
  });
  return {
    runtimeSessionId: `runtime:${plan.planId}:${now.toISOString()}`,
    planId: plan.planId,
    runtimeEngineVersion: RUNTIME_SESSION_ENGINE_VERSION,
    startedAt: null,
    lastUpdatedAt: now.toISOString(),
    completedAt: null,
    status: 'not_started',
    energyLevel: plan.energyLevel,
    availableMinutes: plan.availableMinutes,
    currentActivityIndex: 0,
    activities,
    activeElapsedSeconds: 0,
    pausedElapsedSeconds: 0,
    completedActivityCount: 0,
    stopReason: null
  };
}

export function startRuntimeSession(session: Readonly<PersonalizedTrainingRuntimeSession>, now: Date): PersonalizedTrainingRuntimeSession {
  return { ...session, status: 'active', startedAt: session.startedAt ?? now.toISOString(), lastUpdatedAt: now.toISOString() };
}

export function startActivity(
  session: Readonly<PersonalizedTrainingRuntimeSession>,
  activityId: string,
  now: Date
): PersonalizedTrainingRuntimeSession {
  return updateActivity(session, activityId, (activity) => ({
    ...activity,
    status: activity.unavailableReason ? 'unavailable' : 'active',
    startedAt: activity.startedAt ?? now.toISOString(),
    draft: activity.draft ?? { ...DEFAULT_DRILL_ATTEMPT_DRAFT }
  }), now);
}

export function saveAttemptDraft(
  session: Readonly<PersonalizedTrainingRuntimeSession>,
  activityId: string,
  draft: Readonly<DrillAttemptDraft>,
  now: Date
): PersonalizedTrainingRuntimeSession {
  return updateActivity(session, activityId, (activity) => ({ ...activity, draft: cloneDraft(draft) }), now);
}

export function markActivitySubmitted(
  session: Readonly<PersonalizedTrainingRuntimeSession>,
  activityId: string,
  attemptId: string,
  now: Date
): PersonalizedTrainingRuntimeSession {
  return updateActivity(session, activityId, (activity) => ({
    ...activity,
    status: 'completed',
    submittedAt: now.toISOString(),
    completedAt: now.toISOString(),
    attemptId
  }), now);
}

export function pauseSession(session: Readonly<PersonalizedTrainingRuntimeSession>, now: Date): PersonalizedTrainingRuntimeSession {
  return { ...session, status: 'paused', lastUpdatedAt: now.toISOString() };
}

export function resumeSession(session: Readonly<PersonalizedTrainingRuntimeSession>, now: Date): PersonalizedTrainingRuntimeSession {
  return { ...session, status: 'active', lastUpdatedAt: now.toISOString() };
}

export function skipActivity(
  session: Readonly<PersonalizedTrainingRuntimeSession>,
  activityId: string,
  reason: string,
  now: Date
): PersonalizedTrainingRuntimeSession {
  return updateActivity(session, activityId, (activity) => ({ ...activity, status: 'skipped', unavailableReason: reason }), now);
}

export function completeSession(session: Readonly<PersonalizedTrainingRuntimeSession>, now: Date): PersonalizedTrainingRuntimeSession {
  return {
    ...session,
    status: 'completed',
    completedAt: now.toISOString(),
    lastUpdatedAt: now.toISOString(),
    completedActivityCount: session.activities.filter((activity) => activity.status === 'completed').length
  };
}

export function abandonSession(
  session: Readonly<PersonalizedTrainingRuntimeSession>,
  reason: RuntimeStopReason,
  now: Date
): PersonalizedTrainingRuntimeSession {
  return { ...session, status: 'abandoned', stopReason: reason, completedAt: now.toISOString(), lastUpdatedAt: now.toISOString() };
}

export function createPreAnswerView(definition: Readonly<DrillDefinition>, activityId: string, progressLabel: string): DrillActivityView {
  return {
    activityId,
    drillId: definition.drillId,
    activityType: definition.activityType,
    title: definition.title,
    instructions: definition.instructions,
    prompt: definition.prompt,
    answerOptions: definition.answerOptions.map((option) => ({ ...option })),
    workflowItems: definition.workflowItems.map((item) => ({ ...item })),
    mappingItems: definition.mappingItems.map((item) => ({ ...item })),
    progressLabel,
    estimatedMinutes: definition.estimatedMinutes
  };
}

function updateActivity(
  session: Readonly<PersonalizedTrainingRuntimeSession>,
  activityId: string,
  update: (activity: PersonalizedTrainingRuntimeSession['activities'][number]) => PersonalizedTrainingRuntimeSession['activities'][number],
  now: Date
): PersonalizedTrainingRuntimeSession {
  const activities = session.activities.map((activity) => (activity.activityId === activityId ? update(activity) : activity));
  const currentActivityIndex = Math.max(0, activities.findIndex((activity) => activity.activityId === activityId));
  return { ...session, activities, currentActivityIndex, lastUpdatedAt: now.toISOString() };
}

function cloneDraft(draft: Readonly<DrillAttemptDraft>): DrillAttemptDraft {
  return {
    identifiedKeywords: [...draft.identifiedKeywords],
    eliminatedOptions: [...draft.eliminatedOptions],
    eliminationReasons: { ...draft.eliminationReasons },
    uncertaintyNotes: draft.uncertaintyNotes,
    reasoningSummary: draft.reasoningSummary,
    selectedAnswers: [...draft.selectedAnswers],
    orderedItems: [...draft.orderedItems],
    mappingSelections: { ...draft.mappingSelections },
    confidence: draft.confidence,
    responseTimeSeconds: draft.responseTimeSeconds,
    activeTimeSeconds: draft.activeTimeSeconds,
    manualCauseOverride: draft.manualCauseOverride
  };
}
