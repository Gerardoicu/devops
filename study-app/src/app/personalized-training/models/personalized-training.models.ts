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

export interface TrainingSessionPlan {
  id: StableId;
  createdAt: string;
  goal: TrainingGoal;
  priority: TrainingPriority;
  steps: PersonalizedSessionStep[];
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
  profileFiles: string[];
  topicFiles: string[];
  mapFiles: string[];
  drillFiles: string[];
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
  recommendations: TrainingRecommendation[];
  updatedAt: string;
}
