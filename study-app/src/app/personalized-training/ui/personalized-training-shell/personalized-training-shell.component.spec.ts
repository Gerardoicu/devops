import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PersonalizedTrainingShellComponent } from './personalized-training-shell.component';

describe('PersonalizedTrainingShellComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PersonalizedTrainingShellComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('renders the dashboard with no imported sessions', () => {
    const fixture = TestBed.createComponent(PersonalizedTrainingShellComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Estado actual');
    expect(text).toContain('Aun no hay resultados importados');
    expect(text).not.toContain('ready');
  });

  it('emits exit for returning to the existing home screen', () => {
    const fixture = TestBed.createComponent(PersonalizedTrainingShellComponent);
    const spy = vi.fn();
    fixture.componentInstance.exit.subscribe(spy);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector('button')?.dispatchEvent(new MouseEvent('click'));

    expect(spy).toHaveBeenCalled();
  });
});
