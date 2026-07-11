export type SchemaVersion = '1.0';
export type StableId = string;
export type Confidence = 1 | 2 | 3 | 4 | 5 | null;
export type SimulatorBankReference = 'verified' | 'public';

export type TrainingGoal =
  | 'close_weak_areas'
  | 'improve_exam_reading'
  | 'build_service_map'
  | 'prepare_bank_return'
  | 'increase_mastery';

export type DrillLevel = 'intro' | 'practice' | 'exam_like' | 'bank_return';
export type DrillForm =
  | 'component_identification'
  | 'binary_comparison'
  | 'workflow_ordering'
  | 'architecture_mapping'
  | 'distractor_elimination'
  | 'exam_scenario'
  | 'bank_return';
export type DrillQuestionType = 'single' | 'multi' | 'ordering' | 'mapping' | 'explanation';

export type ErrorCause =
  | 'knowledge_gap'
  | 'service_confusion'
  | 'missed_keyword'
  | 'english_interpretation'
  | 'elimination_failure'
  | 'incorrect_assumption'
  | 'incomplete_multi_select'
  | 'wrong_resource_scope'
  | 'rushed_reading'
  | 'confidence_miscalibration';

export type MasteryStatus = 'untested' | 'weak' | 'developing' | 'moderate' | 'strong';
export type PersonalizedSessionStepKind = 'topic_review' | 'mental_map' | 'comparison' | 'drill' | 'bank_return';
export type PersonalizedSessionStepResult = 'not_started' | 'completed' | 'skipped';
export type TrainingPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ImportQualityFlagCode =
  | 'malformed_json'
  | 'unsupported_schema'
  | 'missing_session_metadata'
  | 'missing_answer_records'
  | 'malformed_answer_record'
  | 'missing_question_id'
  | 'invalid_answer_value'
  | 'missing_correct_answers'
  | 'correctness_not_verifiable'
  | 'invalid_confidence'
  | 'missing_confidence'
  | 'suspicious_constant_confidence'
  | 'missing_response_time'
  | 'anomalous_short_response_time'
  | 'anomalous_long_response_time'
  | 'elapsed_time_inconsistency'
  | 'possible_long_pause'
  | 'possible_rushed_segment'
  | 'incomplete_session'
  | 'duplicate_import'
  | 'known_bank_data_issue';
export type ImportQualitySeverity = 'info' | 'warning' | 'error';
export type ImportQualityScope = 'session' | 'question';
export type ImportedQuestionResult = 'correct' | 'partial' | 'wrong' | 'unanswered' | 'unknown';
export type ImportResultStatus = 'valid' | 'valid_with_warnings' | 'invalid' | 'duplicate';
export type DopC02DomainId =
  | 'sdlc_automation'
  | 'configuration_management_iac'
  | 'resilient_cloud_solutions'
  | 'monitoring_logging'
  | 'incident_event_response'
  | 'security_compliance';
export type EvidenceReliabilityClass = 'high' | 'medium' | 'low' | 'excluded';
export type TrainingEvidenceSourceType =
  | 'imported_exam'
  | 'drill_attempt'
  | 'manual_coaching'
  | 'learner_profile'
  | 'review_schedule'
  | 'session_history';
export type TrainingObservedResult = 'correct' | 'partial' | 'wrong' | 'unanswered' | 'unknown' | 'reinforced';
export type PriorityReasonCode =
  | 'untested_topic'
  | 'weak_topic'
  | 'repeated_reliable_errors'
  | 'repeated_cross_session_error'
  | 'high_weight_domain'
  | 'review_due'
  | 'prerequisite_gap'
  | 'multi_select_failure'
  | 'wrong_resource_scope_pattern'
  | 'service_confusion_pattern'
  | 'missed_keyword_pattern'
  | 'reliable_high_confidence_wrong'
  | 'recent_improvement'
  | 'recently_reinforced'
  | 'strong_topic_capped'
  | 'overtraining_cap'
  | 'rushed_evidence_discounted'
  | 'known_bank_issue_excluded'
  | 'insufficient_evidence'
  | 'coverage_gap'
  | 'bank_return_failure';
