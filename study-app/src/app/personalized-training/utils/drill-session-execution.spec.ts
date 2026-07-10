import {
  correctDraftFixture,
  drillNow,
  drillPlanFixture,
  singleChoiceDrillFixture
} from '../testing/drill-engine.fixtures';
import {
  abandonSession,
  createPreAnswerView,
  createRuntimeSession,
  pauseSession,
  resumeSession,
  saveAttemptDraft,
  skipActivity,
  startActivity,
  startRuntimeSession
} from './drill-session-execution';

describe('drill session execution', () => {
  it('creates deterministic runtime session IDs from the same plan and timestamp', () => {
    const one = createRuntimeSession(drillPlanFixture, [singleChoiceDrillFixture], drillNow);
    const two = createRuntimeSession(drillPlanFixture, [singleChoiceDrillFixture], drillNow);

    expect(one.runtimeSessionId).toBe(two.runtimeSessionId);
    expect(one.activities.length).toBe(drillPlanFixture.plannedActivities.length);
    expect(one.activities[1].unavailableReason).toBe('content_unavailable');
  });

  it('pre-answer view does not reveal answer-sensitive data', () => {
    const view = createPreAnswerView(singleChoiceDrillFixture, 'activity-1', '1 of 1');
    const serialized = JSON.stringify(view);

    expect(serialized).not.toContain('expectedAnswer');
    expect(serialized).not.toContain('decisiveKeywords');
    expect(serialized).not.toContain('explanation');
    expect(serialized).not.toContain('wrong_resource_scope');
  });

  it('pausing preserves the attempt draft and resuming restores current activity', () => {
    const session = startRuntimeSession(createRuntimeSession(drillPlanFixture, [singleChoiceDrillFixture], drillNow), drillNow);
    const active = startActivity(session, session.activities[0].activityId, drillNow);
    const drafted = saveAttemptDraft(active, active.activities[0].activityId, correctDraftFixture, drillNow);
    const paused = pauseSession(drafted, drillNow);
    const resumed = resumeSession(paused, drillNow);

    expect(paused.activities[0].draft?.selectedAnswers).toEqual(['A']);
    expect(resumed.status).toBe('active');
    expect(resumed.currentActivityIndex).toBe(0);
  });

  it('abandoning for fatigue does not create a wrong attempt', () => {
    const session = createRuntimeSession(drillPlanFixture, [singleChoiceDrillFixture], drillNow);
    const abandoned = abandonSession(session, 'fatigue', drillNow);

    expect(abandoned.status).toBe('abandoned');
    expect(abandoned.stopReason).toBe('fatigue');
    expect(abandoned.activities.every((activity) => activity.attemptId === null)).toBe(true);
  });

  it('skipped unavailable content creates no incorrect evidence', () => {
    const session = createRuntimeSession(drillPlanFixture, [], drillNow);
    const skipped = skipActivity(session, session.activities[0].activityId, 'content_unavailable', drillNow);

    expect(skipped.activities[0].status).toBe('skipped');
    expect(skipped.activities[0].attemptId).toBeNull();
  });
});
