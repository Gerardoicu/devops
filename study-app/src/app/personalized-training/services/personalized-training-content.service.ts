import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import {
  DrillSet,
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

const BASE_PATH = 'assets/personalized-training';

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingContentService {
  private readonly http = inject(HttpClient);

  loadManifest(): Observable<PersonalizedTrainingManifest> {
    return this.http.get<unknown>(`${BASE_PATH}/manifest.json`).pipe(
      map((value) => (isPersonalizedTrainingManifest(value) ? value : this.emptyManifest())),
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

  private emptyManifest(): PersonalizedTrainingManifest {
    return {
      schemaVersion: '1.0',
      contentVersion: '0.0.0',
      updatedAt: '1970-01-01T00:00:00.000Z',
      profileFiles: [],
      topicFiles: [],
      mapFiles: [],
      drillFiles: []
    };
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
}
