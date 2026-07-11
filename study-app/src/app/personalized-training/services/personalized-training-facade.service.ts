import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  DrillActivityView,
  DrillAttemptDraft,
  DrillDefinition,
  DrillReviewView,
  ErrorCause,
  ImportQualityFlag,
  ImportedExamSession,
  PersonalizedDrillAttempt,
  PersonalizedTrainingLoadedContent,
  PersonalizedTrainingRuntimeSession,
  PlannedActivityType,
  PriorityReasonCode,
  RuntimeStopReason,
  SourceQuestionReference,
  TrainingEnergyLevel,
  TrainingPriorityRecommendation,
  TrainingPrioritySnapshot,
  TrainingSessionPlan,
  TrainingTopicDescriptor
} from '../models/personalized-training.models';
import { DEFAULT_DRILL_ATTEMPT_DRAFT } from '../config/drill-engine.config';
import { PersonalizedTrainingContentService } from './personalized-training-content.service';
import { PersonalizedTrainingDrillService } from './personalized-training-drill.service';
import {
  PersonalizedTrainingImportResult,
  PersonalizedTrainingImportService
} from './personalized-training-import.service';
import { PersonalizedTrainingPriorityService } from './personalized-training-priority.service';
import { PersonalizedTrainingRuntimeService } from './personalized-training-runtime.service';
import { PersonalizedTrainingStateService } from './personalized-training-state.service';
import { createDrillReviewView } from '../utils/drill-evidence-conversion';
import { PersonalizedTrainingPackageService } from './personalized-training-package.service';
import { resolveTrainingPlanContent } from '../utils/personalized-training-content-selection';
import { VerifiedBankQuestionResolverService } from '../adapters/verified-bank-question-resolver.service';

export type PersonalizedTrainingUiMode =
  | 'loading'
  | 'dashboard'
  | 'import_preview'
  | 'import_error'
  | 'planning'
  | 'plan_ready'
  | 'session_active'
  | 'session_paused'
  | 'activity_review'
  | 'session_complete'
  | 'content_unavailable'
  | 'fatal_error';

