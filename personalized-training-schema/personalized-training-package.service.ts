import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  DrillDefinition,
  MentalMap,
  PersonalizedTrainingContentIssue,
  PersonalizedTrainingContentManifest,
  PersonalizedTrainingContentPackage,
  PersonalizedTrainingLearnerProfile,
  PersonalizedTrainingLoadedContent,
  ServiceComparison,
  TrainingTopicDescriptor
} from '../models/personalized-training.models';
import {
  isContentManifest,
  isContentPackage,
  isLearnerProfile,
  legacyManifestToContentManifest,
  packageHasErrors,
  validateContentPackage,
  validateManifest
} from '../utils/personalized-training-content-validation';

const BASE_PATH = 'assets/personalized-training';

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingPackageService {
  private readonly http = inject(HttpClient);

  loadContent(): Observable<PersonalizedTrainingLoadedContent> {
    return this.loadManifest().pipe(
      switchMap((manifestResult) => {
        const manifestIssues = validateManifest(manifestResult.manifest);
        const enabledEntries = [...manifestResult.manifest.packages]
          .filter((entry) => entry.enabled)
          .sort((left, right) => left.order - right.order || left.packageId.localeCompare(right.packageId));
        const profile$ = manifestResult.manifest.defaultProfileFile
          ? this.loadProfile(manifestResult.manifest.defaultProfileFile)
          : of({ profile: null, issues: [] });
        const packageLoads$ = enabledEntries.length
          ? forkJoin(enabledEntries.map((entry) => this.loadPackage(entry.file, entry.packageId, entry.version)))
          : of([]);

        return forkJoin({ profileResult: profile$, packageResults: packageLoads$ }).pipe(
          map(({ profileResult, packageResults }) =>
            this.mergeContent(manifestResult.manifest, [
              ...manifestResult.issues,
              ...manifestIssues,
              ...profileResult.issues
            ], profileResult.profile, packageResults)
          )
        );
      }),
      catchError(() => of(emptyLoadedContent([issue('manifest_unavailable', 'error', 'manifest', 'Content manifest could not be loaded.')])))
    );
  }

  private loadManifest(): Observable<{ manifest: PersonalizedTrainingContentManifest; issues: PersonalizedTrainingContentIssue[] }> {
    return this.http.get<unknown>(`${BASE_PATH}/manifest.json`).pipe(
      map((value) => {
        const manifest = isContentManifest(value) ? value : legacyManifestToContentManifest(value);
        if (!manifest) {
          return {
            manifest: emptyManifest(),
            issues: [issue('unsupported_manifest_schema', 'error', 'manifest', 'Manifest shape is unsupported.')]
          };
        }
        return { manifest, issues: [] };
      }),
      catchError(() => of({ manifest: emptyManifest(), issues: [issue('manifest_unavailable', 'error', 'manifest', 'Content manifest could not be loaded.')] }))
    );
  }

  private loadProfile(file: string): Observable<{ profile: PersonalizedTrainingLearnerProfile | null; issues: PersonalizedTrainingContentIssue[] }> {
    return this.http.get<unknown>(`${BASE_PATH}/${file}`).pipe(
      map((value) =>
        isLearnerProfile(value)
          ? { profile: value, issues: [] }
          : { profile: null, issues: [issue('unsupported_profile_schema', 'error', 'profile', 'Profile schema is unsupported.')] }
      ),
      catchError(() => of({ profile: null, issues: [issue('profile_unavailable', 'warning', 'profile', 'Profile file could not be loaded.')] }))
    );
  }

  private loadPackage(
    file: string,
    packageId: string,
    version: string
  ): Observable<{ package: PersonalizedTrainingContentPackage | null; issues: PersonalizedTrainingContentIssue[] }> {
    return this.http.get<unknown>(`${BASE_PATH}/${file}`).pipe(
      map((value) => {
        if (!isContentPackage(value)) {
          return {
            package: null,
            issues: [issue('unsupported_package_schema', 'error', 'package', 'Package schema is unsupported.', packageId)]
          };
        }
        const validationIssues = validateContentPackage(value, version);
        return { package: value, issues: validationIssues };
      }),
      catchError(() =>
        of({
          package: null,
          issues: [issue('package_unavailable', 'error', 'package', 'Package file could not be loaded.', packageId)]
        })
      )
    );
  }

  private mergeContent(
    manifest: PersonalizedTrainingContentManifest,
    initialIssues: readonly PersonalizedTrainingContentIssue[],
    profile: PersonalizedTrainingLearnerProfile | null,
    packageResults: readonly { package: PersonalizedTrainingContentPackage | null; issues: PersonalizedTrainingContentIssue[] }[]
  ): PersonalizedTrainingLoadedContent {
    const issues: PersonalizedTrainingContentIssue[] = [...initialIssues];
    const packages: PersonalizedTrainingContentPackage[] = [];
    const topics: TrainingTopicDescriptor[] = [];
    const maps: MentalMap[] = [];
    const comparisons: ServiceComparison[] = [];
    const drills: DrillDefinition[] = [];
    const seen = {
      packageIds: new Set<string>(),
      topicIds: new Set<string>(),
      mapIds: new Set<string>(),
      comparisonIds: new Set<string>(),
      drillIds: new Set<string>()
    };
    let rejectedPackageCount = 0;

    for (const result of packageResults) {
      issues.push(...result.issues);
      const pkg = result.package;
      if (!pkg) {
        rejectedPackageCount += 1;
        continue;
      }
      const duplicateIssues = duplicateMergeIssues(pkg, seen);
      issues.push(...duplicateIssues);
      if (duplicateIssues.length || packageHasErrors(issues, pkg.packageId)) {
        rejectedPackageCount += 1;
        continue;
      }
      seen.packageIds.add(pkg.packageId);
      pkg.topicDescriptors.forEach((item) => seen.topicIds.add(item.topicId));
      pkg.conceptMaps.forEach((item) => seen.mapIds.add(item.id));
      pkg.comparisons.forEach((item) => seen.comparisonIds.add(item.id));
      pkg.drillDefinitions.forEach((item) => seen.drillIds.add(item.drillId));
      packages.push(pkg);
      topics.push(...pkg.topicDescriptors);
      maps.push(...pkg.conceptMaps);
      comparisons.push(...pkg.comparisons);
      drills.push(...pkg.drillDefinitions);
    }

    return {
      status: determineStatus(manifest, issues, packages.length, rejectedPackageCount),
      loadedPackageCount: packages.length,
      rejectedPackageCount,
      topicCount: topics.length,
      mapCount: maps.length,
      comparisonCount: comparisons.length,
      drillCount: drills.length,
      issues,
      activeProfile: profile,
      contentVersion: manifest.contentVersion,
      manifest,
      topics,
      maps,
      comparisons,
      drills,
      packages
    };
  }
}

