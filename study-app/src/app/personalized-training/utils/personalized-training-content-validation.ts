import {
  DopC02DomainId,
  PersonalizedTrainingContentIssue,
  PersonalizedTrainingContentManifest,
  PersonalizedTrainingContentPackage,
  PersonalizedTrainingLearnerProfile,
  SourceQuestionReference
} from '../models/personalized-training.models';
import { validateDrillDefinition } from './drill-definition-validation';
import { isRecord } from './personalized-training-validation';

const SUPPORTED_DOMAINS: readonly DopC02DomainId[] = [
  'sdlc_automation',
  'configuration_management_iac',
  'resilient_cloud_solutions',
  'monitoring_logging',
  'incident_event_response',
  'security_compliance'
];

export function isContentManifest(value: unknown): value is PersonalizedTrainingContentManifest {
  return (
    isRecord(value) &&
    value['schemaVersion'] === '1.0' &&
    typeof value['contentVersion'] === 'string' &&
    (!Object.prototype.hasOwnProperty.call(value, 'updatedAt') || typeof value['updatedAt'] === 'string') &&
    (!Object.prototype.hasOwnProperty.call(value, 'defaultProfileFile') || typeof value['defaultProfileFile'] === 'string') &&
    Array.isArray(value['packages']) &&
    value['packages'].every((item) =>
      isRecord(item) &&
      typeof item['packageId'] === 'string' &&
      typeof item['version'] === 'string' &&
      typeof item['file'] === 'string' &&
      typeof item['enabled'] === 'boolean' &&
      typeof item['order'] === 'number'
    )
  );
}

export function legacyManifestToContentManifest(value: unknown): PersonalizedTrainingContentManifest | null {
  if (!isRecord(value) || value['schemaVersion'] !== '1.0' || typeof value['contentVersion'] !== 'string') {
    return null;
  }
  return {
    schemaVersion: '1.0',
    contentVersion: value['contentVersion'],
    updatedAt: typeof value['updatedAt'] === 'string' ? value['updatedAt'] : undefined,
    defaultProfileFile: typeof value['defaultProfileFile'] === 'string' ? value['defaultProfileFile'] : undefined,
    packages: Array.isArray(value['packages'])
      ? value['packages'].filter((item): item is PersonalizedTrainingContentManifest['packages'][number] =>
          isRecord(item) &&
          typeof item['packageId'] === 'string' &&
          typeof item['version'] === 'string' &&
          typeof item['file'] === 'string' &&
          typeof item['enabled'] === 'boolean' &&
          typeof item['order'] === 'number'
        )
      : []
  };
}

export function validateManifest(manifest: Readonly<PersonalizedTrainingContentManifest>): PersonalizedTrainingContentIssue[] {
  const issues: PersonalizedTrainingContentIssue[] = [];
  if (manifest.schemaVersion !== '1.0') {
    issues.push(issue('unsupported_manifest_schema', 'error', 'manifest', 'Manifest schema is unsupported.'));
  }
  const seen = new Set<string>();
  for (const entry of manifest.packages) {
    if (seen.has(entry.packageId)) {
      issues.push(issue('duplicate_package_id', 'error', 'manifest', `Duplicate package ID ${entry.packageId}.`, entry.packageId));
    }
    seen.add(entry.packageId);
  }
  return issues;
}

export function isLearnerProfile(value: unknown): value is PersonalizedTrainingLearnerProfile {
  return (
    isRecord(value) &&
    value['schemaVersion'] === '1.0' &&
    typeof value['profileId'] === 'string' &&
    typeof value['learnerId'] === 'string' &&
    typeof value['displayName'] === 'string' &&
    typeof value['targetCertification'] === 'string' &&
    (typeof value['examDate'] === 'string' || value['examDate'] === null) &&
    Array.isArray(value['manuallyCuratedWeakPatterns']) &&
    Array.isArray(value['manualCoachingEvidence']) &&
    isRecord(value['topicStatuses']) &&
    isRecord(value['preferences']) &&
    Array.isArray(value['priorityTopicIds']) &&
    isRecord(value['studyConstraints'])
  );
}

export function isContentPackage(value: unknown): value is PersonalizedTrainingContentPackage {
  return (
    isRecord(value) &&
    value['schemaVersion'] === '1.0' &&
    typeof value['packageId'] === 'string' &&
    typeof value['version'] === 'string' &&
    typeof value['title'] === 'string' &&
    typeof value['description'] === 'string' &&
    Array.isArray(value['topicDescriptors']) &&
    Array.isArray(value['conceptMaps']) &&
    Array.isArray(value['comparisons']) &&
    Array.isArray(value['drillDefinitions']) &&
    Array.isArray(value['sourceQuestionRefs']) &&
    Array.isArray(value['prerequisiteRelationships']) &&
    Array.isArray(value['tags'])
  );
}