export interface PersonalizedTrainingNotice {
  tone: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export interface PersonalizedTrainingSessionSummary {
  completedActivities: number;
  submittedResults: Array<PersonalizedDrillAttempt['assessment']['result']>;
  correct: number;
  partial: number;
  wrong: number;
  unanswered: number;
  completed: number;
  topicsPracticed: string[];
  groundedCauses: ErrorCause[];
  nextRecommendedAction: string;
  hasUnfinishedActivities: boolean;
  stopReason: RuntimeStopReason | null;
}

export interface PersonalizedTrainingUiState {
  mode: PersonalizedTrainingUiMode;
  notice: PersonalizedTrainingNotice | null;
  importPreview: PersonalizedTrainingImportResult | null;
  prioritySnapshot: TrainingPrioritySnapshot | null;
  plan: TrainingSessionPlan | null;
  runtimeSession: PersonalizedTrainingRuntimeSession | null;
  currentActivityView: DrillActivityView | null;
  currentDraft: DrillAttemptDraft;
  currentReview: DrillReviewView | null;
  summary: PersonalizedTrainingSessionSummary | null;
  content: PersonalizedTrainingLoadedContent | null;
}

const FALLBACK_NOW = '2026-07-10T12:00:00.000Z';

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingFacadeService {
  private readonly state = signal<PersonalizedTrainingUiState>({
    mode: 'loading',
    notice: null,
    importPreview: null,
    prioritySnapshot: null,
    plan: null,
    runtimeSession: null,
    currentActivityView: null,
    currentDraft: cloneDraft(DEFAULT_DRILL_ATTEMPT_DRAFT),
    currentReview: null,
    summary: null,
    content: null
  });
  private readonly availableDefinitions = signal<readonly DrillDefinition[]>([]);
  private readonly activeDefinition = signal<DrillDefinition | null>(null);
  private readonly submittedReviews = signal<readonly DrillReviewView[]>([]);
  private readonly descriptorCache = signal<readonly TrainingTopicDescriptor[]>([]);

  readonly uiState = this.state.asReadonly();
  readonly importedSessions = computed(() => {
    this.uiState();
    return this.stateService.getImportedSessions();
  });
  readonly latestImportedSession = computed(() => this.importedSessions().at(-1) ?? null);
  readonly actionablePriorityCount = computed(() => this.uiState().prioritySnapshot?.priorities.length ?? 0);
  readonly hasActiveOrPausedSession = computed(() => {
    const active = this.stateService.getActiveRuntimeSession();
    return active !== null && (active.status === 'active' || active.status === 'paused');
  });

  constructor(
    private readonly importService: PersonalizedTrainingImportService,
    private readonly priorityService: PersonalizedTrainingPriorityService,
    private readonly runtimeService: PersonalizedTrainingRuntimeService,
    private readonly drillService: PersonalizedTrainingDrillService,
    private readonly stateService: PersonalizedTrainingStateService,
    private readonly contentService: PersonalizedTrainingContentService,
    private readonly packageService: PersonalizedTrainingPackageService,
    private readonly bankResolver: VerifiedBankQuestionResolverService
  ) {}

  initialize(): void {
    try {
      const persisted = this.stateService.loadState();
      this.state.update((current) => ({
        ...current,
        mode: persisted.activeRuntimeSession?.status === 'paused' ? 'session_paused' : 'dashboard',
        runtimeSession: persisted.activeRuntimeSession,
        prioritySnapshot: persisted.latestPrioritySnapshot,
        plan: persisted.latestTrainingSessionPlan,
        notice: null
      }));
      this.packageService.loadContent().subscribe((content) => {
        this.availableDefinitions.set(content.drills);
        this.descriptorCache.set(content.topics);
        this.state.update((current) => ({ ...current, content }));
      });
      this.bankResolver.load().subscribe();
    } catch {
      this.setRecoverable('fatal_error', 'No se pudo leer el estado de entrenamiento personalizado.');
    }
  }

  previewImportText(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) {
      this.setRecoverable('import_error', 'Pega JSON o selecciona un archivo antes de previsualizar.');
      return;
    }
    this.applyImportPreview(this.importService.parseJsonText(trimmed));
  }

  async previewImportFile(file: File): Promise<void> {
    try {
      this.applyImportPreview(await this.importService.importFile(file));
    } catch {
      this.setRecoverable('import_error', 'No se pudo leer el archivo seleccionado.');
    }
  }

  commitImport(): void {
    const preview = this.state().importPreview;
    if (!preview?.session || preview.status === 'invalid' || preview.status === 'duplicate') {
      this.setRecoverable('import_error', 'No hay una importacion valida para confirmar.');
      return;
    }
    const result = this.importService.commitImport(preview.session);
    this.state.update((current) => ({
      ...current,
      mode: result.status === 'duplicate' ? 'import_preview' : 'dashboard',
      importPreview: result.status === 'duplicate' ? result : null,
      notice:
        result.status === 'duplicate'
          ? { tone: 'warning', message: 'Esta sesion ya habia sido importada.' }
          : { tone: 'success', message: 'Resultados importados en el espacio de entrenamiento personalizado.' }
    }));
  }

  cancelImport(): void {
    this.state.update((current) => ({
      ...current,
      mode: 'dashboard',
      importPreview: null,
      notice: { tone: 'info', message: 'Previsualizacion cancelada. No se guardo nada.' }
    }));
  }

