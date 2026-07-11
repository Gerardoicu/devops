import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TrainingImportComponent } from './training-import.component';
import { importQualityWarningLabels } from '../../services/personalized-training-facade.service';

describe('TrainingImportComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TrainingImportComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('renders file and pasted JSON preview controls', () => {
    const fixture = TestBed.createComponent(TrainingImportComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('input[type="file"]')).not.toBeNull();
    expect(compiled.querySelector('textarea')).not.toBeNull();
    expect(compiled.textContent).toContain('Previsualizar texto');
  });

  it('labels warnings as possible or unreliable', () => {
    const labels = importQualityWarningLabels([
      { code: 'missing_confidence', severity: 'warning', scope: 'question', message: 'missing' },
      { code: 'known_bank_data_issue', severity: 'warning', scope: 'question', message: 'known' },
      { code: 'anomalous_short_response_time', severity: 'warning', scope: 'question', message: 'short' }
    ]);

    expect(labels).toContain('Confidence values may be unreliable');
    expect(labels).toContain('Known source-bank inconsistency');
    expect(labels).toContain('Possible rushed segment detected');
  });
});