export type RecommendedTrainingAction =
  | 'review_mechanism'
  | 'repair_misconception'
  | 'practice_elimination'
  | 'reinforce_success'
  | 'scheduled_review'
  | 'collect_evidence';
export type RecommendedDifficulty = 'intro' | 'practice' | 'exam_like';
export type ReviewUrgency = 'none' | 'low' | 'medium' | 'high' | 'urgent';
export type TrainingEnergyLevel = 'low' | 'normal' | 'high';
export type PlannedActivityType =
  | 'mechanism_review'
  | 'binary_comparison'
  | 'workflow_ordering'
  | 'architecture_mapping'
  | 'distractor_elimination'
  | 'exam_scenario'
  | 'bank_return'
  | 'spaced_review';
export type DrillActivityType = DrillForm | 'mechanism_review' | 'spaced_review';
export type DrillDefinitionSchemaVersion = 'drill-definition-v1';
export type DrillEvaluationResult = ImportedQuestionResult | 'completed';
export type RuntimeSessionStatus = 'not_started' | 'active' | 'paused' | 'completed' | 'abandoned';
export type ActivityRuntimeStatus = 'pending' | 'active' | 'submitted' | 'completed' | 'skipped' | 'abandoned' | 'unavailable';
export type RuntimeStopReason = 'fatigue' | 'time_expired' | 'interrupted' | 'learner_choice' | 'content_unavailable' | 'technical_issue';
export type DrillPromptLanguage = 'en';
export type DrillReviewLanguage = 'es' | 'en';
export type RootCauseSource = 'none' | 'distractor_metadata' | 'evaluation_metadata' | 'learner_reasoning' | 'manual_override';
export type PersonalizedTrainingContentStatus = 'valid' | 'valid_with_warnings' | 'partially_available' | 'invalid' | 'unavailable';
export type PersonalizedTrainingContentIssueCode =
  | 'manifest_unavailable'
  | 'unsupported_manifest_schema'
  | 'duplicate_package_id'
  | 'package_unavailable'
  | 'package_version_mismatch'
  | 'unsupported_package_schema'
  | 'duplicate_topic_id'
  | 'duplicate_map_id'
  | 'duplicate_comparison_id'
  | 'duplicate_drill_id'
  | 'unsupported_domain_id'
  | 'invalid_prerequisite_reference'
  | 'invalid_topic_reference'
  | 'invalid_drill_reference'
  | 'invalid_map_reference'
  | 'invalid_source_question_reference'
  | 'invalid_drill_definition'
  | 'inactive_or_malformed_content'
  | 'profile_unavailable'
  | 'unsupported_profile_schema';
export type DrillValidationCode =
  | 'missing_drill_id'
  | 'missing_topic_id'
  | 'unsupported_activity_type'
  | 'duplicate_option_ids'
  | 'invalid_expected_answer'
  | 'expected_option_not_present'
  | 'invalid_workflow_sequence'
  | 'duplicate_workflow_ids'
  | 'invalid_mapping_ids'
  | 'missing_explanation'
  | 'bank_return_missing_source_reference'
  | 'bank_return_contains_copied_content'
  | 'invalid_estimated_minutes'
  | 'invalid_difficulty'
  | 'unsupported_review_language';

export interface SourceQuestionReference {
  bank: SimulatorBankReference;
  questionId: number;
}