  generatePriorities(now: Date = new Date(FALLBACK_NOW)): void {
    const descriptors = this.buildTopicDescriptors();
    if (descriptors.length === 0) {
      this.setRecoverable('planning', 'Aun no hay metadatos suficientes para priorizar. Importa resultados del simulador primero.');
      return;
    }
    const persisted = this.stateService.loadState();
    const snapshot = this.priorityService.generatePrioritySnapshot({
      importedSessions: persisted.importedExamSessions,
      topicDescriptors: descriptors,
      topicMastery: persisted.topicMastery,
      reviewSchedule: persisted.reviewSchedule,
      sessionHistory: persisted.sessions,
      now
    });
    this.priorityService.savePrioritySnapshot(snapshot);
    this.state.update((current) => ({
      ...current,
      mode: snapshot.priorities.length ? 'planning' : 'dashboard',
      prioritySnapshot: snapshot,
      notice: snapshot.priorities.length
        ? { tone: 'success', message: 'Prioridades generadas desde evidencia importada.' }
        : { tone: 'info', message: 'No hay prioridades accionables por ahora.' }
    }));
  }

  generatePlan(availableMinutes: number, energyLevel: TrainingEnergyLevel, now: Date = new Date(FALLBACK_NOW)): void {
    const descriptors = this.buildTopicDescriptors();
    if (descriptors.length === 0) {
      this.setRecoverable('planning', 'No hay temas disponibles para planificar.');
      return;
    }
    const persisted = this.stateService.loadState();
    const plan = this.priorityService.generateTrainingSessionPlan({
      importedSessions: persisted.importedExamSessions,
      topicDescriptors: descriptors,
      topicMastery: persisted.topicMastery,
      reviewSchedule: persisted.reviewSchedule,
      sessionHistory: persisted.sessions,
      availableMinutes,
      energyLevel,
      now
    });
    this.priorityService.saveTrainingSessionPlan(plan);
    this.state.update((current) => ({
      ...current,
      mode: plan.plannedActivities.length ? 'plan_ready' : 'planning',
      prioritySnapshot: this.stateService.loadState().latestPrioritySnapshot ?? current.prioritySnapshot,
      plan,
      notice: plan.plannedActivities.length
        ? { tone: 'success', message: 'Plan adaptativo generado.' }
        : { tone: 'warning', message: 'No se pudo crear un plan valido con esos controles.' }
    }));
  }

  async loadAvailableDefinitionsFromManifest(): Promise<void> {
    const manifest = await firstValueFrom(this.contentService.loadManifest());
    const definitions = await firstValueFrom(this.contentService.loadDrillDefinitions(manifest.drillFiles));
    this.availableDefinitions.set(definitions);
  }

  startPlan(definitions: readonly DrillDefinition[] = this.availableDefinitions()): void {
    const plan = this.state().plan ?? this.stateService.getLatestTrainingSessionPlan();
    if (!plan) {
      this.setRecoverable('planning', 'Genera un plan antes de iniciar una sesion.');
      return;
    }
    const resolution = resolveTrainingPlanContent({
      plan,
      drills: definitions,
      recentAttempts: this.stateService.getDrillAttempts(),
      availableTopicIds: [
        ...this.descriptorCache().map((topic) => topic.topicId),
        ...plan.selectedTopics.map((topic) => topic.topicId),
        ...definitions.map((definition) => definition.topicId)
      ]
    });
    if (resolution.resolvedActivities.length === 0) {
      this.state.update((current) => ({
        ...current,
        mode: 'content_unavailable',
        notice: { tone: 'warning', message: 'Hay actividades del plan sin contenido disponible. No se genero evidencia negativa.' }
      }));
      return;
    }
    const resolvedDefinitions = resolution.resolvedActivities.map((item) => item.drill);
    const session = this.runtimeService.createRuntimeSession(plan, resolvedDefinitions, new Date());
    const started = this.runtimeService.startRuntimeSession(session, new Date());
    this.enterNextActivity(started, resolvedDefinitions);
  }

