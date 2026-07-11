import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TrainingPlanComponent } from './training-plan.component';

describe('TrainingPlanComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TrainingPlanComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('offers the required time and energy controls without ability labels', () => {
    const fixture = TestBed.createComponent(TrainingPlanComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    for (const minutes of ['5 min', '10 min', '15 min', '20 min', '30 min']) {
      expect(text).toContain(minutes);
    }
    expect(text).toContain('Energia baja');
    expect(text).toContain('Energia normal');
    expect(text).toContain('Energia alta');
    expect(text).not.toContain('habilidad');
  });
});