function duplicateMergeIssues(
  pkg: PersonalizedTrainingContentPackage,
  seen: {
    packageIds: Set<string>;
    topicIds: Set<string>;
    mapIds: Set<string>;
    comparisonIds: Set<string>;
    drillIds: Set<string>;
  }
): PersonalizedTrainingContentIssue[] {
  const issues: PersonalizedTrainingContentIssue[] = [];
  if (seen.packageIds.has(pkg.packageId)) {
    issues.push(issue('duplicate_package_id', 'error', 'package', `Duplicate package ID ${pkg.packageId}.`, pkg.packageId));
  }
  pushDuplicates(pkg.topicDescriptors.map((item) => item.topicId), seen.topicIds, 'duplicate_topic_id', 'topic', pkg.packageId, issues);
  pushDuplicates(pkg.conceptMaps.map((item) => item.id), seen.mapIds, 'duplicate_map_id', 'map', pkg.packageId, issues);
  pushDuplicates(pkg.comparisons.map((item) => item.id), seen.comparisonIds, 'duplicate_comparison_id', 'comparison', pkg.packageId, issues);
  pushDuplicates(pkg.drillDefinitions.map((item) => item.drillId), seen.drillIds, 'duplicate_drill_id', 'drill', pkg.packageId, issues);
  return issues;
}

function pushDuplicates(
  ids: readonly string[],
  seen: ReadonlySet<string>,
  code: PersonalizedTrainingContentIssue['code'],
  scope: PersonalizedTrainingContentIssue['scope'],
  packageId: string,
  issues: PersonalizedTrainingContentIssue[]
): void {
  for (const id of ids) {
    if (seen.has(id)) {
      issues.push(issue(code, 'error', scope, `Duplicate content ID ${id}.`, packageId, id));
    }
  }
}

function determineStatus(
  manifest: PersonalizedTrainingContentManifest,
  issues: readonly PersonalizedTrainingContentIssue[],
  loadedPackageCount: number,
  rejectedPackageCount: number
): PersonalizedTrainingLoadedContent['status'] {
  if (issues.some((item) => item.code === 'manifest_unavailable')) {
    return 'unavailable';
  }
  if (manifest.packages.filter((entry) => entry.enabled).length === 0) {
    return issues.some((item) => item.severity === 'error') ? 'invalid' : 'valid_with_warnings';
  }
  if (loadedPackageCount > 0 && rejectedPackageCount > 0) {
    return 'partially_available';
  }
  if (loadedPackageCount === 0 && rejectedPackageCount > 0) {
    return 'invalid';
  }
  return issues.some((item) => item.severity === 'warning') ? 'valid_with_warnings' : 'valid';
}

function emptyManifest(): PersonalizedTrainingContentManifest {
  return {
    schemaVersion: '1.0',
    contentVersion: '0.0.0',
    packages: []
  };
}

function emptyLoadedContent(issues: PersonalizedTrainingContentIssue[]): PersonalizedTrainingLoadedContent {
  const manifest = emptyManifest();
  return {
    status: 'unavailable',
    loadedPackageCount: 0,
    rejectedPackageCount: 0,
    topicCount: 0,
    mapCount: 0,
    comparisonCount: 0,
    drillCount: 0,
    issues,
    activeProfile: null,
    contentVersion: manifest.contentVersion,
    manifest,
    topics: [],
    maps: [],
    comparisons: [],
    drills: [],
    packages: []
  };
}

function issue(
  code: PersonalizedTrainingContentIssue['code'],
  severity: PersonalizedTrainingContentIssue['severity'],
  scope: PersonalizedTrainingContentIssue['scope'],
  message: string,
  packageId?: string,
  contentId?: string
): PersonalizedTrainingContentIssue {
  return {
    code,
    severity,
    scope,
    ...(packageId ? { packageId } : {}),
    ...(contentId ? { contentId } : {}),
    message
  };
}