  resumeActiveSession(definitions: readonly DrillDefinition[] = this.availableDefinitions()): void {
    const active = this.stateService.getActiveRuntimeSession();
    if (!active) {
      this.returnToDashboard();
      return;
    }
    const session = active.status === 'paused' ? this.runtimeService.resumeSession(active, new Date()) : active;
    this.enterNextActivity(session, definitions);
  }

  saveDraft(draft: DrillAttemptDraft): void {
    const session = this.state().runtimeSession;
    const activity = this.currentActivity(session);
    if (!session || !activity) {
      return;
    }
    const saved = this.runtimeService.saveAttemptDraft(session, activity.activityId, draft, new Date());
    this.state.update((current) => ({
      ...current,
      runtimeSession: saved,
      currentDraft: cloneDraft(draft),
      notice: { tone: 'info', message: 'Borrador guardado.' }
    }));
  }

  submitCurrentActivity(draft: DrillAttemptDraft = this.state().currentDraft): void {
    const session = this.state().runtimeSession;
    const activity = this.currentActivity(session);
    const definition = this.activeDefinition();
    if (!session || !activity || !definition) {
      this.setRecoverable('content_unavailable', 'Esta actividad no tiene contenido disponible.');
      return;
    }
    const submittedAt = new Date();
    const next = this.runtimeService.submitActivity({
      session,
      activityId: activity.activityId,
      definition,
      draft,
      now: submittedAt,
      bankResolver: this.bankResolver
    });
    const attemptId = `attempt:${session.runtimeSessionId}:${activity.activityId}`;
    const attempt = this.stateService.getDrillAttempts().find((item) => item.attemptId === attemptId) ?? null;
    const review = attempt ? createDrillReviewView(attempt) : null;
    this.submittedReviews.update((items) => (review ? [...items, review] : items));
    this.state.update((current) => ({
      ...current,
      mode: 'activity_review',
      runtimeSession: next,
      currentDraft: cloneDraft(draft),
      currentReview: review,
      notice: { tone: 'success', message: 'Actividad enviada.' }
    }));
  }

  continueAfterReview(definitions: readonly DrillDefinition[] = this.availableDefinitions()): void {
    const session = this.state().runtimeSession;
    if (!session) {
      this.returnToDashboard();
      return;
    }
    const nextIndex = session.activities.findIndex((activity) => activity.status === 'pending' || activity.status === 'active');
    if (nextIndex === -1) {
      this.completeSession();
      return;
    }
    this.enterNextActivity({ ...session, currentActivityIndex: nextIndex }, definitions);
  }

  pauseSession(): void {
    const session = this.state().runtimeSession;
    if (!session) {
      return;
    }
    const paused = this.runtimeService.pauseSession(session, new Date());
    this.state.update((current) => ({
      ...current,
      mode: 'session_paused',
      runtimeSession: paused,
      notice: { tone: 'info', message: 'Sesion pausada. El borrador se conserva.' }
    }));
  }

  stopSession(reason: RuntimeStopReason): void {
    const session = this.state().runtimeSession ?? this.stateService.getActiveRuntimeSession();
    if (!session) {
      this.returnToDashboard();
      return;
    }
    const stopped = this.runtimeService.abandonSession(session, reason, new Date());
    this.state.update((current) => ({
      ...current,
      mode: 'session_complete',
      runtimeSession: stopped,
      currentActivityView: null,
      summary: this.buildSummary(stopped, reason),
      notice: { tone: 'info', message: 'Sesion detenida sin penalizar actividades sin enviar.' }
    }));
  }

  completeSession(): void {
    const session = this.state().runtimeSession;
    if (!session) {
      this.returnToDashboard();
      return;
    }
    const completed = this.runtimeService.completeSession(session, new Date());
    this.state.update((current) => ({
      ...current,
      mode: 'session_complete',
      runtimeSession: completed,
      currentActivityView: null,
      summary: this.buildSummary(completed, null),
      notice: { tone: 'success', message: 'Sesion completada.' }
    }));
  }

