import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PersonalizedTrainingContentService } from './personalized-training-content.service';

describe('PersonalizedTrainingContentService', () => {
  let service: PersonalizedTrainingContentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PersonalizedTrainingContentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('handles an empty manifest', async () => {
    const promise = firstValueFrom(service.loadManifest());

    http.expectOne('assets/personalized-training/manifest.json').flush({
      schemaVersion: '1.0',
      contentVersion: '0.0.0',
      updatedAt: '2026-07-10T00:00:00.000Z',
      profileFiles: [],
      topicFiles: [],
      mapFiles: [],
      drillFiles: []
    });

    await expect(promise).resolves.toMatchObject({
      schemaVersion: '1.0',
      profileFiles: [],
      topicFiles: [],
      mapFiles: [],
      drillFiles: []
    });
  });
});
