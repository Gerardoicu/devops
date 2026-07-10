import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PersonalizedTrainingContentService } from './personalized-training-content.service';
import { singleChoiceDrillFixture } from '../testing/drill-engine.fixtures';

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

  it('loads and validates a drill definition', async () => {
    const promise = firstValueFrom(service.loadDrillDefinition('fixture.json'));

    http.expectOne('assets/personalized-training/drill-definitions/fixture.json').flush(singleChoiceDrillFixture);

    await expect(promise).resolves.toMatchObject({ drillId: 'drill-single' });
  });

  it('resolves a planned activity to a supplied drill definition', () => {
    expect(service.resolvePlannedActivityToDrillDefinition('drill-single', [singleChoiceDrillFixture])?.drillId).toBe('drill-single');
  });
});