  abandonActiveSessionWithConfirmation(confirmAbandon: boolean): void {
    if (!confirmAbandon) {
      return;
    }
    this.stopSession('learner_choice');
  }

  returnToDashboard(): void {
    this.activeDefinition.set(null);
    this.state.update((current) => ({
      ...current,
      mode: 'dashboard',
      currentActivityView: null,
      currentReview: null,
      importPreview: null,
      summary: null,
      runtimeSession: this.stateService.getActiveRuntimeSession(),
      prioritySnapshot: this.stateService.loadState().latestPrioritySnapshot,
      plan: this.stateService.loadState().latestTrainingSessionPlan,
      notice: null
    }));
  }

  updateCurrentDraft(patch: Partial<DrillAttemptDraft>): void {
    this.state.update((current) => ({
      ...current,
      currentDraft: cloneDraft({ ...current.currentDraft, ...patch })
    }));
  }

  reasonLabel(code: PriorityReasonCode): string {
    const labels: Record<PriorityReasonCode, string> = {
      untested_topic: 'Tema aun no probado',
      weak_topic: 'Tema debil en evidencia previa',
      repeated_reliable_errors: 'Errores confiables repetidos',
      repeated_cross_session_error: 'Error repetido entre sesiones',
      high_weight_domain: 'Dominio oficial de alto peso',
      review_due: 'Repaso programado vencido',
      prerequisite_gap: 'Falta prerequisito',
      multi_select_failure: 'Patron de multi-select',
      wrong_resource_scope_pattern: 'Confusion de alcance del recurso',
      service_confusion_pattern: 'Confusion entre servicios',
      missed_keyword_pattern: 'Keyword de examen omitida',
      reliable_high_confidence_wrong: 'Error con alta confianza confiable',
      recent_improvement: 'Mejora reciente',
      recently_reinforced: 'Reforzado recientemente',
      strong_topic_capped: 'Tema fuerte limitado',
      overtraining_cap: 'Limite para evitar sobreentreno',
      rushed_evidence_discounted: 'Evidencia rapida descontada',
      known_bank_issue_excluded: 'Evidencia conocida del banco excluida',
      insufficient_evidence: 'Evidencia insuficiente',
      coverage_gap: 'Cobertura pendiente',
      bank_return_failure: 'Retorno al banco fallado'
    };
    return labels[code];
  }

  domainLabel(domainId: string): string {
    const labels: Record<string, string> = {
      sdlc_automation: 'SDLC Automation',
      configuration_management_iac: 'Configuration Management and IaC',
      resilient_cloud_solutions: 'Resilient Cloud Solutions',
      monitoring_logging: 'Monitoring and Logging',
      incident_event_response: 'Incident and Event Response',
      security_compliance: 'Security and Compliance'
    };
    return labels[domainId] ?? domainId;
  }

  activityLabel(type: PlannedActivityType): string {
    const labels: Record<PlannedActivityType, string> = {
      mechanism_review: 'Repaso de mecanismo',
      binary_comparison: 'Comparacion binaria',
      workflow_ordering: 'Orden de flujo',
      architecture_mapping: 'Mapa de arquitectura',
      distractor_elimination: 'Eliminacion de distractores',
      exam_scenario: 'Escenario de examen',
      bank_return: 'Retorno al banco',
      spaced_review: 'Repaso espaciado'
    };
    return labels[type];
  }

  topicTitle(topicId: string): string {
    return this.descriptorCache().find((descriptor) => descriptor.topicId === topicId)?.title ?? topicId;
  }

  reasonLabels(codes: readonly PriorityReasonCode[]): string {
    return codes.map((code) => this.reasonLabel(code)).join(', ');
  }

