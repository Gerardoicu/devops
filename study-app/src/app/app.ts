import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type CardType = 'learn' | 'compare' | 'decision' | 'trap' | 'mini-quiz';
type SessionMode = 'learn' | 'review';
type AppPhase =
  | 'home'
  | 'session'
  | 'complete'
  | 'simulator'
  | 'simulator-complete'
  | 'notes'
  | 'official-links'
  | 'visual-scenarios'
  | 'glossary';
type SimulatorBankType = 'verified' | 'public';
type AssessmentMode = 'quick-quiz' | 'exam';

interface CardOption {
  id: string;
  label: string;
}

interface StudyCard {
  id: string;
  type: CardType;
  title: string;
  prompt: string;
  body?: string;
  options?: CardOption[];
  answer?: string;
  explanation: string;
  tags: string[];
  source: 'notes' | 'bank' | 'official';
  questionIds: number[];
  difficulty: number;
}

interface SimulatorQuestion {
  id: number;
  questionType: 'single' | 'multi';
  question: string;
  options: Record<string, string>;
  correctAnswers: string[];
  explanation: string;
  domainName: string | null;
  topic: string | null;
}

interface CardProgress {
  seen: number;
  correct: number;
  incorrect: number;
  review: number;
  needsReview: boolean;
  lastResult: 'correct' | 'incorrect' | 'review' | null;
}

interface DeckState {
  progress: Record<string, CardProgress>;
  examHistory: Record<SimulatorBankType, { attempts: number; lastScorePercent: number | null }>;
}

interface SessionSummary {
  mode: SessionMode;
  total: number;
  correct: number;
  incorrect: number;
  review: number;
}

interface SimulatorSummary {
  bankType: SimulatorBankType;
  total: number;
  answered: number;
  unanswered: number;
  correct: number;
  incorrect: number;
  scorePercent: number;
  elapsedSeconds: number;
  bySystem: Array<{
    system: string;
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    scorePercent: number;
  }>;
}

interface StudyNote {
  id: string;
  title: string;
  fileName: string;
}

interface OfficialLink {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

interface VisualScenario {
  id: string;
  title: string;
  category: string;
  summary: string;
  decision: string;
  trap: string;
  questionIds: number[];
  imageUrl: string;
}

interface GlossaryEntry {
  id: string;
  title: string;
  aliases: string[];
  summary: string;
  details: string[];
  tags: string[];
}

const STORAGE_KEY = 'dop-c02-study-state-v1';
const RUNTIME_STORAGE_KEY = 'dop-c02-runtime-state-v1';
const SIMULATOR_DURATION_SECONDS = 180 * 60;

interface RuntimeSnapshot {
  phase: AppPhase;
  sessionMode: SessionMode;
  sessionQueueIds: string[];
  currentIndex: number;
  selectedAnswer: string | null;
  revealed: boolean;
  sessionSummary: SessionSummary | null;
  simulatorBankType: SimulatorBankType;
  simulatorQueueIds: number[];
  simulatorIndex: number;
  simulatorAnswers: Record<number, string[]>;
  simulatorSummary: SimulatorSummary | null;
  showSimulatorReview: boolean;
  remainingSeconds: number;
  simulatorStartedAt: number | null;
  simulatorDeadlineAt: number | null;
  activeNoteId: string | null;
  activeGlossaryId: string | null;
  glossaryReturnPhase: AppPhase | null;
  assessmentMode: AssessmentMode;
  quickQuizRevealed: boolean;
  quickQuizLastCorrect: boolean | null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private audioContext: AudioContext | null = null;
  readonly appVersion = 'v1.2.7';

  readonly cards = signal<StudyCard[]>([]);
  readonly conceptCards = signal<StudyCard[]>([]);
  readonly quickQuizBank = signal<SimulatorQuestion[]>([]);
  readonly simulatorBank = signal<SimulatorQuestion[]>([]);
  readonly publicSimulatorBank = signal<SimulatorQuestion[]>([]);
  readonly notes = signal<StudyNote[]>([]);
  readonly officialLinks = signal<OfficialLink[]>([]);
  readonly visualScenarios = signal<VisualScenario[]>([]);
  readonly glossaryEntries = signal<GlossaryEntry[]>([]);
  readonly visualScenarioQuestionFilter = signal<number | null>(null);
  readonly activeNote = signal<StudyNote | null>(null);
  readonly activeNoteContent = signal('');
  readonly activeNoteRendered = signal<SafeHtml>('');
  readonly activeGlossaryEntry = signal<GlossaryEntry | null>(null);
  readonly glossaryQuery = signal('');
  readonly glossaryReturnPhase = signal<AppPhase | null>(null);
  readonly simulatorBankType = signal<SimulatorBankType>('verified');
  readonly assessmentMode = signal<AssessmentMode>('exam');
  readonly phase = signal<AppPhase>('home');
  readonly sessionMode = signal<SessionMode>('learn');
  readonly sessionQueue = signal<StudyCard[]>([]);
  readonly currentIndex = signal(0);
  readonly selectedAnswer = signal<string | null>(null);
  readonly revealed = signal(false);
  readonly state = signal<DeckState>(this.loadState());
  readonly sessionSummary = signal<SessionSummary | null>(null);
  readonly simulatorQueue = signal<SimulatorQuestion[]>([]);
  readonly simulatorIndex = signal(0);
  readonly simulatorAnswers = signal<Record<number, string[]>>({});
  readonly simulatorSummary = signal<SimulatorSummary | null>(null);
  readonly showSimulatorReview = signal(false);
  readonly remainingSeconds = signal(SIMULATOR_DURATION_SECONDS);
  readonly simulatorStartedAt = signal<number | null>(null);
  readonly simulatorDeadlineAt = signal<number | null>(null);
  readonly quickQuizRevealed = signal(false);
  readonly quickQuizLastCorrect = signal<boolean | null>(null);

