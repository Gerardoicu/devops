import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Preparacion DOP-C02');
  });

  it('shows personalized training entry on home and hides the Quick Quiz home entry', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Entrenamiento personalizado');
    expect(compiled.textContent).not.toContain('Quiz rapido');
    expect(typeof fixture.componentInstance.startQuickQuiz).toBe('function');
  });

  it('opens and exits the personalized-training shell through internal phase navigation', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    app.openPersonalizedTraining();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(app.phase()).toBe('personalized-training');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-personalized-training-shell')).not.toBeNull();

    app.goHome();

    expect(app.phase()).toBe('home');
    scrollSpy.mockRestore();
  });

  it('exports simulator answers with schema v2 names, arrays, nullable confidence, and preserved timing', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.simulatorQueue.set([
      {
        id: 36,
        questionType: 'multi',
        question: 'Choose the deployment safeguards.',
        options: { A: 'One', B: 'Two', D: 'Four', E: 'Five' },
        correctAnswers: ['B', 'D', 'E'],
        explanation: 'Use staged controls.',
        domainName: 'Deployment',
        topic: 'CI/CD'
      },
      {
        id: 37,
        questionType: 'single',
        question: 'Choose one alarm target.',
        options: { A: 'SNS', B: 'S3' },
        correctAnswers: ['A'],
        explanation: 'SNS is a target.',
        domainName: 'Monitoring',
        topic: 'Alarms'
      }
    ]);
    app.simulatorAnswers.set({ 36: ['D', 'B'], 37: ['A'] });
    app.simulatorConfidence.set({ 36: 4 });
    app.simulatorNotes.set({ 36: 'Review E', 37: '  certain  ' });
    app.simulatorQuestionTimeSeconds.set({ 36: 42, 37: 7 });

    const records = app.simulatorExportRecords();

    expect(records[0]).toMatchObject({
      question: 36,
      question_type: 'multi',
      selected_answers: ['B', 'D'],
      correct_answers: ['B', 'D', 'E'],
      answer: ['B', 'D'],
      correct_answer: ['B', 'D', 'E'],
      answered: true,
      is_correct: false,
      confidence: 4,
      time_seconds: 42,
      notes: 'Review E'
    });
    expect(records[1].selected_answers).toEqual(['A']);
    expect(records[1].correct_answers).toEqual(['A']);
    expect(records[1].confidence).toBeNull();
    expect(records[1].notes).toBe('certain');
  });

  it('limits exported confidence to 1 through 5', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.setSimulatorConfidence(1, 10);
    app.setSimulatorConfidence(2, -3);
    app.setSimulatorConfidence(3, 3.6);

    expect(app.simulatorConfidence()).toEqual({ 1: 5, 2: 1, 3: 4 });
  });

  it('opens optional notes without changing saved note text', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.isSimulatorNotesOpen(10)).toBe(false);

    app.openSimulatorNotes(10);
    app.setSimulatorNotes(10, 'Compare A and C');

    expect(app.isSimulatorNotesOpen(10)).toBe(true);
    expect(app.simulatorNotesValue(10)).toBe('Compare A and C');
  });

  it('shows unanswered count before confirmed exam finish', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    app.simulatorQueue.set([
      {
        id: 1,
        questionType: 'single',
        question: 'First?',
        options: { A: 'A' },
        correctAnswers: ['A'],
        explanation: '',
        domainName: null,
        topic: null
      },
      {
        id: 2,
        questionType: 'single',
        question: 'Second?',
        options: { A: 'A' },
        correctAnswers: ['A'],
        explanation: '',
        domainName: null,
        topic: null
      }
    ]);
    app.simulatorAnswers.set({ 1: ['A'] });

    app.confirmFinishSimulator();

    expect(confirmSpy).toHaveBeenCalledWith(
      'Te falta 1 pregunta sin responder. ¿Quieres entregar el examen ahora?'
    );
    expect(app.phase()).toBe('home');

    confirmSpy.mockRestore();
  });

  it('captures question time and scrolls to top after moving to the next rendered question', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    vi.useFakeTimers();

    app.simulatorQueue.set([
      {
        id: 1,
        questionType: 'single',
        question: 'First?',
        options: { A: 'A' },
        correctAnswers: ['A'],
        explanation: '',
        domainName: null,
        topic: null
      },
      {
        id: 2,
        questionType: 'single',
        question: 'Second?',
        options: { A: 'A' },
        correctAnswers: ['A'],
        explanation: '',
        domainName: null,
        topic: null
      },
      {
        id: 3,
        questionType: 'single',
        question: 'Third?',
        options: { A: 'A' },
        correctAnswers: ['A'],
        explanation: '',
        domainName: null,
        topic: null
      }
    ]);
    app.simulatorIndex.set(0);
    app.simulatorQuestionStartedAt.set(Date.now() - 2500);

    app.nextSimulatorQuestion();
    app.nextSimulatorQuestion();

    expect(app.simulatorIndex()).toBe(1);
    expect(app.simulatorQuestionTimeSeconds()[1]).toBeGreaterThanOrEqual(2);
    expect(scrollSpy).not.toHaveBeenCalled();

    vi.runOnlyPendingTimers();

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });

    scrollSpy.mockRestore();
    vi.useRealTimers();
  });
});