  recommendedActionLabel(action: TrainingPriorityRecommendation['recommendedTrainingAction'] | string): string {
    const labels: Record<string, string> = {
      review_mechanism: 'Revisar mecanismo',
      repair_misconception: 'Reparar misconcepcion',
      practice_elimination: 'Practicar eliminacion',
      reinforce_success: 'Reforzar acierto',
      scheduled_review: 'Repaso programado',
      collect_evidence: 'Recolectar evidencia'
    };
    return labels[action] ?? action;
  }

  private applyImportPreview(result: PersonalizedTrainingImportResult): void {
    this.state.update((current) => ({
      ...current,
      mode: result.status === 'invalid' ? 'import_error' : 'import_preview',
      importPreview: result,
      notice: importNotice(result)
    }));
  }

  private enterNextActivity(session: PersonalizedTrainingRuntimeSession, definitions: readonly DrillDefinition[]): void {
    const activity = this.currentActivity(session);
    if (!activity) {
      this.completeSession();
      return;
    }
    const definition = definitions.find((item) => item.drillId === activity.drillId || item.topicId === activity.topicId) ?? null;
    if (!definition || activity.unavailableReason) {
      this.activeDefinition.set(null);
      this.state.update((current) => ({
        ...current,
        mode: 'content_unavailable',
        runtimeSession: session,
        currentActivityView: null,
        notice: { tone: 'warning', message: 'El contenido de esta actividad todavia no existe. No se genero evidencia negativa.' }
      }));
      return;
    }
    const active = activity.status === 'active' ? session : this.runtimeService.startActivity(session, activity.activityId, new Date());
    const activeActivity = this.currentActivity(active);
    const draft = activeActivity?.draft ? cloneDraft(activeActivity.draft) : cloneDraft(DEFAULT_DRILL_ATTEMPT_DRAFT);
    this.activeDefinition.set(definition);
    this.state.update((current) => ({
      ...current,
      mode: 'session_active',
      runtimeSession: active,
      currentActivityView: this.drillService.createPreAnswerView(definition, activity.activityId, `${active.currentActivityIndex + 1} de ${active.activities.length}`),
      currentDraft: draft,
      currentReview: null,
      notice: null
    }));
  }

  private currentActivity(session: PersonalizedTrainingRuntimeSession | null): PersonalizedTrainingRuntimeSession['activities'][number] | null {
    if (!session) {
      return null;
    }
    return session.activities[session.currentActivityIndex] ?? null;
  }

  private buildTopicDescriptors(): TrainingTopicDescriptor[] {
    const sessions = this.stateService.getImportedSessions();
    const byTopic = new Map<string, TrainingTopicDescriptor>();
    for (const descriptor of this.state().content?.topics ?? []) {
      byTopic.set(descriptor.topicId, descriptor);
    }
    for (const session of sessions) {
      for (const attempt of session.attempts) {
        const domainId = normalizeDomainId(attempt.domainName);
        const title = attempt.topic?.trim() || attempt.domainName?.trim() || `Pregunta ${attempt.questionId}`;
        const topicId = `imported:${slug(title)}:${domainId}`;
        const previous = byTopic.get(topicId);
        const sourceQuestion: SourceQuestionReference = {
          bank: session.bankType === 'public' ? 'public' : 'verified',
          questionId: attempt.questionId
        };
        if (previous) {
          byTopic.set(topicId, {
            ...previous,
            sourceQuestions: appendUniqueSource(previous.sourceQuestions, sourceQuestion)
          });
          continue;
        }
        byTopic.set(topicId, {
          topicId,
          title,
          domainId,
          blueprintRelevance: 1,
          currentStatus: 'untested',
          prerequisiteTopicIds: [],
          relatedPatternIds: [],
          sourceQuestions: [sourceQuestion]
        });
      }
    }
    const descriptors = [...byTopic.values()];
    this.descriptorCache.set(descriptors);
    return descriptors;
  }

