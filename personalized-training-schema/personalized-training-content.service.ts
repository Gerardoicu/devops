import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import {
  DrillSet,
  DrillDefinition,
  MentalMap,
  PersonalizedTrainingManifest,
  PersonalizedTrainingProfile,
  TrainingTopic
} from '../models/personalized-training.models';
import {
  isDrillSet,
  isPersonalizedTrainingManifest,
  isRecord
} from '../utils/personalized-training-validation';
import { validateDrillDefinition } from '../utils/drill-definition-validation';

const BASE_PATH = 'assets/personalized-training';

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingContentService {
  private readonly http = inject(HttpClient);

  loadManifest(): Observable<PersonalizedTrainingManifest> {
    return this.http.get<unknown>(`${BASE_PATH}/manifest.json`).pipe(
      map((value) => this.toManifest(value)),
      catchError(() => of(this.emptyManifest()))
    );
  }

  loadProfile(fileName: string): Observable<PersonalizedTrainingProfile | null> {
    return this.http.get<unknown>(`${BASE_PATH}/profiles/${encodeURIComponent(fileName)}`).pipe(
      map((value) => (this.isProfile(value) ? value : null)),
      catchError(() => of(null))
    );
  }

  loadTopic(fileName: string): Observable<TrainingTopic | null> {
    return this.http.get<unknown>(`${BASE_PATH}/topics/${encodeURIComponent(fileName)}`).pipe(
      map((value) => (this.isTopic(value) ? value : null)),
      catchError(() => of(null))
    );
  }

  loadMentalMap(fileName: string): Observable<MentalMap | null> {
    return this.http.get<unknown>(`${BASE_PATH}/maps/${encodeURIComponent(fileName)}`).pipe(
      map((value) => (this.isMentalMap(value) ? value : null)),
      catchError(() => of(null))
    );
  }

  loadDrillSet(fileName: string): Observable<DrillSet | null> {
    return this.http.get<unknown>(`${BASE_PATH}/drills/${encodeURIComponent(fileName)}`).pipe(
      map((value) => (isDrillSet(value) ? value : null)),
      catchError(() => of(null))
    );
  }

  loadDrillDefinition(fileName: string): Observable<DrillDefinition | null> {
    return this.http.get<unknown>(`${BASE_PATH}/drill-definitions/${encodeURIComponent(fileName)}`).pipe(
      map((value) => (this.isDrillDefinition(value) && validateDrillDefinition(value).valid ? value : null)),
      catchError(() => of(null))
    );
  }

  loadDrillDefinitions(fileNames: readonly string[]): Observable<DrillDefinition[]> {
    if (fileNames.length === 0) {
      return of([]);
    }
    return this.http.get<unknown[]>(`${BASE_PATH}/drill-definitions/index.json`).pipe(
      map((values) => values.filter((value): value is DrillDefinition => this.isDrillDefinition(value) && validateDrillDefinition(value).valid)),
      catchError(() => of([]))
    );
  }

  resolvePlannedActivityToDrillDefinition(
    activityId: string,
    definitions: readonly DrillDefinition[]
  ): DrillDefinition | null {
    return definitions.find((definition) => definition.drillId === activityId || definition.activityType === activityId) ?? null;
  }

  private emptyManifest(): PersonalizedTrainingManifest {
    return {
      schemaVersion: '1.0',
      contentVersion: '0.0.0',
      updatedAt: '1970-01-01T00:00:00.000Z',
      packages: [],
      profileFiles: [],
      topicFiles: [],
      mapFiles: [],
      drillFiles: []
    };
  }

  private toManifest(value: unknown): PersonalizedTrainingManifest {
    if (isPersonalizedTrainingManifest(value)) {
      return { ...value, packages: value.packages ?? [] };
    }
    if (isRecord(value) && value['schemaVersion'] === '1.0' && typeof value['contentVersion'] === 'string') {
      return {
        schemaVersion: '1.0',
        contentVersion: value['contentVersion'],
        updatedAt: typeof value['updatedAt'] === 'string' ? value['updatedAt'] : '1970-01-01T00:00:00.000Z',
        defaultProfileFile: typeof value['defaultProfileFile'] === 'string' ? value['defaultProfileFile'] : undefined,
        packages: Array.isArray(value['packages']) ? value['packages'] as PersonalizedTrainingManifest['packages'] : [],
        profileFiles: Array.isArray(value['profileFiles']) ? value['profileFiles'].filter((item): item is string => typeof item === 'string') : [],
        topicFiles: Array.isArray(value['topicFiles']) ? value['topicFiles'].filter((item): item is string => typeof item === 'string') : [],
        mapFiles: Array.isArray(value['mapFiles']) ? value['mapFiles'].filter((item): item is string => typeof item === 'string') : [],
        drillFiles: Array.isArray(value['drillFiles']) ? value['drillFiles'].filter((item): item is string => typeof item === 'string') : []
      };
    }
    return this.emptyManifest();
  }

  private isProfile(value: unknown): value is PersonalizedTrainingProfile {
    return (
      isRecord(value) &&
      value['schemaVersion'] === '1.0' &&
      typeof value['id'] === 'string' &&
      typeof value['learnerId'] === 'string' &&
      isRecord(value['preferences']) &&
      Array.isArray(value['weakAreas']) &&
      Array.isArray(value['blueprintCoverage'])
    );
  }

  private isTopic(value: unknown): value is TrainingTopic {
    return (
      isRecord(value) &&
      value['schemaVersion'] === '1.0' &&
      typeof value['id'] === 'string' &&
      typeof value['title'] === 'string' &&
      Array.isArray(value['objectives']) &&
      Array.isArray(value['sourceQuestions'])
    );
  }

  private isMentalMap(value: unknown): value is MentalMap {
    return (
      isRecord(value) &&
      value['schemaVersion'] === '1.0' &&
      typeof value['id'] === 'string' &&
      typeof value['topicId'] === 'string' &&
      Array.isArray(value['steps'])
    );
  }

  private isDrillDefinition(value: unknown): value is DrillDefinition {
    return (
      isRecord(value) &&
      typeof value['drillId'] === 'string' &&
      typeof value['topicId'] === 'string' &&
      typeof value['domainId'] === 'string' &&
      typeof value['activityType'] === 'string' &&
      typeof value['title'] === 'string' &&
      Array.isArray(value['answerOptions']) &&
      Array.isArray(value['sourceQuestionRefs']) &&
      isRecord(value['expectedAnswer']) &&
      isRecord(value['evaluationRules']) &&
      isRecord(value['explanation'])
    );
  }
}
