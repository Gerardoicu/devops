import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PersonalizedTrainingPackageService } from './personalized-training-package.service';
import { PersonalizedTrainingContentPackage } from '../models/personalized-training.models';
import { singleChoiceDrillFixture, workflowDrillFixture } from '../testing/drill-engine.fixtures';

describe('PersonalizedTrainingPackageService', () => {
  let service: PersonalizedTrainingPackageService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PersonalizedTrainingPackageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads enabled packages in deterministic manifest order', async () => {
    const promise = firstValueFrom(service.loadContent());

    http.expectOne('assets/personalized-training/manifest.json').flush({
      schemaVersion: '1.0',
      contentVersion: '1.0.0',
      packages: [
        { packageId: 'b', version: '1.0.0', file: 'packages/b.json', enabled: true, order: 20 },
        { packageId: 'a', version: '1.0.0', file: 'packages/a.json', enabled: true, order: 10 }
      ]
    });
    http.expectOne('assets/personalized-training/packages/a.json').flush(packageFixture('a', 'topic-a', 'drill-a'));
    http.expectOne('assets/personalized-training/packages/b.json').flush(packageFixture('b', 'topic-b', 'drill-b'));

    const result = await promise;

    expect(result.status).toBe('valid');
    expect(result.packages.map((item) => item.packageId)).toEqual(['a', 'b']);
    expect(result.loadedPackageCount).toBe(2);
  });

  it('keeps a valid package when another package is invalid or unavailable', async () => {
    const promise = firstValueFrom(service.loadContent());

    http.expectOne('assets/personalized-training/manifest.json').flush({
      schemaVersion: '1.0',
      contentVersion: '1.0.0',
      packages: [
        { packageId: 'valid', version: '1.0.0', file: 'packages/valid.json', enabled: true, order: 1 },
        { packageId: 'missing', version: '1.0.0', file: 'packages/missing.json', enabled: true, order: 2 }
      ]
    });
    http.expectOne('assets/personalized-training/packages/valid.json').flush(packageFixture('valid', 'topic-valid', 'drill-valid'));
    http.expectOne('assets/personalized-training/packages/missing.json').flush(null, { status: 404, statusText: 'Not found' });

    const result = await promise;

    expect(result.status).toBe('partially_available');
    expect(result.loadedPackageCount).toBe(1);
    expect(result.rejectedPackageCount).toBe(1);
    expect(result.issues.some((issue) => issue.code === 'package_unavailable')).toBe(true);
  });

  it('rejects duplicate IDs and broken cross-references without overwriting content', async () => {
    const promise = firstValueFrom(service.loadContent());

    http.expectOne('assets/personalized-training/manifest.json').flush({
      schemaVersion: '1.0',
      contentVersion: '1.0.0',
      packages: [
        { packageId: 'one', version: '1.0.0', file: 'packages/one.json', enabled: true, order: 1 },
        { packageId: 'two', version: '1.0.0', file: 'packages/two.json', enabled: true, order: 2 }
      ]
    });
    http.expectOne('assets/personalized-training/packages/one.json').flush(packageFixture('one', 'topic-shared', 'drill-one'));
    http.expectOne('assets/personalized-training/packages/two.json').flush({
      ...packageFixture('two', 'topic-two', 'drill-two'),
      topicDescriptors: [
        {
          ...packageFixture('two', 'topic-two', 'drill-two').topicDescriptors[0],
          topicId: 'topic-shared',
          prerequisiteTopicIds: ['missing-topic']
        }
      ]
    });

    const result = await promise;

    expect(result.loadedPackageCount).toBe(1);
    expect(result.topicCount).toBe(1);
    expect(result.issues.some((issue) => issue.code === 'duplicate_topic_id')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'invalid_prerequisite_reference')).toBe(true);
  });

  it('handles an empty production manifest safely', async () => {
    const promise = firstValueFrom(service.loadContent());

    http.expectOne('assets/personalized-training/manifest.json').flush({
      schemaVersion: '1.0',
      contentVersion: '1.0.0',
      packages: []
    });

    const result = await promise;

    expect(result.status).toBe('valid_with_warnings');
    expect(result.loadedPackageCount).toBe(0);
    expect(result.drillCount).toBe(0);
  });
});

function packageFixture(packageId: string, topicId: string, drillId: string): PersonalizedTrainingContentPackage {
  const drill = {
    ...singleChoiceDrillFixture,
    drillId,
    topicId,
    sourceQuestionRefs: [{ bank: 'verified' as const, questionId: 101 }]
  };
  return {
    schemaVersion: '1.0',
    packageId,
    version: '1.0.0',
    title: packageId,
    description: 'Fixture package',
    topicDescriptors: [
      {
        topicId,
        title: `Topic ${topicId}`,
        domainId: 'security_compliance',
        blueprintRelevance: 1,
        currentStatus: 'untested',
        prerequisiteTopicIds: [],
        relatedPatternIds: [],
        sourceQuestions: [{ bank: 'verified', questionId: 101 }]
      }
    ],
    conceptMaps: [],
    comparisons: [],
    drillDefinitions: [drill, { ...workflowDrillFixture, drillId: `${drillId}-workflow`, topicId }],
    sourceQuestionRefs: [{ bank: 'verified', questionId: 101 }],
    prerequisiteRelationships: [],
    tags: ['fixture']
  };
}