export interface ImportQualityFlag {
  code: ImportQualityFlagCode;
  severity: ImportQualitySeverity;
  scope: ImportQualityScope;
  questionId?: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface LearnerPreferences {
  goals: TrainingGoal[];
  preferredSessionMinutes: number;
  includeBankReturn: boolean;
  includeMentalMaps: boolean;
  explanationDepth: 'short' | 'standard' | 'deep';
}

export interface WeakAreaProfile {
  id: StableId;
  label: string;
  topicIds: StableId[];
  errorCauses: ErrorCause[];
  priority: TrainingPriority;
  sourceQuestions: SourceQuestionReference[];
}

export interface BlueprintCoverageState {
  domainId: StableId;
  label: string;
  targetWeightPercent: number;
  observedQuestionCount: number;
  masteryStatus: MasteryStatus;
}

export interface PersonalizedTrainingProfile {
  id: StableId;
  schemaVersion: SchemaVersion;
  learnerId: StableId;
  displayName: string;
  preferences: LearnerPreferences;
  weakAreas: WeakAreaProfile[];
  blueprintCoverage: BlueprintCoverageState[];
  updatedAt: string;
}

export interface PersonalizedTrainingPackageManifestEntry {
  packageId: StableId;
  version: string;
  file: string;
  enabled: boolean;
  order: number;
}

export interface PersonalizedTrainingContentManifest {
  schemaVersion: SchemaVersion;
  contentVersion: string;
  updatedAt?: string;
  defaultProfileFile?: string;
  packages: PersonalizedTrainingPackageManifestEntry[];
}

export interface PersonalizedTrainingLearnerProfile {
  schemaVersion: SchemaVersion;
  profileId: StableId;
  learnerId: StableId;
  displayName: string;
  targetCertification: string;
  examDate: string | null;
  manuallyCuratedWeakPatterns: WeakAreaProfile[];
  manualCoachingEvidence: ManualCoachingEvidence[];
  topicStatuses: Record<StableId, MasteryStatus>;
  preferences: LearnerPreferences;
  priorityTopicIds: StableId[];
  studyConstraints: {
    preferredSessionMinutes: number[];
    maxSessionMinutes: number | null;
    notes: string | null;
  };
}

export interface LearningObjective {
  id: StableId;
  description: string;
  sourceQuestions: SourceQuestionReference[];
}

export interface TrainingTopic {
  id: StableId;
  schemaVersion: SchemaVersion;
  title: string;
  summary: string;
  domainIds: StableId[];
  weakAreaIds: StableId[];
  objectives: LearningObjective[];
  sourceQuestions: SourceQuestionReference[];
}

export interface MentalMapStep {
  id: StableId;
  label: string;
  detail: string;
  sourceQuestions: SourceQuestionReference[];
}

export interface MentalMap {
  id: StableId;
  schemaVersion: SchemaVersion;
  topicId: StableId;
  title: string;
  steps: MentalMapStep[];
}

export interface ComparisonDimension {
  id: StableId;
  label: string;
  leftValue: string;
  rightValue: string;
}

export interface ServiceComparison {
  id: StableId;
  topicId: StableId;
  leftService: string;
  rightService: string;
  dimensions: ComparisonDimension[];
  sourceQuestions: SourceQuestionReference[];
}

export interface PersonalizedTrainingContentPackage {
  schemaVersion: SchemaVersion;
  packageId: StableId;
  version: string;
  title: string;
  description: string;
  topicDescriptors: TrainingTopicDescriptor[];
  conceptMaps: MentalMap[];
  comparisons: ServiceComparison[];
  drillDefinitions: DrillDefinition[];
  sourceQuestionRefs: SourceQuestionReference[];
  prerequisiteRelationships: Array<{
    topicId: StableId;
    prerequisiteTopicIds: StableId[];
  }>;
  tags: string[];
}

export interface DrillOption {
  id: StableId;
  label: string;
}

export interface DrillExplanation {
  correct: string;
  traps: string[];
  sourceQuestions: SourceQuestionReference[];
}

export interface DrillQuestion {
  id: StableId;
  type: DrillQuestionType;
  prompt: string;
  options: DrillOption[];
  correctOptionIds: StableId[];
  explanation: DrillExplanation;
  sourceQuestions: SourceQuestionReference[];
}

export interface DrillAnswerOption {
  id: StableId;
  label: string;
}

export interface WorkflowItem {
  id: StableId;
  label: string;
}

export interface MappingItem {
  id: StableId;
  label: string;
}

export interface DrillExpectedAnswer {
  optionIds?: StableId[];
  workflowOrder?: StableId[];
  equivalentWorkflowOrders?: StableId[][];
  mappings?: Record<StableId, StableId>;
  binarySelection?: StableId;
}

export interface DrillEvaluationRules {
  allowPartialCredit: boolean;
  partialMappingCredit: boolean;
}

export interface DrillDistractorMetadata {
  optionId: StableId;
  errorCause: ErrorCause;
  attraction: string;
  failure: string;
}

export interface DrillExplanationContent {
  concise: string;
  testedPattern: string;
  correctChoiceWins: string;
  distractorReview: DrillDistractorMetadata[];
}

export interface DrillDefinition {
  drillId: StableId;
  version: DrillDefinitionSchemaVersion;
  topicId: StableId;
  domainId: DopC02DomainId;
  activityType: DrillActivityType;
  drillForm: DrillForm | 'mechanism_review' | 'spaced_review';
  title: string;
  difficulty: RecommendedDifficulty;
  estimatedMinutes: number;
  promptLanguage: DrillPromptLanguage;
  reviewLanguage: DrillReviewLanguage;
  instructions: string;
  prompt: string;
  answerOptions: DrillAnswerOption[];
  workflowItems: WorkflowItem[];
  mappingItems: MappingItem[];
  expectedAnswer: DrillExpectedAnswer;
  evaluationRules: DrillEvaluationRules;
  decisiveKeywords: string[];
  distractorMetadata: DrillDistractorMetadata[];
  explanation: DrillExplanationContent;
  sourceQuestionRefs: SourceQuestionReference[];
  prerequisiteTopicIds: StableId[];
  tags: string[];
  active: boolean;
}

export interface ResolvedBankQuestion {
  reference: SourceQuestionReference;
  prompt: string;
  answerOptions: DrillAnswerOption[];
  correctOptionIds: StableId[];
  knownIssue: boolean;
}

export interface BankQuestionResolver {
  resolve(reference: SourceQuestionReference): Readonly<ResolvedBankQuestion> | null;
}

export interface DrillSet {
  id: StableId;
  schemaVersion: SchemaVersion;
  topicId: StableId;
  title: string;
  level: DrillLevel;
  form: DrillForm;
  questions: DrillQuestion[];
  sourceQuestions: SourceQuestionReference[];
}

export interface DrillAttempt {
  id: StableId;
  drillSetId: StableId;
  questionId: StableId;
  selectedOptionIds: StableId[];
  result: 'correct' | 'partial' | 'incorrect';
  confidence: Confidence;
  errorCauses: ErrorCause[];
  responseTimeSeconds: number | null;
  attemptedAt: string;
}

export interface TopicMastery {
  topicId: StableId;
  attempts: number;
  correctAttempts: number;
  partialAttempts: number;
  consecutiveCorrect: number;
  highestCompletedDrillLevel: DrillLevel | null;
  lastConfidence: Confidence;
  recentErrorCauses: ErrorCause[];
  bankReturnSuccess: boolean | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  status: MasteryStatus;
}

export interface ReviewSchedule {
  topicId: StableId;
  priority: TrainingPriority;
  dueAt: string;
  reason: string;
}

export interface PersonalizedSessionStep {
  id: StableId;
  kind: PersonalizedSessionStepKind;
  targetId: StableId;
  result: PersonalizedSessionStepResult;
}

export interface PersonalizedSessionResult {
  completedSteps: number;
  drillAttempts: number;
  errorCauses: ErrorCause[];
  nextReviewTopics: StableId[];
}

export interface PersonalizedSession {
  id: StableId;
  startedAt: string;
  completedAt: string | null;
  goal: TrainingGoal;
  steps: PersonalizedSessionStep[];
  result: PersonalizedSessionResult | null;
}

export interface ImportedQuestionAttempt {
  questionId: number;
  order: number;
  questionType: string | null;
  selectedAnswers: string[];
  correctAnswers: string[];
  result: ImportedQuestionResult;
  confidence: Confidence;
  responseTimeSeconds: number | null;
  notes: string | null;
  topic: string | null;
  domainName: string | null;
  qualityFlags: ImportQualityFlag[];
}

export interface ImportedExamSession {
  id: StableId;
  sourceSessionId: string | null;
  sourceSchemaVersion: string | null;
  sourceAppVersion: string | null;
  bankType: string | null;
  assessmentMode: string | null;
  startedAt: string | null;
  completedAt: string | null;
  elapsedSeconds: number | null;
  activeElapsedSeconds: number | null;
  importedAt: string;
  sourceFileName: string | null;
  totalRecords: number;
  answeredCount: number;
  correctCount: number;
  partialCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercent: number | null;
  attempts: ImportedQuestionAttempt[];
  qualityFlags: ImportQualityFlag[];
  suspectedRushedSegment: SuspectedRushedSegment | null;
  importParserVersion: string;
}

export interface SuspectedRushedSegment {
  startIndex: number;
  questionId: number | null;
  evidence: Record<string, unknown>;
}

export interface ImportAuditSummary {
  importId: StableId;
  importedAt: string;
  sourceFileName: string | null;
  status: ImportResultStatus;
  flagCodes: ImportQualityFlagCode[];
}

export interface TrainingTopicDescriptor {
  topicId: StableId;
  title: string;
  domainId: DopC02DomainId;
  blueprintRelevance: number;
  currentStatus: MasteryStatus;
  prerequisiteTopicIds: StableId[];
  relatedPatternIds: StableId[];
  sourceQuestions: SourceQuestionReference[];
}

export interface TrainingEvidenceItem {
  evidenceId: StableId;
  sourceType: TrainingEvidenceSourceType;
  topicId: StableId | null;
  domainId: DopC02DomainId | null;
  observedResult: TrainingObservedResult;
  occurredAt: string;
  reliability: EvidenceReliabilityClass;
  reliabilityWeight: number;
  exclusionReason: PriorityReasonCode | null;
  relatedQuestionId: number | null;
  sourceSessionId: StableId | null;
  qualityFlags: ImportQualityFlag[];
  errorCause: ErrorCause | 'unknown' | null;
}

export interface ManualCoachingEvidence {
  evidenceId: StableId;
  topicId: StableId;
  domainId: DopC02DomainId;
  observedResult: TrainingObservedResult;
  occurredAt: string;
  reliability: EvidenceReliabilityClass;
  errorCause: ErrorCause | 'unknown' | null;
  notes?: string;
}

export interface PriorityScoreComponent {
  code: string;
  label: string;
  value: number;
  details?: Record<string, unknown>;
}

export interface TrainingPriorityRecommendation {
  topicId: StableId;
  domainId: DopC02DomainId;
  rank: number;
  totalScore: number;
  scoreComponents: PriorityScoreComponent[];
  reasonCodes: PriorityReasonCode[];
  evidenceSummary: {
    totalEvidence: number;
    reliableErrors: number;
    crossSessionErrorCount: number;
    correctEvidence: number;
    excludedEvidence: number;
    latestEvidenceAt: string | null;
  };
  reliabilitySummary: {
    high: number;
    medium: number;
    low: number;
    excluded: number;
  };
  recommendedTrainingAction: RecommendedTrainingAction;
  recommendedDifficulty: RecommendedDifficulty;
  reviewUrgency: ReviewUrgency;
  sourceQuestionRefs: SourceQuestionReference[];
}

export interface TrainingPrioritySnapshot {
  snapshotId: StableId;
  generatedAt: string;
  priorityEngineVersion: string;
  blueprintVersion: string;
  evidenceCount: number;
  priorities: TrainingPriorityRecommendation[];
}

export interface PlannedTrainingTopic {
  topicId: StableId;
  domainId: DopC02DomainId;
  rank: number;
  plannedMinutes: number;
  reasonCodes: PriorityReasonCode[];
}

export interface PlannedTrainingActivity {
  activityId: StableId;
  topicId: StableId;
  type: PlannedActivityType;
  estimatedMinutes: number;
  reasonCodes: PriorityReasonCode[];
}

export interface TrainingSessionPlan {
  planId: StableId;
  generatedAt: string;
  planningEngineVersion: string;
  priorityEngineVersion: string;
  availableMinutes: number;
  energyLevel: TrainingEnergyLevel;
  primaryObjective: string;
  selectedTopics: PlannedTrainingTopic[];
  plannedActivities: PlannedTrainingActivity[];
  estimatedMinutes: number;
  deferredPriorities: Array<{
    topicId: StableId;
    reasonCodes: PriorityReasonCode[];
  }>;
  planningReasonCodes: PriorityReasonCode[];
}

export interface DrillAttemptDraft {
  identifiedKeywords: string[];
  eliminatedOptions: StableId[];
  eliminationReasons: Record<StableId, string>;
  uncertaintyNotes: string | null;
  reasoningSummary: string | null;
  selectedAnswers: StableId[];
  orderedItems: StableId[];
  mappingSelections: Record<StableId, StableId>;
  confidence: Confidence;
  responseTimeSeconds: number | null;
  activeTimeSeconds: number | null;
  manualCauseOverride?: ErrorCause | null;
}

export interface DrillAttemptAssessment {
  result: DrillEvaluationResult;
  normalizedSelectedAnswers: StableId[];
  correctAnswerIds: StableId[];
  expectedWorkflowOrder: StableId[];
  expectedMappings: Record<StableId, StableId>;
  reliability: EvidenceReliabilityClass;
  qualityFlags: ImportQualityFlag[];
  inferredCause: ErrorCause | null;
  finalCause: ErrorCause | null;
  causeSource: RootCauseSource;
  causeEvidence: string[];
  manualOverride: ErrorCause | null;
  bankDataIssueAffectedDiagnosis: boolean;
  evaluationEngineVersion: string;
}

export interface DrillReviewView {
  result: DrillEvaluationResult;
  correctAnswerIds: StableId[];
  expectedWorkflowOrder: StableId[];
  expectedMappings: Record<StableId, StableId>;
  conciseExplanation: string;
  decisiveKeywords: string[];
  testedExamPattern: string;
  correctChoiceWins: string;
  selectedDistractorAttractions: string[];
  selectedDistractorFailures: string[];
  rootCause: ErrorCause | null;
  confidenceObservation: string | null;
  recommendedNextAction: RecommendedTrainingAction;
  sourceQuestionRefs: SourceQuestionReference[];
  bankDataIssueAffectedDiagnosis: boolean;
}

export interface PersonalizedDrillAttempt {
  attemptId: StableId;
  runtimeSessionId: StableId;
  activityId: StableId;
  drillId: StableId;
  topicId: StableId;
  domainId: DopC02DomainId;
  activityType: DrillActivityType;
  drillForm: DrillDefinition['drillForm'];
  difficulty: RecommendedDifficulty;
  sourceQuestionRefs: SourceQuestionReference[];
  selectedAnswers: StableId[];
  orderedItems: StableId[];
  mappingSelections: Record<StableId, StableId>;
  confidence: Confidence;
  reasoning: DrillAttemptDraft;
  submittedAt: string;
  responseTimeSeconds: number | null;
  activeTimeSeconds: number | null;
  assessment: DrillAttemptAssessment;
  drillEngineVersion: string;
  runtimeEngineVersion: string;
}

export interface DrillActivityView {
  activityId: StableId;
  drillId: StableId;
  activityType: DrillActivityType;
  title: string;
  instructions: string;
  prompt: string;
  answerOptions: DrillAnswerOption[];
  workflowItems: WorkflowItem[];
  mappingItems: MappingItem[];
  progressLabel: string;
  estimatedMinutes: number;
}

export interface PersonalizedTrainingActivityRuntime {
  activityId: StableId;
  planActivityId: StableId;
  drillId: StableId;
  topicId: StableId;
  status: ActivityRuntimeStatus;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  draft: DrillAttemptDraft | null;
  attemptId: StableId | null;
  unavailableReason: string | null;
}

export interface PersonalizedTrainingRuntimeSession {
  runtimeSessionId: StableId;
  planId: StableId;
  runtimeEngineVersion: string;
  startedAt: string | null;
  lastUpdatedAt: string;
  completedAt: string | null;
  status: RuntimeSessionStatus;
  energyLevel: TrainingEnergyLevel;
  availableMinutes: number;
  currentActivityIndex: number;
  activities: PersonalizedTrainingActivityRuntime[];
  activeElapsedSeconds: number;
  pausedElapsedSeconds: number;
  completedActivityCount: number;
  stopReason: RuntimeStopReason | null;
}

export interface DrillValidationFailure {
  code: DrillValidationCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface DrillValidationResult {
  valid: boolean;
  failures: DrillValidationFailure[];
}

export interface TrainingRecommendation {
  id: StableId;
  topicId: StableId;
  priority: TrainingPriority;
  reason: string;
  recommendedPlanId: StableId | null;
  sourceQuestions: SourceQuestionReference[];
}

export interface PersonalizedTrainingManifest {
  schemaVersion: SchemaVersion;
  contentVersion: string;
  updatedAt: string;
  defaultProfileFile?: string;
  packages?: PersonalizedTrainingPackageManifestEntry[];
  profileFiles: string[];
  topicFiles: string[];
  mapFiles: string[];
  drillFiles: string[];
}

export interface PersonalizedTrainingContentIssue {
  code: PersonalizedTrainingContentIssueCode;
  severity: 'warning' | 'error';
  scope: 'manifest' | 'profile' | 'package' | 'topic' | 'map' | 'comparison' | 'drill';
  packageId?: StableId;
  contentId?: StableId;
  message: string;
  details?: Record<string, unknown>;
}

export interface PersonalizedTrainingLoadedContent {
  status: PersonalizedTrainingContentStatus;
  loadedPackageCount: number;
  rejectedPackageCount: number;
  topicCount: number;
  mapCount: number;
  comparisonCount: number;
  drillCount: number;
  issues: PersonalizedTrainingContentIssue[];
  activeProfile: PersonalizedTrainingLearnerProfile | null;
  contentVersion: string;
  manifest: PersonalizedTrainingContentManifest;
  topics: TrainingTopicDescriptor[];
  maps: MentalMap[];
  comparisons: ServiceComparison[];
  drills: DrillDefinition[];
  packages: PersonalizedTrainingContentPackage[];
}

export interface PersonalizedTrainingState {
  schemaVersion: SchemaVersion;
  topicMastery: Record<StableId, TopicMastery>;
  drillAttempts: DrillAttempt[];
  sessions: PersonalizedSession[];
  reviewSchedule: Record<StableId, ReviewSchedule>;
  importedExamSessions: ImportedExamSession[];
  importHistory: ImportAuditSummary[];
  importParserVersion: string;
  latestPrioritySnapshot: TrainingPrioritySnapshot | null;
  latestTrainingSessionPlan: TrainingSessionPlan | null;
  trainingSessionPlanHistory: TrainingSessionPlan[];
  priorityEngineVersion: string | null;
  activeRuntimeSession: PersonalizedTrainingRuntimeSession | null;
  runtimeSessionHistory: PersonalizedTrainingRuntimeSession[];
  personalizedDrillAttempts: PersonalizedDrillAttempt[];
  generatedEvidence: TrainingEvidenceItem[];
  drillEngineVersion: string | null;
  recommendations: TrainingRecommendation[];
  updatedAt: string;
}