  private buildSummary(session: PersonalizedTrainingRuntimeSession, stopReason: RuntimeStopReason | null): PersonalizedTrainingSessionSummary {
    const attempts = this.stateService.getDrillAttempts().filter((attempt) => attempt.runtimeSessionId === session.runtimeSessionId);
    const results = attempts.map((attempt) => attempt.assessment.result);
    const groundedCauses = attempts
      .map((attempt) => attempt.assessment.finalCause)
      .filter((cause): cause is ErrorCause => cause !== null);
    return {
      completedActivities: session.activities.filter((activity) => activity.status === 'completed').length,
      submittedResults: results,
      correct: results.filter((result) => result === 'correct').length,
      partial: results.filter((result) => result === 'partial').length,
      wrong: results.filter((result) => result === 'wrong').length,
      unanswered: results.filter((result) => result === 'unanswered').length,
      completed: results.filter((result) => result === 'completed').length,
      topicsPracticed: [...new Set(attempts.map((attempt) => attempt.topicId))],
      groundedCauses: [...new Set(groundedCauses)],
      nextRecommendedAction: attempts.at(-1)?.assessment.result === 'correct' ? 'Reforzar acierto' : 'Volver al panel y regenerar prioridades',
      hasUnfinishedActivities: session.activities.some((activity) => activity.status !== 'completed'),
      stopReason
    };
  }

  private setRecoverable(mode: PersonalizedTrainingUiMode, message: string): void {
    this.state.update((current) => ({
      ...current,
      mode,
      notice: { tone: mode === 'fatal_error' || mode === 'import_error' ? 'error' : 'warning', message }
    }));
  }
}

function importNotice(result: PersonalizedTrainingImportResult): PersonalizedTrainingNotice {
  if (result.status === 'invalid') {
    return { tone: 'error', message: 'El JSON no se puede importar. Revisa el formato.' };
  }
  if (result.status === 'duplicate') {
    return { tone: 'warning', message: 'Esta sesion parece duplicada. No se guardo nada.' };
  }
  if (result.status === 'valid_with_warnings') {
    return { tone: 'warning', message: 'Importacion valida con advertencias posibles.' };
  }
  return { tone: 'success', message: 'Importacion valida. Confirma para guardar.' };
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

function normalizeDomainId(value: string | null): TrainingTopicDescriptor['domainId'] {
  const text = (value ?? '').toLowerCase();
  if (text.includes('configuration') || text.includes('iac')) {
    return 'configuration_management_iac';
  }
  if (text.includes('resilient') || text.includes('availability') || text.includes('recovery')) {
    return 'resilient_cloud_solutions';
  }
  if (text.includes('monitor') || text.includes('log')) {
    return 'monitoring_logging';
  }
  if (text.includes('incident') || text.includes('event')) {
    return 'incident_event_response';
  }
  if (text.includes('security') || text.includes('compliance') || text.includes('iam')) {
    return 'security_compliance';
  }
  return 'sdlc_automation';
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'topic';
}

function appendUniqueSource(sources: readonly SourceQuestionReference[], next: SourceQuestionReference): SourceQuestionReference[] {
  if (sources.some((source) => source.bank === next.bank && source.questionId === next.questionId)) {
    return [...sources];
  }
  return [...sources, next];
}

export function importQualityWarningLabels(flags: readonly ImportQualityFlag[]): string[] {
  const labels = new Set<string>();
  for (const flag of flags) {
    if (flag.code === 'known_bank_data_issue') {
      labels.add('Known source-bank inconsistency');
    } else if (flag.code === 'missing_confidence' || flag.code === 'suspicious_constant_confidence') {
      labels.add('Confidence values may be unreliable');
    } else if (flag.code === 'possible_rushed_segment' || flag.code === 'anomalous_short_response_time') {
      labels.add('Possible rushed segment detected');
    } else if (flag.code === 'elapsed_time_inconsistency' || flag.code === 'possible_long_pause' || flag.code === 'anomalous_long_response_time') {
      labels.add('Possible timing inconsistency');
    }
  }
  return [...labels];
}