export function validateContentPackage(
  pkg: Readonly<PersonalizedTrainingContentPackage>,
  expectedVersion: string
): PersonalizedTrainingContentIssue[] {
  const issues: PersonalizedTrainingContentIssue[] = [];
  if (pkg.version !== expectedVersion) {
    issues.push(issue('package_version_mismatch', 'error', 'package', 'Package version does not match manifest entry.', pkg.packageId));
  }

  const topicIds = new Set(pkg.topicDescriptors.map((topic) => topic.topicId));
  validateUnique(pkg.topicDescriptors, (topic) => topic.topicId, 'duplicate_topic_id', 'topic', pkg.packageId, issues);
  validateUnique(pkg.conceptMaps, (map) => map.id, 'duplicate_map_id', 'map', pkg.packageId, issues);
  validateUnique(pkg.comparisons, (comparison) => comparison.id, 'duplicate_comparison_id', 'comparison', pkg.packageId, issues);
  validateUnique(pkg.drillDefinitions, (drill) => drill.drillId, 'duplicate_drill_id', 'drill', pkg.packageId, issues);

  for (const topic of pkg.topicDescriptors) {
    if (!SUPPORTED_DOMAINS.includes(topic.domainId)) {
      issues.push(issue('unsupported_domain_id', 'error', 'topic', `Unsupported domain ${topic.domainId}.`, pkg.packageId, topic.topicId));
    }
    for (const prerequisiteId of topic.prerequisiteTopicIds) {
      if (!topicIds.has(prerequisiteId)) {
        issues.push(issue('invalid_prerequisite_reference', 'error', 'topic', 'Prerequisite topic is not present in package.', pkg.packageId, topic.topicId));
      }
    }
    validateSources(topic.sourceQuestions, pkg.packageId, topic.topicId, 'topic', issues);
  }

  for (const relationship of pkg.prerequisiteRelationships) {
    if (!topicIds.has(relationship.topicId) || relationship.prerequisiteTopicIds.some((id) => !topicIds.has(id))) {
      issues.push(issue('invalid_prerequisite_reference', 'error', 'package', 'Prerequisite relationship references an unknown topic.', pkg.packageId));
    }
  }

  for (const map of pkg.conceptMaps) {
    if (!topicIds.has(map.topicId)) {
      issues.push(issue('invalid_topic_reference', 'error', 'map', 'Concept map references an unknown topic.', pkg.packageId, map.id));
    }
    validateSources(map.steps.flatMap((step) => step.sourceQuestions), pkg.packageId, map.id, 'map', issues);
  }

  for (const comparison of pkg.comparisons) {
    if (!topicIds.has(comparison.topicId)) {
      issues.push(issue('invalid_topic_reference', 'error', 'comparison', 'Comparison references an unknown topic.', pkg.packageId, comparison.id));
    }
    validateSources(comparison.sourceQuestions, pkg.packageId, comparison.id, 'comparison', issues);
  }

  for (const drill of pkg.drillDefinitions) {
    if (!topicIds.has(drill.topicId)) {
      issues.push(issue('invalid_topic_reference', 'error', 'drill', 'Drill references an unknown topic.', pkg.packageId, drill.drillId));
    }
    validateSources(drill.sourceQuestionRefs, pkg.packageId, drill.drillId, 'drill', issues);
    const drillResult = validateDrillDefinition(drill);
    for (const failure of drillResult.failures) {
      issues.push(issue('invalid_drill_definition', 'error', 'drill', failure.message, pkg.packageId, drill.drillId, { code: failure.code }));
    }
  }

  return issues;
}

export function packageHasErrors(issues: readonly PersonalizedTrainingContentIssue[], packageId: string): boolean {
  return issues.some((item) => item.packageId === packageId && item.severity === 'error');
}

function validateUnique<T>(
  values: readonly T[],
  getId: (value: T) => string,
  code: PersonalizedTrainingContentIssue['code'],
  scope: PersonalizedTrainingContentIssue['scope'],
  packageId: string,
  issues: PersonalizedTrainingContentIssue[]
): void {
  const seen = new Set<string>();
  for (const value of values) {
    const id = getId(value);
    if (!id || seen.has(id)) {
      issues.push(issue(code, 'error', scope, `Duplicate or missing ID ${id}.`, packageId, id));
    }
    seen.add(id);
  }
}

function validateSources(
  sources: readonly SourceQuestionReference[],
  packageId: string,
  contentId: string,
  scope: PersonalizedTrainingContentIssue['scope'],
  issues: PersonalizedTrainingContentIssue[]
): void {
  for (const source of sources) {
    if ((source.bank !== 'verified' && source.bank !== 'public') || !Number.isInteger(source.questionId)) {
      issues.push(issue('invalid_source_question_reference', 'error', scope, 'Source question reference must include bank and numeric question ID.', packageId, contentId));
    }
  }
}

function issue(
  code: PersonalizedTrainingContentIssue['code'],
  severity: PersonalizedTrainingContentIssue['severity'],
  scope: PersonalizedTrainingContentIssue['scope'],
  message: string,
  packageId?: string,
  contentId?: string,
  details?: Record<string, unknown>
): PersonalizedTrainingContentIssue {
  return {
    code,
    severity,
    scope,
    ...(packageId ? { packageId } : {}),
    ...(contentId ? { contentId } : {}),
    message,
    ...(details ? { details } : {})
  };
}