  readonly currentCard = computed(() => this.sessionQueue()[this.currentIndex()] ?? null);
  readonly currentSimulatorQuestion = computed(
    () => this.simulatorQueue()[this.simulatorIndex()] ?? null
  );
  readonly currentCardSystemTags = computed(() => {
    const card = this.currentCard();
    if (!card) {
      return [];
    }
    return card.tags.filter((tag) =>
      ['ci-cd', 'iac', 'resilience', 'observability', 'operations', 'security'].includes(tag)
    );
  });
  readonly currentCardConceptTags = computed(() => {
    const card = this.currentCard();
    if (!card) {
      return [];
    }
    return card.tags
      .filter((tag) => !['ci-cd', 'iac', 'resilience', 'observability', 'operations', 'security'].includes(tag))
      .slice(0, 4);
  });
  readonly sessionProgress = computed(() => {
    const total = this.sessionQueue().length;
    if (!total) {
      return 0;
    }
    return Math.round((this.sessionPosition() / total) * 100);
  });
  readonly totalCards = computed(() => this.conceptCards().length);
  readonly simulatorTotal = computed(() => this.simulatorQueue().length);
  readonly simulatorPosition = computed(() =>
    this.simulatorQueue().length ? this.simulatorIndex() + 1 : 0
  );
  readonly simulatorProgress = computed(() => {
    const total = this.simulatorQueue().length;
    if (!total) {
      return 0;
    }
    return Math.round((this.simulatorPosition() / total) * 100);
  });
  readonly simulatorAnsweredCount = computed(() =>
    Object.values(this.simulatorAnswers()).filter((answers) => answers.length > 0).length
  );
  readonly quickQuizCorrectCount = computed(() =>
    this.simulatorQueue().reduce((sum, question) => {
      const selected = [...(this.simulatorAnswers()[question.id] ?? [])].sort();
      const expected = [...question.correctAnswers].sort();
      const isCorrect =
        selected.length > 0 &&
        selected.length === expected.length &&
        selected.every((value, index) => value === expected[index]);
      return sum + (isCorrect ? 1 : 0);
    }, 0)
  );
  readonly quickQuizIncorrectCount = computed(() =>
    this.simulatorAnsweredCount() - this.quickQuizCorrectCount()
  );
  readonly formattedRemainingTime = computed(() => {
    const totalSeconds = this.remainingSeconds();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  });
  readonly simulatorReviewItems = computed(() =>
    this.simulatorQueue().map((question) => {
      const selected = this.simulatorAnswers()[question.id] ?? [];
      const expected = question.correctAnswers;
      const isCorrect =
        selected.length === expected.length &&
        [...selected].sort().every((value, index) => value === [...expected].sort()[index]);

      return {
        question,
        selected,
        expected,
        isCorrect
      };
    })
  );
  readonly progressByCard = computed(() => this.state().progress);
  readonly verifiedExamHistory = computed(
    () => this.state().examHistory.verified ?? { attempts: 0, lastScorePercent: null }
  );
  readonly publicExamHistory = computed(
    () => this.state().examHistory.public ?? { attempts: 0, lastScorePercent: null }
  );
  readonly reviewCount = computed(
    () => Object.values(this.progressByCard()).filter((entry) => entry.needsReview).length
  );
  readonly seenCount = computed(
    () => Object.values(this.progressByCard()).filter((entry) => entry.seen > 0).length
  );
  readonly quizCorrect = computed(() =>
    this.conceptCards().reduce((sum, card) => {
      if (!card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.correct ?? 0);
    }, 0)
  );
  readonly quizIncorrect = computed(() =>
    this.conceptCards().reduce((sum, card) => {
      if (!card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.incorrect ?? 0);
    }, 0)
  );
  readonly learnConfirmed = computed(() =>
    this.conceptCards().reduce((sum, card) => {
      if (card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.correct ?? 0);
    }, 0)
  );
  readonly learnReviewMarked = computed(() =>
    this.conceptCards().reduce((sum, card) => {
      if (card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.review ?? 0);
    }, 0)
  );
  readonly sessionPosition = computed(() =>
    this.sessionQueue().length ? this.currentIndex() + 1 : 0
  );
  readonly quizAccuracy = computed(() => {
    const correct = this.quizCorrect();
    const incorrect = this.quizIncorrect();
    const total = correct + incorrect;
    return total ? Math.round((correct / total) * 100) : 0;
  });
  readonly isAnswerCard = computed(() => !!this.currentCard()?.options?.length);
  readonly currentResult = computed<'correct' | 'incorrect' | 'review' | null>(() => {
    const card = this.currentCard();
    return card ? this.progressByCard()[card.id]?.lastResult ?? null : null;
  });
  readonly sessionModes: SessionMode[] = ['learn'];
  readonly currentSimulatorGlossaryEntries = computed(() => {
    const question = this.currentSimulatorQuestion();
    return question ? this.findGlossaryEntriesForQuestion(question) : [];
  });
  readonly relatedVisualScenarios = computed(() => {
    const question = this.currentSimulatorQuestion();
    if (!question) {
      return [];
    }
    return this.visualScenarios().filter((scenario) => scenario.questionIds.includes(question.id));
  });
  readonly filteredVisualScenarios = computed(() => {
    const filter = this.visualScenarioQuestionFilter();
    if (filter === null) {
      return this.visualScenarios();
    }
    return this.visualScenarios().filter((scenario) => scenario.questionIds.includes(filter));
  });
  readonly currentCardGlossaryEntries = computed(() => {
    const card = this.currentCard();
    return card ? this.findGlossaryEntries(`${card.title}\n${card.prompt}\n${card.body ?? ''}\n${card.explanation}`) : [];
  });
  readonly isQuickQuiz = computed(() => this.assessmentMode() === 'quick-quiz');
  readonly filteredGlossaryEntries = computed(() => {
    const query = this.glossaryQuery().trim().toLowerCase();
    const entries = this.glossaryEntries();
    if (!query) {
      return entries;
    }
    return entries.filter((entry) =>
      entry.title.toLowerCase().includes(query) ||
      entry.aliases.some((alias) => alias.toLowerCase().includes(query)) ||
      entry.summary.toLowerCase().includes(query)
    );
  });
  readonly officialLinksByCategory = computed(() => {
    const order = [
      'Examen',
      'CI/CD',
      'IaC',
      'Observabilidad',
      'Operaciones',
      'Config',
      'Seguridad',
      'Resiliencia',
      'Datos',
      'Red',
      'Otros'
    ];
    const grouped = new Map<string, OfficialLink[]>();

    for (const link of this.officialLinks()) {
      const category = this.normalizeOfficialCategory(link.category);
      const items = grouped.get(category) ?? [];
      items.push(link);
      grouped.set(category, items);
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => {
        const leftIndex = order.indexOf(left);
        const rightIndex = order.indexOf(right);
        const safeLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
        const safeRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
        if (safeLeft !== safeRight) {
          return safeLeft - safeRight;
        }
        return left.localeCompare(right, 'es', { sensitivity: 'base' });
      })
      .map(([category, links]) => ({
        category,
        links: [...links].sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }))
      }));
  });
  readonly canGoNext = computed(() => this.revealed());
  readonly isCorrect = computed(() => {
    const result = this.currentResult();
    return result === 'correct';
  });
  readonly modeMeta: Record<
    SessionMode,
    { title: string; subtitle: string; cta: string; description: string }
  > = {
    learn: {
      title: 'Patrones y mapas',
      subtitle: 'Lectura guiada',
      cta: 'Abrir lectura completa',
      description:
        'Lectura secuencial de patrones, trampas y mapas mentales sacados de tus apuntes. No es glosario.'
    },
    review: {
      title: 'Repasar errores',
      subtitle: 'Ataca tus fallos',
      cta: 'Empezar repaso',
      description:
        'Prioriza cards marcadas para repaso para cerrar huecos antes de seguir avanzando.'
    }
  };
  private simulatorTimerId: ReturnType<typeof setInterval> | null = null;
  private runtimeRestored = false;
  private runtimePersistenceEnabled = false;

  constructor() {
    this.http.get<StudyCard[]>('assets/cards.json').subscribe((cards) => {
      this.cards.set(cards);
      this.tryRestoreRuntime();
    });
    this.http.get<StudyCard[]>('assets/concept-feed.json').subscribe((cards) => {
      this.conceptCards.set(cards);
      this.tryRestoreRuntime();
    });
    this.http.get<SimulatorQuestion[]>('assets/quick-quiz-bank.json').subscribe((questions) => {
      this.quickQuizBank.set(questions);
      this.tryRestoreRuntime();
    });
    this.http.get<SimulatorQuestion[]>('assets/simulator-bank.json').subscribe((questions) => {
      this.simulatorBank.set(questions);
      this.tryRestoreRuntime();
    });
    this.http.get<SimulatorQuestion[]>('assets/simulator-bank-public.json').subscribe((questions) => {
      this.publicSimulatorBank.set(questions);
      this.tryRestoreRuntime();
    });
    this.http.get<StudyNote[]>('assets/notes-index.json').subscribe((notes) => {
      this.notes.set(notes);
      this.tryRestoreRuntime();
    });
    this.http.get<OfficialLink[]>('assets/official-links.json').subscribe((links) => {
      this.officialLinks.set(links);
      this.tryRestoreRuntime();
    });
    this.http.get<VisualScenario[]>('assets/visual-scenarios.json').subscribe((scenarios) => {
      this.visualScenarios.set(scenarios);
      this.tryRestoreRuntime();
    });
    this.http.get<GlossaryEntry[]>('assets/glossary.json').subscribe((entries) => {
      this.glossaryEntries.set(entries);
      this.tryRestoreRuntime();
    });

    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
    });

    effect(() => {
      if (!this.runtimePersistenceEnabled) {
        return;
      }

      localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(this.buildRuntimeSnapshot()));
    });
  }

  startSession(mode: SessionMode): void {
    this.sessionMode.set(mode);
    this.selectedAnswer.set(null);
    this.revealed.set(false);
    this.sessionSummary.set(null);

    const cards = this.conceptCards();
    const progress = this.progressByCard();
    let nextQueue: StudyCard[] = [];

    if (mode === 'review') {
      nextQueue = cards.filter((card) => progress[card.id]?.needsReview);
    } else {
      nextQueue = [...cards];
    }

    if (!nextQueue.length) {
      nextQueue = [...cards];
    }

    this.sessionQueue.set(nextQueue);
    this.currentIndex.set(0);
    this.phase.set('session');
    this.playTone('start');
  }

  startQuickQuiz(): void {
    this.assessmentMode.set('quick-quiz');
    const queue = this.shuffle(this.quickQuizBank()).slice(0, Math.min(100, this.quickQuizBank().length));
    this.simulatorBankType.set('verified');
    this.simulatorQueue.set(queue);
    this.simulatorIndex.set(0);
    this.simulatorAnswers.set({});
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    this.remainingSeconds.set(0);
    this.simulatorStartedAt.set(null);
    this.simulatorDeadlineAt.set(null);
    this.quickQuizRevealed.set(false);
    this.quickQuizLastCorrect.set(null);
    this.phase.set('simulator');
    this.playTone('start');
  }

  goHome(): void {
    this.clearSimulatorTimer();
    this.phase.set('home');
    this.selectedAnswer.set(null);
    this.revealed.set(false);
    this.activeNote.set(null);
    this.activeNoteContent.set('');
    this.sessionSummary.set(null);
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    this.activeGlossaryEntry.set(null);
    this.glossaryReturnPhase.set(null);
    this.quickQuizRevealed.set(false);
    this.quickQuizLastCorrect.set(null);
    this.visualScenarioQuestionFilter.set(null);
  }

  openNote(note: StudyNote): void {
    this.http
      .get(`assets/notes/${encodeURIComponent(note.fileName)}`, { responseType: 'text' })
      .subscribe((content) => {
        this.activeNote.set(note);
        this.activeNoteContent.set(content);
        this.activeNoteRendered.set(this.renderNoteMarkdown(content));
        this.phase.set('notes');
      });
  }

  openOfficialLinks(): void {
    this.phase.set('official-links');
  }

  openVisualScenarios(): void {
    this.visualScenarioQuestionFilter.set(null);
    this.phase.set('visual-scenarios');
  }

  openVisualScenariosForQuestion(questionId: number): void {
    this.visualScenarioQuestionFilter.set(questionId);
    this.phase.set('visual-scenarios');
  }

  openVerifiedQuestion(questionId: number): void {
    const question = this.simulatorBank().find((item) => item.id === questionId);
    if (!question) {
      return;
    }
    this.clearSimulatorTimer();
    this.assessmentMode.set('exam');
    this.simulatorBankType.set('verified');
    this.simulatorQueue.set([question]);
    this.simulatorIndex.set(0);
    this.simulatorAnswers.set({});
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    this.remainingSeconds.set(0);
    this.simulatorStartedAt.set(null);
    this.simulatorDeadlineAt.set(null);
    this.quickQuizRevealed.set(false);
    this.quickQuizLastCorrect.set(null);
    this.phase.set('simulator');
    this.playTone('start');
  }

  openGlossaryBrowser(): void {
    this.activeGlossaryEntry.set(null);
    this.glossaryQuery.set('');
    this.glossaryReturnPhase.set(this.phase());
    this.phase.set('glossary');
  }

  openGlossary(entry: GlossaryEntry): void {
    if (this.phase() !== 'glossary') {
      this.glossaryReturnPhase.set(this.phase());
    }
    this.activeGlossaryEntry.set(entry);
    this.phase.set('glossary');
  }

  closeGlossary(): void {
    const returnPhase = this.glossaryReturnPhase();
    this.activeGlossaryEntry.set(null);
    this.glossaryReturnPhase.set(null);
    this.glossaryQuery.set('');
    this.phase.set(returnPhase ?? 'home');
  }

  startSimulator(bankType: SimulatorBankType = 'verified'): void {
    this.assessmentMode.set('exam');
    this.simulatorBankType.set(bankType);
    const sourceBank = bankType === 'verified' ? this.simulatorBank() : this.publicSimulatorBank();
    const queue = this.shuffle(sourceBank).slice(0, Math.min(75, sourceBank.length));
    this.simulatorQueue.set(queue);
    this.simulatorIndex.set(0);
    this.simulatorAnswers.set({});
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    this.remainingSeconds.set(SIMULATOR_DURATION_SECONDS);
    const startedAt = Date.now();
    this.simulatorStartedAt.set(startedAt);
    this.simulatorDeadlineAt.set(startedAt + SIMULATOR_DURATION_SECONDS * 1000);
    this.phase.set('simulator');
    this.startSimulatorTimer();
    this.playTone('start');
  }

  simulatorOptionKeys(question: SimulatorQuestion | null): string[] {
    return question ? Object.keys(question.options) : [];
  }

  isSimulatorSelected(questionId: number, optionId: string): boolean {
    return (this.simulatorAnswers()[questionId] ?? []).includes(optionId);
  }

  selectSimulatorOption(question: SimulatorQuestion, optionId: string): void {
    if (this.isQuickQuiz()) {
      if (this.quickQuizRevealed()) {
        return;
      }

      const next = question.questionType === 'single' ? [optionId] : [optionId];
      this.simulatorAnswers.update((current) => ({
        ...current,
        [question.id]: next
      }));

      const expected = [...question.correctAnswers].sort();
      const selected = [...next].sort();
      const isCorrect =
        selected.length === expected.length &&
        selected.every((value, index) => value === expected[index]);

      this.quickQuizRevealed.set(true);
      this.quickQuizLastCorrect.set(isCorrect);
      this.playTone(isCorrect ? 'correct' : 'incorrect');
      return;
    }

    this.simulatorAnswers.update((current) => {
      const existing = current[question.id] ?? [];
      const next =
        question.questionType === 'single'
          ? [optionId]
          : existing.includes(optionId)
            ? existing.filter((value) => value !== optionId)
            : [...existing, optionId].sort();

      return {
        ...current,
        [question.id]: next
      };
    });
    this.playTone('soft');
  }

  prevSimulatorQuestion(): void {
    if (this.simulatorIndex() > 0) {
      this.simulatorIndex.update((value) => value - 1);
      this.playTone('next');
    }
  }

  nextSimulatorQuestion(): void {
    if (this.isQuickQuiz() && !this.quickQuizRevealed()) {
      return;
    }

    if (this.simulatorIndex() < this.simulatorQueue().length - 1) {
      this.simulatorIndex.update((value) => value + 1);
      if (this.isQuickQuiz()) {
        this.quickQuizRevealed.set(false);
        this.quickQuizLastCorrect.set(null);
      }
      this.playTone('next');
      return;
    }
    this.finishSimulator();
  }

  goToSimulatorQuestion(index: number): void {
    if (index >= 0 && index < this.simulatorQueue().length) {
      this.simulatorIndex.set(index);
    }
  }

  simulatorQuestionState(index: number): 'current' | 'answered' | 'unanswered' {
    if (index === this.simulatorIndex()) {
      return 'current';
    }
    const question = this.simulatorQueue()[index];
    return (this.simulatorAnswers()[question.id] ?? []).length ? 'answered' : 'unanswered';
  }

  finishSimulator(): void {
    this.clearSimulatorTimer();
    const queue = this.simulatorQueue();
    const answers = this.simulatorAnswers();
    let answered = 0;
    let correct = 0;
    const bySystemMap = new Map<
      string,
      { system: string; total: number; correct: number; incorrect: number; unanswered: number; scorePercent: number }
    >();

    for (const question of queue) {
      const selected = [...(answers[question.id] ?? [])].sort();
      const expected = [...question.correctAnswers].sort();
      const system = this.normalizeSystemName(question.domainName);
      const currentSystem =
        bySystemMap.get(system) ??
        { system, total: 0, correct: 0, incorrect: 0, unanswered: 0, scorePercent: 0 };
      currentSystem.total += 1;

      if (selected.length) {
        answered += 1;
      } else {
        currentSystem.unanswered += 1;
      }

      if (
        selected.length === expected.length &&
        selected.every((value, index) => value === expected[index])
      ) {
        correct += 1;
        currentSystem.correct += 1;
      } else if (selected.length) {
        currentSystem.incorrect += 1;
      }

      bySystemMap.set(system, currentSystem);
    }

    const total = queue.length;
    const incorrect = answered - correct;
    const unanswered = total - answered;
    const elapsedSeconds = this.simulatorStartedAt()
      ? Math.max(0, SIMULATOR_DURATION_SECONDS - this.remainingSeconds())
      : 0;

    const bySystem = [...bySystemMap.values()]
      .map((entry) => ({
        ...entry,
        scorePercent: entry.total ? Math.round((entry.correct / entry.total) * 100) : 0
      }))
      .sort((a, b) => {
        if (a.scorePercent !== b.scorePercent) {
          return a.scorePercent - b.scorePercent;
        }
        return b.total - a.total;
      });

    this.simulatorSummary.set({
      bankType: this.simulatorBankType(),
      total,
      answered,
      unanswered,
      correct,
      incorrect,
      scorePercent: total ? Math.round((correct / total) * 100) : 0,
      elapsedSeconds,
      bySystem
    });
    if (this.assessmentMode() === 'exam') {
      this.state.update((current) => {
        const bankType = this.simulatorBankType();
        const previous = current.examHistory?.[bankType] ?? { attempts: 0, lastScorePercent: null };
        return {
          ...current,
          examHistory: {
            verified: current.examHistory?.verified ?? { attempts: 0, lastScorePercent: null },
            public: current.examHistory?.public ?? { attempts: 0, lastScorePercent: null },
            [bankType]: {
              attempts: previous.attempts + 1,
              lastScorePercent: total ? Math.round((correct / total) * 100) : 0
            }
          }
        };
      });
    }
    this.phase.set('simulator-complete');
    this.simulatorDeadlineAt.set(null);
    this.quickQuizRevealed.set(false);
    this.quickQuizLastCorrect.set(null);
    this.playTone('finish');
  }

  simulatorOptionClass(question: SimulatorQuestion, optionId: string): string {
    if (!this.isQuickQuiz() || !this.quickQuizRevealed()) {
      return this.isSimulatorSelected(question.id, optionId) ? 'selected' : '';
    }

    if (question.correctAnswers.includes(optionId)) {
      return 'correct';
    }

    if (this.isSimulatorSelected(question.id, optionId)) {
      return 'incorrect';
    }

    return '';
  }

  toggleSimulatorReview(): void {
    this.showSimulatorReview.update((value) => !value);
  }

  selectAnswer(optionId: string): void {
    if (this.revealed()) {
      return;
    }

    this.selectedAnswer.set(optionId);
    this.revealed.set(true);

    const card = this.currentCard();
    if (!card) {
      return;
    }

    const correct = card.answer === optionId;
    this.updateProgress(card.id, correct ? 'correct' : 'incorrect');
    this.playTone(correct ? 'correct' : 'incorrect');
  }

  markLearned(understood: boolean): void {
    if (this.revealed()) {
      return;
    }

    this.revealed.set(true);
    this.updateProgress(this.currentCard()!.id, understood ? 'correct' : 'review');
    this.playTone(understood ? 'soft' : 'review');
  }

  nextCard(): void {
    this.selectedAnswer.set(null);
    this.revealed.set(false);

    if (this.currentIndex() < this.sessionQueue().length - 1) {
      this.currentIndex.update((value) => value + 1);
      this.playTone('next');
      return;
    }

    this.finishSession();
  }

  optionClass(optionId: string): string {
    const card = this.currentCard();
    if (!card || !this.revealed()) {
      return '';
    }
    if (card.answer === optionId) {
      return 'correct';
    }
    if (this.selectedAnswer() === optionId) {
      return 'incorrect';
    }
    return '';
  }

  private updateProgress(cardId: string, result: 'correct' | 'incorrect' | 'review'): void {
    this.state.update((current) => {
      const existing = current.progress[cardId] ?? {
        seen: 0,
        correct: 0,
        incorrect: 0,
        review: 0,
        needsReview: false,
        lastResult: null
      };

      const next: CardProgress = {
        seen: existing.seen + 1,
        correct: existing.correct + (result === 'correct' ? 1 : 0),
        incorrect: existing.incorrect + (result === 'incorrect' ? 1 : 0),
        review: existing.review + (result === 'review' ? 1 : 0),
        needsReview: result !== 'correct',
        lastResult: result
      };

      return {
        ...current,
        progress: {
          ...current.progress,
          [cardId]: next
        }
      };
    });
  }

  private finishSession(): void {
    const queue = this.sessionQueue();
    const progress = this.progressByCard();

    const summary = queue.reduce(
      (acc, card) => {
        const result = progress[card.id]?.lastResult;
        if (result === 'correct') {
          acc.correct += 1;
        } else if (result === 'incorrect') {
          acc.incorrect += 1;
        } else if (result === 'review') {
          acc.review += 1;
        }
        return acc;
      },
      {
        mode: this.sessionMode(),
        total: queue.length,
        correct: 0,
        incorrect: 0,
        review: 0
      } satisfies SessionSummary
    );

    this.sessionSummary.set(summary);
    this.phase.set('complete');
    this.playTone('finish');
  }

  private startSimulatorTimer(): void {
    this.clearSimulatorTimer();
    this.syncRemainingSecondsFromDeadline();
    this.simulatorTimerId = setInterval(() => {
      this.syncRemainingSecondsFromDeadline();
      if (this.remainingSeconds() <= 0) {
        this.finishSimulator();
        return;
      }
    }, 1000);
  }

  private clearSimulatorTimer(): void {
    if (this.simulatorTimerId) {
      clearInterval(this.simulatorTimerId);
      this.simulatorTimerId = null;
    }
  }

  private playTone(kind: 'start' | 'next' | 'soft' | 'review' | 'correct' | 'incorrect' | 'finish'): void {
    const AudioCtor =
      globalThis.AudioContext ||
      (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtor) {
      return;
    }

    try {
      this.audioContext ??= new AudioCtor();
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        void ctx.resume().then(() => this.playTone(kind));
        return;
      }

      const patterns: Record<typeof kind, Array<{ frequency: number; duration: number; gain: number; type: OscillatorType }>> = {
        start: [
          { frequency: 440, duration: 0.05, gain: 0.05, type: 'triangle' },
          { frequency: 660, duration: 0.08, gain: 0.06, type: 'triangle' }
        ],
        next: [
          { frequency: 520, duration: 0.04, gain: 0.04, type: 'sine' }
        ],
        soft: [
          { frequency: 420, duration: 0.04, gain: 0.035, type: 'sine' }
        ],
        review: [
          { frequency: 320, duration: 0.05, gain: 0.04, type: 'triangle' },
          { frequency: 260, duration: 0.07, gain: 0.04, type: 'triangle' }
        ],
        correct: [
          { frequency: 660, duration: 0.06, gain: 0.05, type: 'triangle' },
          { frequency: 880, duration: 0.09, gain: 0.06, type: 'triangle' }
        ],
        incorrect: [
          { frequency: 300, duration: 0.06, gain: 0.04, type: 'sawtooth' },
          { frequency: 220, duration: 0.08, gain: 0.04, type: 'sawtooth' }
        ],
        finish: [
          { frequency: 523.25, duration: 0.06, gain: 0.045, type: 'triangle' },
          { frequency: 659.25, duration: 0.08, gain: 0.05, type: 'triangle' },
          { frequency: 783.99, duration: 0.1, gain: 0.055, type: 'triangle' }
        ]
      };

      let offset = 0;
      for (const tone of patterns[kind]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.type;
        osc.frequency.setValueAtTime(tone.frequency, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(tone.gain, ctx.currentTime + offset + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + tone.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + tone.duration + 0.01);
        offset += tone.duration + 0.012;
      }
    } catch {
      // Sonido opcional; no romper la app si falla.
    }
  }

  private loadState(): DeckState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        progress: {},
        examHistory: {
          verified: { attempts: 0, lastScorePercent: null },
          public: { attempts: 0, lastScorePercent: null }
        }
      };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<DeckState>;
      return {
        progress: parsed.progress ?? {},
        examHistory: {
          verified: parsed.examHistory?.verified ?? { attempts: 0, lastScorePercent: null },
          public: parsed.examHistory?.public ?? { attempts: 0, lastScorePercent: null }
        }
      };
    } catch {
      return {
        progress: {},
        examHistory: {
          verified: { attempts: 0, lastScorePercent: null },
          public: { attempts: 0, lastScorePercent: null }
        }
      };
    }
  }

  private tryRestoreRuntime(): void {
    if (this.runtimeRestored) {
      return;
    }

    if (!this.cards().length || !this.conceptCards().length || !this.quickQuizBank().length || !this.simulatorBank().length || !this.publicSimulatorBank().length || !this.notes().length || !this.visualScenarios().length || !this.glossaryEntries().length) {
      return;
    }

    this.runtimeRestored = true;

    const raw = localStorage.getItem(RUNTIME_STORAGE_KEY);
    if (!raw) {
      this.phase.set('home');
      this.runtimePersistenceEnabled = true;
      return;
    }

    try {
      const snapshot = JSON.parse(raw) as RuntimeSnapshot;
      this.restoreRuntimeSnapshot(snapshot);
    } catch {
      this.phase.set('home');
    }

    this.runtimePersistenceEnabled = true;
  }

  private buildRuntimeSnapshot(): RuntimeSnapshot {
    return {
      phase: this.phase(),
      sessionMode: this.sessionMode(),
      sessionQueueIds: this.sessionQueue().map((card) => card.id),
      currentIndex: this.currentIndex(),
      selectedAnswer: this.selectedAnswer(),
      revealed: this.revealed(),
      sessionSummary: this.sessionSummary(),
      simulatorBankType: this.simulatorBankType(),
      simulatorQueueIds: this.simulatorQueue().map((question) => question.id),
      simulatorIndex: this.simulatorIndex(),
      simulatorAnswers: this.simulatorAnswers(),
      simulatorSummary: this.simulatorSummary(),
      showSimulatorReview: this.showSimulatorReview(),
      remainingSeconds: this.remainingSeconds(),
      simulatorStartedAt: this.simulatorStartedAt(),
      simulatorDeadlineAt: this.simulatorDeadlineAt(),
      activeNoteId: this.activeNote()?.id ?? null,
      activeGlossaryId: this.activeGlossaryEntry()?.id ?? null,
      glossaryReturnPhase: this.glossaryReturnPhase(),
      assessmentMode: this.assessmentMode(),
      quickQuizRevealed: this.quickQuizRevealed(),
      quickQuizLastCorrect: this.quickQuizLastCorrect(),
    };
  }

  private restoreRuntimeSnapshot(snapshot: RuntimeSnapshot): void {
    this.sessionMode.set(snapshot.sessionMode ?? 'learn');
    this.selectedAnswer.set(snapshot.selectedAnswer ?? null);
    this.revealed.set(!!snapshot.revealed);
    this.sessionSummary.set(snapshot.sessionSummary ?? null);
    this.simulatorBankType.set(snapshot.simulatorBankType ?? 'verified');
    this.simulatorAnswers.set(snapshot.simulatorAnswers ?? {});
    this.simulatorSummary.set(snapshot.simulatorSummary ?? null);
    this.showSimulatorReview.set(!!snapshot.showSimulatorReview);
    this.remainingSeconds.set(snapshot.remainingSeconds ?? SIMULATOR_DURATION_SECONDS);
    this.simulatorStartedAt.set(snapshot.simulatorStartedAt ?? null);
    this.simulatorDeadlineAt.set(snapshot.simulatorDeadlineAt ?? null);
    this.assessmentMode.set(snapshot.assessmentMode ?? 'exam');
    this.glossaryReturnPhase.set(snapshot.glossaryReturnPhase ?? null);
    this.quickQuizRevealed.set(!!snapshot.quickQuizRevealed);
    this.quickQuizLastCorrect.set(snapshot.quickQuizLastCorrect ?? null);

    const cardsById = new Map(this.conceptCards().map((card) => [card.id, card]));
    const restoredSessionQueue = (snapshot.sessionQueueIds ?? [])
      .map((id) => cardsById.get(id))
      .filter((card): card is StudyCard => !!card);
    this.sessionQueue.set(restoredSessionQueue);
    this.currentIndex.set(
      restoredSessionQueue.length
        ? Math.min(Math.max(snapshot.currentIndex ?? 0, 0), restoredSessionQueue.length - 1)
        : 0
    );

    const simulatorSource =
      (snapshot.simulatorBankType ?? 'verified') === 'verified'
        ? this.simulatorBank()
        : this.publicSimulatorBank();
    const simulatorById = new Map(simulatorSource.map((question) => [question.id, question]));
    const restoredSimulatorQueue = (snapshot.simulatorQueueIds ?? [])
      .map((id) => simulatorById.get(id))
      .filter((question): question is SimulatorQuestion => !!question);
    this.simulatorQueue.set(restoredSimulatorQueue);
    this.simulatorIndex.set(
      restoredSimulatorQueue.length
        ? Math.min(Math.max(snapshot.simulatorIndex ?? 0, 0), restoredSimulatorQueue.length - 1)
        : 0
    );

    const activeNote = this.notes().find((note) => note.id === snapshot.activeNoteId) ?? null;
    if (activeNote) {
      this.openNote(activeNote);
      return;
    }

    const glossaryEntry = this.glossaryEntries().find((entry) => entry.id === snapshot.activeGlossaryId) ?? null;
    if (glossaryEntry) {
      this.activeGlossaryEntry.set(glossaryEntry);
    }

    this.phase.set(snapshot.phase ?? 'home');

    if (snapshot.phase === 'simulator' && restoredSimulatorQueue.length && snapshot.assessmentMode !== 'quick-quiz') {
      this.syncRemainingSecondsFromDeadline();
      if (this.remainingSeconds() > 0) {
        this.startSimulatorTimer();
      } else {
        this.finishSimulator();
      }
    }
  }

  findGlossaryEntriesForQuestion(question: SimulatorQuestion): GlossaryEntry[] {
    const haystack = `${question.topic ?? ''}\n${question.question}\n${Object.values(question.options).join('\n')}`;
    return this.findGlossaryEntries(haystack);
  }

  findGlossaryEntries(haystack: string): GlossaryEntry[] {
    const normalizedHaystack = this.normalizeGlossaryText(haystack);

    return this.glossaryEntries()
      .filter((entry) =>
        this.glossarySearchTerms(entry).some((term) => normalizedHaystack.includes(term))
      )
      .sort((left, right) => {
        const leftLen = Math.max(...this.glossarySearchTerms(left).map((term) => term.length));
        const rightLen = Math.max(...this.glossarySearchTerms(right).map((term) => term.length));
        return rightLen - leftLen;
      })
      .slice(0, 6);
  }

  private syncRemainingSecondsFromDeadline(): void {
    const deadline = this.simulatorDeadlineAt();
    if (!deadline) {
      return;
    }

    const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    this.remainingSeconds.set(next);
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private glossarySearchTerms(entry: GlossaryEntry): string[] {
    const variants = new Set<string>();
    const baseTerms = [entry.title, ...(entry.aliases ?? [])];

    for (const term of baseTerms) {
      const normalized = this.normalizeGlossaryText(term);
      if (normalized) {
        variants.add(normalized);
      }

      const strippedPrefix = this.normalizeGlossaryText(
        term.replace(/^(Amazon|AWS)\s+/i, '')
      );
      if (strippedPrefix) {
        variants.add(strippedPrefix);
      }

      const strippedParens = this.normalizeGlossaryText(term.replace(/\s*\([^)]*\)/g, ''));
      if (strippedParens) {
        variants.add(strippedParens);
      }
    }

    return [...variants].sort((a, b) => b.length - a.length);
  }

  private normalizeGlossaryText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private normalizeOfficialCategory(category: string): string {
    const normalized = category.trim().toLowerCase();

    if (normalized.includes('exam')) {
      return 'Examen';
    }
    if (
      normalized.includes('ci/cd') ||
      normalized.includes('pipeline') ||
      normalized.includes('deploy') ||
      normalized.includes('build')
    ) {
      return 'CI/CD';
    }
    if (
      normalized.includes('iac') ||
      normalized.includes('cloudformation') ||
      normalized.includes('terraform')
    ) {
      return 'IaC';
    }
    if (
      normalized.includes('observ') ||
      normalized.includes('cloudwatch') ||
      normalized.includes('logs') ||
      normalized.includes('tracing')
    ) {
      return 'Observabilidad';
    }
    if (
      normalized.includes('operac') ||
      normalized.includes('systems manager') ||
      normalized.includes('ssm')
    ) {
      return 'Operaciones';
    }
    if (normalized.includes('config')) {
      return 'Config';
    }
    if (
      normalized.includes('segur') ||
      normalized.includes('security') ||
      normalized.includes('iam') ||
      normalized.includes('kms')
    ) {
      return 'Seguridad';
    }
    if (
      normalized.includes('resilien') ||
      normalized.includes('backup') ||
      normalized.includes('recovery')
    ) {
      return 'Resiliencia';
    }
    if (
      normalized.includes('data') ||
      normalized.includes('analytics') ||
      normalized.includes('database')
    ) {
      return 'Datos';
    }
    if (
      normalized.includes('red') ||
      normalized.includes('network') ||
      normalized.includes('route 53') ||
      normalized.includes('cloudfront') ||
      normalized.includes('vpc')
    ) {
      return 'Red';
    }

    return category || 'Otros';
  }

  private normalizeSystemName(domainName: string | null): string {
    if (!domainName?.trim()) {
      return 'Sin sistema';
    }

    const normalized = domainName.trim().toLowerCase();

    if (normalized.includes('sdlc') || normalized.includes('software development lifecycle')) {
      return 'SDLC Automation';
    }

    if (normalized.includes('configuration') || normalized.includes('iac')) {
      return 'Configuration Management and IaC';
    }

    if (normalized.includes('resilient')) {
      return 'Resilient Cloud Solutions';
    }

    if (normalized.includes('monitoring') || normalized.includes('logging')) {
      return 'Monitoring and Logging';
    }

    if (normalized.includes('incident') || normalized.includes('event response')) {
      return 'Incident and Event Response';
    }

    if (normalized.includes('security') || normalized.includes('compliance')) {
      return 'Security and Compliance';
    }

    return domainName;
  }

  private renderNoteMarkdown(content: string): SafeHtml {
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const html: string[] = [];
    let inList = false;
    let paragraphBuffer: string[] = [];

    const flushParagraph = () => {
      if (!paragraphBuffer.length) {
        return;
      }
      html.push(`<p>${this.escapeHtml(paragraphBuffer.join(' '))}</p>`);
      paragraphBuffer = [];
    };

    const closeList = () => {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        closeList();
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        flushParagraph();
        closeList();
        const level = headingMatch[1].length;
        html.push(`<h${level}>${this.escapeHtml(headingMatch[2])}</h${level}>`);
        continue;
      }

      const bulletMatch = trimmed.match(/^-\s+(.*)$/);
      if (bulletMatch) {
        flushParagraph();
        if (!inList) {
          html.push('<ul>');
          inList = true;
        }
        html.push(`<li>${this.escapeHtml(bulletMatch[1])}</li>`);
        continue;
      }

      closeList();
      paragraphBuffer.push(trimmed);
    }

    flushParagraph();
    closeList();

    return this.sanitizer.bypassSecurityTrustHtml(html.join(''));
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
