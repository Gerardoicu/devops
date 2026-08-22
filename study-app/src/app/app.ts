import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PersonalizedTrainingShellComponent } from './personalized-training/ui/personalized-training-shell/personalized-training-shell.component';
import { SimulatorTrainingBridgeService } from './personalized-training/adapters/simulator-training-bridge.service';

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
  | 'glossary'
  | 'personalized-training';
type SimulatorBankType = 'verified' | 'public' | 'updated';
type AssessmentMode = 'quick-quiz' | 'exam' | 'training';
type SimulatorScope = 'full' | 'module';
type AppLanguage = 'es' | 'en';

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

interface ModuleStudyOption {
  name: string;
  verifiedCount: number;
  updatedCount: number;
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
  quickQuizHistory: Record<number, { answered: number; correct: number; incorrect: number }>;
  trainingBookmarks: Record<number, boolean>;
  persistentSimulatorAnswers: Record<number, string[]>;
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

interface SimulatorAnswerExportRecord {
  question: number;
  question_text: string;
  topic: string | null;
  domain_name: string | null;
  question_type: 'single' | 'multi';
  selected_answers: string[];
  correct_answers: string[];
  answer: string[];
  correct_answer: string[];
  answered: boolean;
  is_correct: boolean;
  confidence: number | null;
  time_seconds: number;
  notes: string;
}

interface SimulatorSessionExport {
  schemaVersion: '2.0';
  id: string;
  appVersion: string;
  assessmentMode: AssessmentMode;
  bankType: SimulatorBankType;
  startedAt: string | null;
  completedAt: string;
  summary: SimulatorSummary;
  answers: SimulatorAnswerExportRecord[];
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

type ReportTargetType =
  | 'question'
  | 'quick-quiz'
  | 'concept'
  | 'note'
  | 'visual-scenario'
  | 'glossary';

interface ReportContext {
  type: ReportTargetType;
  id: string;
  title: string;
  meta?: string | null;
}

interface ContentReport {
  type: ReportTargetType;
  id: string;
  title: string;
  meta: string | null;
  comment: string;
  createdAt: string;
  appVersion: string;
}

const STORAGE_KEY = 'dop-c02-study-state-v1';
const RUNTIME_STORAGE_KEY = 'dop-c02-runtime-state-v1';
const REPORTS_STORAGE_KEY = 'dop-c02-content-reports-v1';
const SIMULATOR_HISTORY_STORAGE_KEY = 'dop-c02-simulator-session-history-v1';
const LANGUAGE_STORAGE_KEY = 'dop-c02-language-v1';
const SIMULATOR_DURATION_SECONDS = 210 * 60;
const SIMULATOR_FULL_EXAM_QUESTION_COUNT = 75;
const MODULE_STUDY_ORDER = [
  'SDLC Automation',
  'Configuration Management and IaC',
  'Resilient Cloud Solutions',
  'Monitoring and Logging',
  'Incident and Event Response',
  'Security and Compliance',
];

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
  simulatorOptionOrders: Record<number, string[]>;
  simulatorSummary: SimulatorSummary | null;
  showSimulatorReview: boolean;
  remainingSeconds: number;
  simulatorStartedAt: number | null;
  simulatorDeadlineAt: number | null;
  simulatorConfidence: Record<number, number | null>;
  simulatorNotes: Record<number, string>;
  simulatorQuestionTimeSeconds: Record<number, number>;
  simulatorQuestionStartedAt: number | null;
  simulatorScope: SimulatorScope;
  activeNoteId: string | null;
  activeGlossaryId: string | null;
  glossaryReturnPhase: AppPhase | null;
  visualReturnPhase: AppPhase | null;
  assessmentMode: AssessmentMode;
  quickQuizRevealed: boolean;
  quickQuizLastCorrect: boolean | null;
  examChecked: Record<number, boolean>;
  trainingChecked: Record<number, boolean>;
}

@Component({
  selector: 'app-root',
  imports: [PersonalizedTrainingShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly simulatorTrainingBridge = inject(SimulatorTrainingBridgeService);
  private audioContext: AudioContext | null = null;
  private simulatorNavigationPending = false;
  readonly appVersion = 'v1.3.23';
  readonly confidenceOptions = [
    { value: 1, label: 'Guessing' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Moderate' },
    { value: 4, label: 'High' },
    { value: 5, label: 'Very high' },
  ];

  readonly cards = signal<StudyCard[]>([]);
  readonly conceptCards = signal<StudyCard[]>([]);
  readonly quickQuizBank = signal<SimulatorQuestion[]>([]);
  readonly simulatorBank = signal<SimulatorQuestion[]>([]);
  readonly simulatorBankEn = signal<SimulatorQuestion[]>([]);
  readonly publicSimulatorBank = signal<SimulatorQuestion[]>([]);
  readonly updatedSimulatorBank = signal<SimulatorQuestion[]>([]);
  readonly updatedSimulatorBankEn = signal<SimulatorQuestion[]>([]);
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
  readonly visualReturnPhase = signal<AppPhase | null>(null);
  readonly simulatorBankType = signal<SimulatorBankType>('verified');
  readonly simulatorScope = signal<SimulatorScope>('full');
  readonly appLanguage = signal<AppLanguage>(this.loadLanguage());
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
  readonly simulatorOptionOrders = signal<Record<number, string[]>>({});
  readonly simulatorSummary = signal<SimulatorSummary | null>(null);
  readonly showSimulatorReview = signal(false);
  readonly remainingSeconds = signal(SIMULATOR_DURATION_SECONDS);
  readonly simulatorStartedAt = signal<number | null>(null);
  readonly simulatorDeadlineAt = signal<number | null>(null);
  readonly simulatorConfidence = signal<Record<number, number | null>>({});
  readonly simulatorNotes = signal<Record<number, string>>({});
  readonly simulatorNotesOpen = signal<Record<number, boolean>>({});
  readonly simulatorQuestionTimeSeconds = signal<Record<number, number>>({});
  readonly simulatorQuestionStartedAt = signal<number | null>(null);
  readonly quickQuizRevealed = signal(false);
  readonly quickQuizLastCorrect = signal<boolean | null>(null);
  readonly examChecked = signal<Record<number, boolean>>({});
  readonly trainingChecked = signal<Record<number, boolean>>({});
  readonly reports = signal<ContentReport[]>(this.loadReports());
  readonly simulatorHistory = signal<SimulatorSessionExport[]>(this.loadSimulatorHistory());
  readonly reportContext = signal<ReportContext | null>(null);
  readonly reportDraft = signal('');

  readonly currentCard = computed(() => this.sessionQueue()[this.currentIndex()] ?? null);
  readonly currentSimulatorQuestion = computed(
    () => this.simulatorQueue()[this.simulatorIndex()] ?? null,
  );
  readonly currentCardSystemTags = computed(() => {
    const card = this.currentCard();
    if (!card) {
      return [];
    }
    return card.tags.filter((tag) =>
      ['ci-cd', 'iac', 'resilience', 'observability', 'operations', 'security'].includes(tag),
    );
  });
  readonly currentCardConceptTags = computed(() => {
    const card = this.currentCard();
    if (!card) {
      return [];
    }
    return card.tags
      .filter(
        (tag) =>
          !['ci-cd', 'iac', 'resilience', 'observability', 'operations', 'security'].includes(tag),
      )
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
    this.simulatorQueue().length ? this.simulatorIndex() + 1 : 0,
  );
  readonly simulatorProgress = computed(() => {
    const total = this.simulatorQueue().length;
    if (!total) {
      return 0;
    }
    return Math.round((this.simulatorPosition() / total) * 100);
  });
  readonly simulatorAnsweredCount = computed(
    () => Object.values(this.simulatorAnswers()).filter((answers) => answers.length > 0).length,
  );
  readonly simulatorUnansweredCount = computed(() =>
    Math.max(0, this.simulatorTotal() - this.simulatorAnsweredCount()),
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
    }, 0),
  );
  readonly quickQuizIncorrectCount = computed(
    () => this.simulatorAnsweredCount() - this.quickQuizCorrectCount(),
  );
  readonly hasQuickQuizInProgress = computed(() => {
    if (this.assessmentMode() !== 'quick-quiz' || this.simulatorSummary() !== null) {
      return false;
    }
    return (
      this.simulatorQueue().length > 0 &&
      (this.simulatorIndex() > 0 || Object.keys(this.simulatorAnswers()).length > 0)
    );
  });
  readonly hasExamInProgress = computed(() => {
    if (this.assessmentMode() !== 'exam' || this.simulatorSummary() !== null) {
      return false;
    }
    return this.simulatorQueue().length > 0;
  });
  readonly hasTrainingInProgress = computed(() => {
    if (this.assessmentMode() !== 'training' || this.simulatorSummary() !== null) {
      return false;
    }
    return this.simulatorQueue().length > 0;
  });
  readonly hasAnySimulatorInProgress = computed(
    () => this.hasExamInProgress() || this.hasTrainingInProgress(),
  );
  readonly currentTrainingBookmarked = computed(() => {
    const question = this.currentSimulatorQuestion();
    if (!question || !this.isTraining()) {
      return false;
    }
    return !!this.state().trainingBookmarks[question.id];
  });
  readonly activeSimulatorLabel = computed(() => {
    if (this.hasTrainingInProgress()) {
      return 'Continuar entrenamiento';
    }
    return 'Continuar simulador';
  });
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
        isCorrect,
      };
    }),
  );
  readonly simulatorExportRecords = computed(() => this.buildSimulatorExportRecords());
  readonly simulatorHistoryCount = computed(() => this.simulatorHistory().length);
  readonly latestSimulatorSession = computed(() => this.simulatorHistory().at(-1) ?? null);
  readonly progressByCard = computed(() => this.state().progress);
  readonly verifiedExamHistory = computed(
    () => this.state().examHistory.verified ?? { attempts: 0, lastScorePercent: null },
  );
  readonly publicExamHistory = computed(
    () => this.state().examHistory.public ?? { attempts: 0, lastScorePercent: null },
  );
  readonly updatedExamHistory = computed(
    () => this.state().examHistory.updated ?? { attempts: 0, lastScorePercent: null },
  );
  readonly moduleStudyOptions = computed<ModuleStudyOption[]>(() => {
    const verifiedCounts = this.countQuestionsByModule(this.simulatorBank());
    const updatedCounts = this.countQuestionsByModule(this.updatedSimulatorBank());
    const moduleNames = new Set([...verifiedCounts.keys(), ...updatedCounts.keys()]);

    return [...moduleNames]
      .map((name) => ({
        name,
        verifiedCount: verifiedCounts.get(name) ?? 0,
        updatedCount: updatedCounts.get(name) ?? 0,
      }))
      .sort((left, right) => {
        const leftIndex = MODULE_STUDY_ORDER.indexOf(left.name);
        const rightIndex = MODULE_STUDY_ORDER.indexOf(right.name);

        if (leftIndex !== -1 || rightIndex !== -1) {
          return (
            (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
            (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
          );
        }

        return left.name.localeCompare(right.name);
      });
  });
  readonly reviewCount = computed(
    () => Object.values(this.progressByCard()).filter((entry) => entry.needsReview).length,
  );
  readonly seenCount = computed(
    () => Object.values(this.progressByCard()).filter((entry) => entry.seen > 0).length,
  );
  readonly quizCorrect = computed(() =>
    this.conceptCards().reduce((sum, card) => {
      if (!card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.correct ?? 0);
    }, 0),
  );
  readonly quizIncorrect = computed(() =>
    this.conceptCards().reduce((sum, card) => {
      if (!card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.incorrect ?? 0);
    }, 0),
  );
  readonly learnConfirmed = computed(() =>
    this.conceptCards().reduce((sum, card) => {
      if (card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.correct ?? 0);
    }, 0),
  );
  readonly learnReviewMarked = computed(() =>
    this.conceptCards().reduce((sum, card) => {
      if (card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.review ?? 0);
    }, 0),
  );
  readonly sessionPosition = computed(() =>
    this.sessionQueue().length ? this.currentIndex() + 1 : 0,
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
    return card ? (this.progressByCard()[card.id]?.lastResult ?? null) : null;
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
    return card
      ? this.findGlossaryEntries(
          `${card.title}\n${card.prompt}\n${card.body ?? ''}\n${card.explanation}`,
        )
      : [];
  });
  readonly isQuickQuiz = computed(() => this.assessmentMode() === 'quick-quiz');
  readonly isTraining = computed(() => this.assessmentMode() === 'training');
  readonly isModuleSimulator = computed(() => this.simulatorScope() === 'module');
  readonly reportCount = computed(() => this.reports().length);
  readonly filteredGlossaryEntries = computed(() => {
    const query = this.glossaryQuery().trim().toLowerCase();
    const entries = this.glossaryEntries();
    if (!query) {
      return entries;
    }
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.aliases.some((alias) => alias.toLowerCase().includes(query)) ||
        entry.summary.toLowerCase().includes(query),
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
      'Otros',
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
        links: [...links].sort((a, b) =>
          a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }),
        ),
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
        'Lectura secuencial de patrones, trampas y mapas mentales sacados de tus apuntes. No es glosario.',
    },
    review: {
      title: 'Repasar errores',
      subtitle: 'Ataca tus fallos',
      cta: 'Empezar repaso',
      description:
        'Prioriza cards marcadas para repaso para cerrar huecos antes de seguir avanzando.',
    },
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
    this.http.get<SimulatorQuestion[]>('assets/simulator-bank.en.json').subscribe((questions) => {
      this.simulatorBankEn.set(questions);
      this.tryRestoreRuntime();
    });
    this.http
      .get<SimulatorQuestion[]>('assets/simulator-bank-public.json')
      .subscribe((questions) => {
        this.publicSimulatorBank.set(questions);
        this.tryRestoreRuntime();
      });
    this.http
      .get<SimulatorQuestion[]>('assets/simulator-bank-updated.json')
      .subscribe((questions) => {
        this.updatedSimulatorBank.set(questions);
        this.tryRestoreRuntime();
      });
    this.http
      .get<SimulatorQuestion[]>('assets/simulator-bank-updated.en.json')
      .subscribe((questions) => {
        this.updatedSimulatorBankEn.set(questions);
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

      if (this.phase() === 'personalized-training') {
        return;
      }

      localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(this.buildRuntimeSnapshot()));
    });
  }

  startSession(mode: SessionMode): void {
    this.closeReportPanel();
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
    this.closeReportPanel();
    this.assessmentMode.set('quick-quiz');
    this.simulatorScope.set('full');
    const queue = this.buildWeightedQuickQuizQueue();
    this.simulatorBankType.set('verified');
    this.simulatorQueue.set(queue);
    this.simulatorIndex.set(0);
    this.resetSimulatorAnswersForQueue(queue);
    this.prepareSimulatorOptionOrders(queue);
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    this.remainingSeconds.set(0);
    this.simulatorStartedAt.set(null);
    this.simulatorDeadlineAt.set(null);
    this.resetSimulatorResponseTracking();
    this.quickQuizRevealed.set(false);
    this.quickQuizLastCorrect.set(null);
    this.examChecked.set({});
    this.trainingChecked.set({});
    this.phase.set('simulator');
    this.beginCurrentSimulatorQuestionTimer();
    this.playTone('start');
  }

  continueQuickQuiz(): void {
    if (!this.hasQuickQuizInProgress()) {
      this.startQuickQuiz();
      return;
    }

    this.closeReportPanel();
    this.assessmentMode.set('quick-quiz');
    this.phase.set('simulator');
    this.beginCurrentSimulatorQuestionTimer();
    this.syncQuickQuizRevealState();
    this.playTone('start');
  }

  startTraining(bankType: SimulatorBankType = 'verified'): void {
    this.closeReportPanel();
    this.assessmentMode.set('training');
    this.simulatorScope.set('full');
    this.simulatorBankType.set(bankType);
    const queue = [...this.getSimulatorBank(bankType)];
    this.simulatorQueue.set(queue);
    this.simulatorIndex.set(0);
    this.resetSimulatorAnswersForQueue(queue);
    this.prepareSimulatorOptionOrders(queue);
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    this.remainingSeconds.set(0);
    this.simulatorStartedAt.set(null);
    this.simulatorDeadlineAt.set(null);
    this.resetSimulatorResponseTracking();
    this.quickQuizRevealed.set(false);
    this.quickQuizLastCorrect.set(null);
    this.examChecked.set({});
    this.trainingChecked.set({});
    this.phase.set('simulator');
    this.beginCurrentSimulatorQuestionTimer();
    this.playTone('start');
  }

  setLanguage(language: string): void {
    const normalized: AppLanguage = language === 'en' ? 'en' : 'es';
    if (this.appLanguage() === normalized) {
      return;
    }

    this.appLanguage.set(normalized);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    this.remapActiveSimulatorQueueForLanguage();
  }

  startModuleSimulator(
    moduleName: string,
    bankType: Extract<SimulatorBankType, 'verified' | 'updated'>,
  ): void {
    const queue = this.buildModuleQueue(moduleName, bankType);
    if (!queue.length) {
      return;
    }

    this.startSimulatorWithQueue(queue, 'training', bankType, true, 'module');
  }

  continueSimulator(): void {
    if (!this.hasAnySimulatorInProgress()) {
      this.startSimulator('verified');
      return;
    }

    this.closeReportPanel();
    this.phase.set('simulator');
    this.beginCurrentSimulatorQuestionTimer();
    if (this.simulatorDeadlineAt()) {
      this.syncRemainingSecondsFromDeadline();
      if (this.remainingSeconds() > 0) {
        this.startSimulatorTimer();
      } else {
        this.finishSimulator();
      }
    }
    this.playTone('start');
  }

  goHome(): void {
    const preserveActiveAssessment =
      this.simulatorQueue().length > 0 && this.simulatorSummary() === null;
    if (!preserveActiveAssessment) {
      this.clearSimulatorTimer();
    }
    this.phase.set('home');
    this.selectedAnswer.set(null);
    this.revealed.set(false);
    this.activeNote.set(null);
    this.activeNoteContent.set('');
    this.sessionSummary.set(null);
    if (!preserveActiveAssessment) {
      this.simulatorSummary.set(null);
      this.showSimulatorReview.set(false);
      this.quickQuizRevealed.set(false);
      this.quickQuizLastCorrect.set(null);
      this.examChecked.set({});
      this.trainingChecked.set({});
      this.simulatorScope.set('full');
      this.resetSimulatorResponseTracking();
    }
    this.activeGlossaryEntry.set(null);
    this.glossaryReturnPhase.set(null);
    this.visualReturnPhase.set(null);
    this.visualScenarioQuestionFilter.set(null);
    this.closeReportPanel();
  }

  openPersonalizedTraining(): void {
    this.closeReportPanel();
    this.phase.set('personalized-training');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  openNote(note: StudyNote): void {
    this.closeReportPanel();
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
    this.closeReportPanel();
    this.phase.set('official-links');
  }

  openVisualScenarios(): void {
    this.closeReportPanel();
    if (this.phase() !== 'visual-scenarios') {
      this.visualReturnPhase.set(this.phase());
    }
    this.visualScenarioQuestionFilter.set(null);
    this.phase.set('visual-scenarios');
  }

  openVisualScenariosForQuestion(questionId: number): void {
    this.closeReportPanel();
    if (this.phase() !== 'visual-scenarios') {
      this.visualReturnPhase.set(this.phase());
    }
    this.visualScenarioQuestionFilter.set(questionId);
    this.phase.set('visual-scenarios');
  }

  closeVisualScenarios(): void {
    const returnPhase = this.visualReturnPhase();
    this.visualReturnPhase.set(null);
    this.visualScenarioQuestionFilter.set(null);
    this.phase.set(returnPhase ?? 'home');
  }

  openVerifiedQuestion(questionId: number): void {
    this.closeReportPanel();
    const question = this.getSimulatorBank('verified').find((item) => item.id === questionId);
    if (!question) {
      return;
    }
    this.clearSimulatorTimer();
    this.assessmentMode.set('exam');
    this.simulatorBankType.set('verified');
    this.simulatorQueue.set([question]);
    this.simulatorIndex.set(0);
    this.resetSimulatorAnswersForQueue([question]);
    this.prepareSimulatorOptionOrders([question]);
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    this.remainingSeconds.set(0);
    this.simulatorStartedAt.set(null);
    this.simulatorDeadlineAt.set(null);
    this.resetSimulatorResponseTracking();
    this.quickQuizRevealed.set(false);
    this.quickQuizLastCorrect.set(null);
    this.examChecked.set({});
    this.phase.set('simulator');
    this.beginCurrentSimulatorQuestionTimer();
    this.playTone('start');
  }

  openGlossaryBrowser(): void {
    this.closeReportPanel();
    this.activeGlossaryEntry.set(null);
    this.glossaryQuery.set('');
    this.glossaryReturnPhase.set(this.phase());
    this.phase.set('glossary');
  }

  openGlossary(entry: GlossaryEntry): void {
    this.closeReportPanel();
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
    this.closeReportPanel();
    this.phase.set(returnPhase ?? 'home');
  }

  openReportPanel(context: ReportContext): void {
    this.reportContext.set(context);
    this.reportDraft.set('');
  }

  closeReportPanel(): void {
    this.reportContext.set(null);
    this.reportDraft.set('');
  }

  isReporting(type: ReportTargetType, id: string): boolean {
    const current = this.reportContext();
    return !!current && current.type === type && current.id === id;
  }

  saveReport(): void {
    const context = this.reportContext();
    const comment = this.reportDraft().trim();
    if (!context || !comment) {
      return;
    }

    const next: ContentReport = {
      type: context.type,
      id: context.id,
      title: context.title,
      meta: context.meta ?? null,
      comment,
      createdAt: new Date().toISOString(),
      appVersion: this.appVersion,
    };

    this.reports.update((current) => {
      const updated = [...current, next];
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    this.closeReportPanel();
    this.playTone('soft');
  }

  exportReports(): void {
    const reports = this.reports();
    if (!reports.length) {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      appVersion: this.appVersion,
      total: reports.length,
      reports,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `dop-c02-content-reports-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportSimulatorResults(): void {
    const payload = this.buildCurrentSimulatorSessionExport();
    if (!payload) {
      return;
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dop-c02-simulator-session-${this.formatDateStamp(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportSimulatorHistory(): void {
    const sessions = this.simulatorHistory();
    if (!sessions.length) {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      appVersion: this.appVersion,
      totalSessions: sessions.length,
      sessions,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `dop-c02-simulator-history-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  clearReports(): void {
    this.reports.set([]);
    localStorage.removeItem(REPORTS_STORAGE_KEY);
    this.closeReportPanel();
  }

  clearSimulatorHistory(): void {
    this.simulatorHistory.set([]);
    localStorage.removeItem(SIMULATOR_HISTORY_STORAGE_KEY);
  }

  startSimulator(bankType: SimulatorBankType = 'verified'): void {
    const sourceBank = this.getSimulatorBank(bankType);
    const queue = this.shuffle(sourceBank).slice(0, Math.min(75, sourceBank.length));
    this.startSimulatorWithQueue(queue, 'exam', bankType, true, 'full');
  }

  simulatorOptionKeys(question: SimulatorQuestion | null): string[] {
    if (!question) {
      return [];
    }

    const optionKeys = Object.keys(question.options);
    const savedOrder = this.simulatorOptionOrders()[question.id] ?? [];
    const validOrder = savedOrder.filter((key) => optionKeys.includes(key));
    const missingKeys = optionKeys.filter((key) => !validOrder.includes(key));
    return [...validOrder, ...missingKeys];
  }

  simulatorOptionLabel(question: SimulatorQuestion, optionId: string): string {
    const visualIndex = this.simulatorOptionKeys(question).indexOf(optionId);
    return visualIndex >= 0 ? String.fromCharCode(65 + visualIndex) : optionId;
  }

  simulatorCorrectAnswerLabels(question: SimulatorQuestion): string {
    return question.correctAnswers
      .map((optionId) => this.simulatorOptionLabel(question, optionId))
      .sort()
      .join(', ');
  }

  simulatorAnswerLabels(question: SimulatorQuestion, optionIds: string[]): string {
    return optionIds
      .map((optionId) => this.simulatorOptionLabel(question, optionId))
      .sort()
      .join(', ');
  }

  isSimulatorSelected(questionId: number, optionId: string): boolean {
    return (this.simulatorAnswers()[questionId] ?? []).includes(optionId);
  }

  simulatorConfidenceValue(questionId: number): number | null {
    return this.simulatorConfidence()[questionId] ?? null;
  }

  setSimulatorConfidence(questionId: number, confidence: number): void {
    const normalized = Math.min(5, Math.max(1, Math.round(confidence)));
    this.simulatorConfidence.update((current) => ({
      ...current,
      [questionId]: normalized,
    }));
  }

  simulatorNotesValue(questionId: number): string {
    return this.simulatorNotes()[questionId] ?? '';
  }

  simulatorBankLabel(bankType: SimulatorBankType = this.simulatorBankType()): string {
    if (bankType === 'verified') {
      return 'Banco verificado';
    }

    if (bankType === 'updated') {
      return 'Examen verificado(actualizado)';
    }

    return 'Banco publico suplementario';
  }

  isSimulatorNotesOpen(questionId: number): boolean {
    return (
      !!this.simulatorNotesOpen()[questionId] ||
      this.simulatorNotesValue(questionId).trim().length > 0
    );
  }

  openSimulatorNotes(questionId: number): void {
    this.simulatorNotesOpen.update((current) => ({
      ...current,
      [questionId]: true,
    }));
  }

  setSimulatorNotes(questionId: number, notes: string): void {
    this.simulatorNotes.update((current) => ({
      ...current,
      [questionId]: notes,
    }));
  }

  selectSimulatorOption(question: SimulatorQuestion, optionId: string): void {
    if (this.isQuickQuiz()) {
      if (this.quickQuizRevealed()) {
        return;
      }

      const existing = this.simulatorAnswers()[question.id] ?? [];
      const next =
        question.questionType === 'single'
          ? [optionId]
          : existing.includes(optionId)
            ? existing.filter((value) => value !== optionId)
            : [...existing, optionId].sort();
      this.simulatorAnswers.update((current) => ({
        ...current,
        [question.id]: next,
      }));
      this.persistSimulatorAnswer(question.id, next);

      if (question.questionType === 'single') {
        this.submitQuickQuizAnswer(question, next);
      } else {
        this.playTone('soft');
      }
      return;
    }

    if (this.isTraining()) {
      if (this.isTrainingQuestionChecked(question.id)) {
        return;
      }

      const existing = this.simulatorAnswers()[question.id] ?? [];
      const next =
        question.questionType === 'single'
          ? existing.includes(optionId)
            ? []
            : [optionId]
          : existing.includes(optionId)
            ? existing.filter((value) => value !== optionId)
            : [...existing, optionId].sort();

      this.simulatorAnswers.update((current) => ({
        ...current,
        [question.id]: next,
      }));
      this.persistSimulatorAnswer(question.id, next);

      if (question.questionType === 'single' && !this.isModuleSimulator() && next.length) {
        this.trainingChecked.update((current) => ({
          ...current,
          [question.id]: true,
        }));
        this.captureCurrentSimulatorQuestionTime();
      }

      this.playTone('soft');
      return;
    }

    if (this.assessmentMode() === 'exam' && this.isExamQuestionChecked(question.id)) {
      return;
    }

    const existing = this.simulatorAnswers()[question.id] ?? [];
    const next =
      question.questionType === 'single'
        ? existing.includes(optionId)
          ? []
          : [optionId]
        : existing.includes(optionId)
          ? existing.filter((value) => value !== optionId)
          : [...existing, optionId].sort();

    this.simulatorAnswers.update((current) => ({
      ...current,
      [question.id]: next,
    }));
    this.persistSimulatorAnswer(question.id, next);
    this.playTone('soft');
  }

  prevSimulatorQuestion(): void {
    this.setSimulatorIndex(this.simulatorIndex() - 1);
  }

  nextSimulatorQuestion(): void {
    if (this.simulatorIndex() < this.simulatorQueue().length - 1) {
      this.setSimulatorIndex(this.simulatorIndex() + 1);
      return;
    }
    this.finishSimulator();
  }

  goToSimulatorQuestion(index: number): void {
    this.setSimulatorIndex(index);
  }

  confirmFinishSimulator(): void {
    const unanswered = this.simulatorUnansweredCount();
    const message = unanswered
      ? `Te ${unanswered === 1 ? 'falta' : 'faltan'} ${unanswered} ${unanswered === 1 ? 'pregunta' : 'preguntas'} sin responder. ¿Quieres entregar el examen ahora?`
      : 'Todas las preguntas tienen respuesta. ¿Quieres entregar el examen ahora?';

    if (window.confirm(message)) {
      this.finishSimulator();
    }
  }

  simulatorQuestionState(index: number): 'current' | 'correct' | 'incorrect' | 'unanswered' {
    if (index === this.simulatorIndex()) {
      return 'current';
    }
    const question = this.simulatorQueue()[index];
    return this.simulatorQuestionResult(question);
  }

  simulatorQuestionHasNote(questionId: number): boolean {
    return this.simulatorNotesValue(questionId).trim().length > 0;
  }

  simulatorQuestionHasConfidence(questionId: number): boolean {
    return this.simulatorConfidenceValue(questionId) !== null;
  }

  simulatorSelectionInstruction(question: SimulatorQuestion): string {
    const expectedCount = question.correctAnswers.length;
    if (question.questionType === 'multi' || expectedCount > 1) {
      return `Selecciona ${expectedCount} opciones.`;
    }

    return 'Selecciona una opcion.';
  }

  finishSimulator(): void {
    this.clearSimulatorTimer();
    this.captureCurrentSimulatorQuestionTime();
    const queue = this.simulatorQueue();
    const answers = this.simulatorAnswers();
    let answered = 0;
    let correct = 0;
    const bySystemMap = new Map<
      string,
      {
        system: string;
        total: number;
        correct: number;
        incorrect: number;
        unanswered: number;
        scorePercent: number;
      }
    >();

    for (const question of queue) {
      const selected = [...(answers[question.id] ?? [])].sort();
      const expected = [...question.correctAnswers].sort();
      const system = this.normalizeSystemName(question.domainName);
      const currentSystem = bySystemMap.get(system) ?? {
        system,
        total: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        scorePercent: 0,
      };
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
      ? Math.max(0, this.currentSimulatorDurationSeconds() - this.remainingSeconds())
      : 0;

    const bySystem = [...bySystemMap.values()]
      .map((entry) => ({
        ...entry,
        scorePercent: entry.total ? Math.round((entry.correct / entry.total) * 100) : 0,
      }))
      .sort((a, b) => {
        if (a.scorePercent !== b.scorePercent) {
          return a.scorePercent - b.scorePercent;
        }
        return b.total - a.total;
      });

    const summary: SimulatorSummary = {
      bankType: this.simulatorBankType(),
      total,
      answered,
      unanswered,
      correct,
      incorrect,
      scorePercent: total ? Math.round((correct / total) * 100) : 0,
      elapsedSeconds,
      bySystem,
    };

    this.simulatorSummary.set(summary);
    this.saveSimulatorSessionHistory(summary);
    if (this.assessmentMode() === 'exam' && this.simulatorScope() === 'full') {
      this.state.update((current) => {
        const bankType = this.simulatorBankType();
        const previous = current.examHistory?.[bankType] ?? { attempts: 0, lastScorePercent: null };
        return {
          ...current,
          examHistory: {
            verified: current.examHistory?.verified ?? { attempts: 0, lastScorePercent: null },
            public: current.examHistory?.public ?? { attempts: 0, lastScorePercent: null },
            updated: current.examHistory?.updated ?? { attempts: 0, lastScorePercent: null },
            [bankType]: {
              attempts: previous.attempts + 1,
              lastScorePercent: total ? Math.round((correct / total) * 100) : 0,
            },
          },
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
    if (this.isTraining()) {
      if (!this.isTrainingQuestionChecked(question.id)) {
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

    if (this.assessmentMode() === 'exam') {
      if (!this.isExamQuestionChecked(question.id)) {
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

  isTrainingQuestionChecked(questionId: number): boolean {
    return !!this.trainingChecked()[questionId];
  }

  isExamQuestionChecked(questionId: number): boolean {
    return !!this.examChecked()[questionId];
  }

  verifyCurrentExamAnswer(): void {
    if (this.assessmentMode() !== 'exam') {
      return;
    }

    const question = this.currentSimulatorQuestion();
    if (!question) {
      return;
    }

    const selected = this.simulatorAnswers()[question.id] ?? [];
    if (!selected.length) {
      return;
    }

    this.examChecked.update((current) => ({
      ...current,
      [question.id]: true,
    }));
    this.captureCurrentSimulatorQuestionTime();
    this.playTone(this.isCurrentExamAnswerCorrect() ? 'correct' : 'incorrect');
  }

  verifyCurrentTrainingAnswer(): void {
    const question = this.currentSimulatorQuestion();
    if (!question) {
      return;
    }

    const selected = this.simulatorAnswers()[question.id] ?? [];
    if (!selected.length) {
      return;
    }

    this.trainingChecked.update((current) => ({
      ...current,
      [question.id]: true,
    }));
    this.captureCurrentSimulatorQuestionTime();
    this.playTone(this.isCurrentTrainingAnswerCorrect() ? 'correct' : 'incorrect');
  }

  toggleTrainingBookmark(questionId: number): void {
    this.state.update((current) => {
      const next = { ...current.trainingBookmarks };
      if (next[questionId]) {
        delete next[questionId];
      } else {
        next[questionId] = true;
      }

      return {
        ...current,
        trainingBookmarks: next,
      };
    });
    this.playTone('soft');
  }

  isTrainingBookmarked(questionId: number): boolean {
    return !!this.state().trainingBookmarks[questionId];
  }

  hasCurrentTrainingSelection(): boolean {
    const question = this.currentSimulatorQuestion();
    if (!question) {
      return false;
    }
    return (this.simulatorAnswers()[question.id] ?? []).length > 0;
  }

  hasCurrentExamSelection(): boolean {
    const question = this.currentSimulatorQuestion();
    if (!question || this.assessmentMode() !== 'exam') {
      return false;
    }

    return (this.simulatorAnswers()[question.id] ?? []).length > 0;
  }

  hasCurrentQuickQuizSelection(): boolean {
    const question = this.currentSimulatorQuestion();
    if (!question || !this.isQuickQuiz()) {
      return false;
    }

    return (this.simulatorAnswers()[question.id] ?? []).length > 0;
  }

  verifyCurrentQuickQuizAnswer(): void {
    if (!this.isQuickQuiz() || this.quickQuizRevealed()) {
      return;
    }

    const question = this.currentSimulatorQuestion();
    if (!question) {
      return;
    }

    const selected = this.simulatorAnswers()[question.id] ?? [];
    if (!selected.length) {
      return;
    }

    this.submitQuickQuizAnswer(question, selected);
  }

  private setSimulatorIndex(index: number): void {
    if (
      this.simulatorNavigationPending ||
      index < 0 ||
      index >= this.simulatorQueue().length ||
      index === this.simulatorIndex()
    ) {
      return;
    }

    this.simulatorNavigationPending = true;
    this.captureCurrentSimulatorQuestionTime();
    this.simulatorIndex.set(index);
    this.beginCurrentSimulatorQuestionTimer();
    this.syncQuickQuizRevealState();
    this.scrollSimulatorQuestionToTop();
    this.playTone('next');
  }

  private scrollSimulatorQuestionToTop(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.simulatorNavigationPending = false;
    }, 0);
  }

  isCurrentTrainingAnswerCorrect(): boolean {
    const question = this.currentSimulatorQuestion();
    if (!question) {
      return false;
    }

    const selected = [...(this.simulatorAnswers()[question.id] ?? [])].sort();
    const expected = [...question.correctAnswers].sort();
    return (
      selected.length === expected.length &&
      selected.every((value, index) => value === expected[index])
    );
  }

  isCurrentExamAnswerCorrect(): boolean {
    const question = this.currentSimulatorQuestion();
    if (!question) {
      return false;
    }

    const selected = [...(this.simulatorAnswers()[question.id] ?? [])].sort();
    const expected = [...question.correctAnswers].sort();
    return (
      selected.length === expected.length &&
      selected.every((value, index) => value === expected[index])
    );
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
        lastResult: null,
      };

      const next: CardProgress = {
        seen: existing.seen + 1,
        correct: existing.correct + (result === 'correct' ? 1 : 0),
        incorrect: existing.incorrect + (result === 'incorrect' ? 1 : 0),
        review: existing.review + (result === 'review' ? 1 : 0),
        needsReview: result !== 'correct',
        lastResult: result,
      };

      return {
        ...current,
        progress: {
          ...current.progress,
          [cardId]: next,
        },
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
        review: 0,
      } satisfies SessionSummary,
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

  private playTone(
    kind: 'start' | 'next' | 'soft' | 'review' | 'correct' | 'incorrect' | 'finish',
  ): void {
    const AudioCtor =
      globalThis.AudioContext ||
      (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

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

      const patterns: Record<
        typeof kind,
        Array<{ frequency: number; duration: number; gain: number; type: OscillatorType }>
      > = {
        start: [
          { frequency: 440, duration: 0.05, gain: 0.05, type: 'triangle' },
          { frequency: 660, duration: 0.08, gain: 0.06, type: 'triangle' },
        ],
        next: [{ frequency: 520, duration: 0.04, gain: 0.04, type: 'sine' }],
        soft: [{ frequency: 420, duration: 0.04, gain: 0.035, type: 'sine' }],
        review: [
          { frequency: 320, duration: 0.05, gain: 0.04, type: 'triangle' },
          { frequency: 260, duration: 0.07, gain: 0.04, type: 'triangle' },
        ],
        correct: [
          { frequency: 660, duration: 0.06, gain: 0.05, type: 'triangle' },
          { frequency: 880, duration: 0.09, gain: 0.06, type: 'triangle' },
        ],
        incorrect: [
          { frequency: 300, duration: 0.06, gain: 0.04, type: 'sawtooth' },
          { frequency: 220, duration: 0.08, gain: 0.04, type: 'sawtooth' },
        ],
        finish: [
          { frequency: 523.25, duration: 0.06, gain: 0.045, type: 'triangle' },
          { frequency: 659.25, duration: 0.08, gain: 0.05, type: 'triangle' },
          { frequency: 783.99, duration: 0.1, gain: 0.055, type: 'triangle' },
        ],
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
          public: { attempts: 0, lastScorePercent: null },
          updated: { attempts: 0, lastScorePercent: null },
        },
        quickQuizHistory: {},
        trainingBookmarks: {},
        persistentSimulatorAnswers: {},
      };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<DeckState>;
      return {
        progress: parsed.progress ?? {},
        examHistory: {
          verified: parsed.examHistory?.verified ?? { attempts: 0, lastScorePercent: null },
          public: parsed.examHistory?.public ?? { attempts: 0, lastScorePercent: null },
          updated: parsed.examHistory?.updated ?? { attempts: 0, lastScorePercent: null },
        },
        quickQuizHistory: parsed.quickQuizHistory ?? {},
        trainingBookmarks: parsed.trainingBookmarks ?? {},
        persistentSimulatorAnswers: parsed.persistentSimulatorAnswers ?? {},
      };
    } catch {
      return {
        progress: {},
        examHistory: {
          verified: { attempts: 0, lastScorePercent: null },
          public: { attempts: 0, lastScorePercent: null },
          updated: { attempts: 0, lastScorePercent: null },
        },
        quickQuizHistory: {},
        trainingBookmarks: {},
        persistentSimulatorAnswers: {},
      };
    }
  }

  private loadReports(): ContentReport[] {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ContentReport[]) : [];
    } catch {
      return [];
    }
  }

  private loadLanguage(): AppLanguage {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'es';
  }

  private loadSimulatorHistory(): SimulatorSessionExport[] {
    const raw = localStorage.getItem(SIMULATOR_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as SimulatorSessionExport[]) : [];
    } catch {
      return [];
    }
  }

  private tryRestoreRuntime(): void {
    if (this.runtimeRestored) {
      return;
    }

    if (
      !this.cards().length ||
      !this.conceptCards().length ||
      !this.quickQuizBank().length ||
      !this.simulatorBank().length ||
      !this.simulatorBankEn().length ||
      !this.publicSimulatorBank().length ||
      !this.updatedSimulatorBank().length ||
      !this.updatedSimulatorBankEn().length ||
      !this.notes().length ||
      !this.visualScenarios().length ||
      !this.glossaryEntries().length
    ) {
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
      simulatorOptionOrders: this.simulatorOptionOrders(),
      simulatorSummary: this.simulatorSummary(),
      showSimulatorReview: this.showSimulatorReview(),
      remainingSeconds: this.remainingSeconds(),
      simulatorStartedAt: this.simulatorStartedAt(),
      simulatorDeadlineAt: this.simulatorDeadlineAt(),
      simulatorConfidence: this.simulatorConfidence(),
      simulatorNotes: this.simulatorNotes(),
      simulatorQuestionTimeSeconds: this.simulatorQuestionTimeSeconds(),
      simulatorQuestionStartedAt: this.simulatorQuestionStartedAt(),
      simulatorScope: this.simulatorScope(),
      activeNoteId: this.activeNote()?.id ?? null,
      activeGlossaryId: this.activeGlossaryEntry()?.id ?? null,
      glossaryReturnPhase: this.glossaryReturnPhase(),
      visualReturnPhase: this.visualReturnPhase(),
      assessmentMode: this.assessmentMode(),
      quickQuizRevealed: this.quickQuizRevealed(),
      quickQuizLastCorrect: this.quickQuizLastCorrect(),
      examChecked: this.examChecked(),
      trainingChecked: this.trainingChecked(),
    };
  }

  private restoreRuntimeSnapshot(snapshot: RuntimeSnapshot): void {
    const restoredAssessmentMode = snapshot.assessmentMode ?? 'exam';
    const restoredBankType: SimulatorBankType = snapshot.simulatorBankType ?? 'verified';

    this.sessionMode.set(snapshot.sessionMode ?? 'learn');
    this.selectedAnswer.set(snapshot.selectedAnswer ?? null);
    this.revealed.set(!!snapshot.revealed);
    this.sessionSummary.set(snapshot.sessionSummary ?? null);
    this.simulatorBankType.set(restoredBankType);
    this.simulatorAnswers.set(snapshot.simulatorAnswers ?? {});
    this.simulatorOptionOrders.set(snapshot.simulatorOptionOrders ?? {});
    this.simulatorSummary.set(snapshot.simulatorSummary ?? null);
    this.showSimulatorReview.set(!!snapshot.showSimulatorReview);
    this.remainingSeconds.set(snapshot.remainingSeconds ?? SIMULATOR_DURATION_SECONDS);
    this.simulatorStartedAt.set(snapshot.simulatorStartedAt ?? null);
    this.simulatorDeadlineAt.set(snapshot.simulatorDeadlineAt ?? null);
    this.simulatorConfidence.set(snapshot.simulatorConfidence ?? {});
    this.simulatorNotes.set(snapshot.simulatorNotes ?? {});
    this.simulatorQuestionTimeSeconds.set(snapshot.simulatorQuestionTimeSeconds ?? {});
    this.simulatorQuestionStartedAt.set(snapshot.simulatorQuestionStartedAt ?? null);
    this.simulatorScope.set(snapshot.simulatorScope ?? 'full');
    this.assessmentMode.set(restoredAssessmentMode);
    this.glossaryReturnPhase.set(snapshot.glossaryReturnPhase ?? null);
    this.visualReturnPhase.set(snapshot.visualReturnPhase ?? null);
    this.quickQuizRevealed.set(!!snapshot.quickQuizRevealed);
    this.quickQuizLastCorrect.set(snapshot.quickQuizLastCorrect ?? null);
    this.examChecked.set(snapshot.examChecked ?? {});
    this.trainingChecked.set(snapshot.trainingChecked ?? {});

    const cardsById = new Map(this.conceptCards().map((card) => [card.id, card]));
    const restoredSessionQueue = (snapshot.sessionQueueIds ?? [])
      .map((id) => cardsById.get(id))
      .filter((card): card is StudyCard => !!card);
    this.sessionQueue.set(restoredSessionQueue);
    this.currentIndex.set(
      restoredSessionQueue.length
        ? Math.min(Math.max(snapshot.currentIndex ?? 0, 0), restoredSessionQueue.length - 1)
        : 0,
    );

    const simulatorSource = this.getSimulatorBank(restoredBankType);
    const simulatorById = new Map(simulatorSource.map((question) => [question.id, question]));
    const restoredSimulatorQueue = (snapshot.simulatorQueueIds ?? [])
      .map((id) => simulatorById.get(id))
      .filter((question): question is SimulatorQuestion => !!question);
    this.simulatorQueue.set(restoredSimulatorQueue);
    this.prepareSimulatorOptionOrders(restoredSimulatorQueue);
    this.simulatorIndex.set(
      restoredSimulatorQueue.length
        ? Math.min(Math.max(snapshot.simulatorIndex ?? 0, 0), restoredSimulatorQueue.length - 1)
        : 0,
    );

    const activeNote = this.notes().find((note) => note.id === snapshot.activeNoteId) ?? null;
    if (activeNote) {
      this.openNote(activeNote);
      return;
    }

    const glossaryEntry =
      this.glossaryEntries().find((entry) => entry.id === snapshot.activeGlossaryId) ?? null;
    if (glossaryEntry) {
      this.activeGlossaryEntry.set(glossaryEntry);
    }

    this.phase.set(snapshot.phase ?? 'home');
    this.syncQuickQuizRevealState();

    if (
      snapshot.phase === 'simulator' &&
      restoredSimulatorQueue.length &&
      snapshot.assessmentMode !== 'quick-quiz'
    ) {
      this.beginCurrentSimulatorQuestionTimer();
      this.syncRemainingSecondsFromDeadline();
      if (this.remainingSeconds() > 0) {
        this.startSimulatorTimer();
      } else {
        this.finishSimulator();
      }
    } else if (snapshot.phase === 'simulator' && restoredSimulatorQueue.length) {
      this.beginCurrentSimulatorQuestionTimer();
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
        this.glossarySearchTerms(entry).some((term) => normalizedHaystack.includes(term)),
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

  private buildWeightedQuickQuizQueue(): SimulatorQuestion[] {
    const history = this.state().quickQuizHistory;
    return [...this.quickQuizBank()]
      .map((question) => {
        const stats = history[question.id] ?? { answered: 0, correct: 0, incorrect: 0 };
        return {
          question,
          priority: stats.answered + Math.random() * 1.5,
        };
      })
      .sort((left, right) => left.priority - right.priority)
      .slice(0, Math.min(100, this.quickQuizBank().length))
      .map((item) => item.question);
  }

  private recordQuickQuizAttempt(questionId: number, isCorrect: boolean): void {
    this.state.update((current) => {
      const previous = current.quickQuizHistory[questionId] ?? {
        answered: 0,
        correct: 0,
        incorrect: 0,
      };

      return {
        ...current,
        quickQuizHistory: {
          ...current.quickQuizHistory,
          [questionId]: {
            answered: previous.answered + 1,
            correct: previous.correct + (isCorrect ? 1 : 0),
            incorrect: previous.incorrect + (isCorrect ? 0 : 1),
          },
        },
      };
    });
  }

  private resetSimulatorResponseTracking(): void {
    this.simulatorConfidence.set({});
    this.simulatorNotes.set({});
    this.simulatorNotesOpen.set({});
    this.simulatorQuestionTimeSeconds.set({});
    this.simulatorQuestionStartedAt.set(null);
  }

  private resetSimulatorAnswersForQueue(queue: SimulatorQuestion[]): void {
    const persistentAnswers = this.state().persistentSimulatorAnswers;
    const nextAnswers = queue.reduce<Record<number, string[]>>((answers, question) => {
      const validOptions = new Set(Object.keys(question.options));
      const savedAnswers = (persistentAnswers[question.id] ?? []).filter((optionId) =>
        validOptions.has(optionId),
      );
      if (savedAnswers.length) {
        answers[question.id] = [...savedAnswers].sort();
      }
      return answers;
    }, {});

    this.simulatorAnswers.set(nextAnswers);
  }

  private persistSimulatorAnswer(questionId: number, answers: string[]): void {
    this.state.update((current) => {
      const nextPersistentAnswers = { ...current.persistentSimulatorAnswers };
      const normalizedAnswers = [...new Set(answers)].sort();

      if (normalizedAnswers.length) {
        nextPersistentAnswers[questionId] = normalizedAnswers;
      } else {
        delete nextPersistentAnswers[questionId];
      }

      return {
        ...current,
        persistentSimulatorAnswers: nextPersistentAnswers,
      };
    });
  }

  private beginCurrentSimulatorQuestionTimer(): void {
    if (!this.currentSimulatorQuestion()) {
      this.simulatorQuestionStartedAt.set(null);
      return;
    }

    this.simulatorQuestionStartedAt.set(Date.now());
  }

  private captureCurrentSimulatorQuestionTime(): void {
    const question = this.currentSimulatorQuestion();
    const startedAt = this.simulatorQuestionStartedAt();
    if (!question || !startedAt) {
      return;
    }

    const elapsedSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    this.simulatorQuestionTimeSeconds.update((current) => ({
      ...current,
      [question.id]: (current[question.id] ?? 0) + elapsedSeconds,
    }));
    this.simulatorQuestionStartedAt.set(null);
  }

  private buildCurrentSimulatorSessionExport(
    summary: SimulatorSummary | null = this.simulatorSummary(),
  ): SimulatorSessionExport | null {
    if (!summary) {
      return null;
    }

    const completedAt = new Date().toISOString();
    const startedAt = this.simulatorStartedAt()
      ? new Date(this.simulatorStartedAt() as number).toISOString()
      : null;

    return {
      schemaVersion: '2.0',
      id: `${completedAt}-${this.assessmentMode()}-${this.simulatorBankType()}`,
      appVersion: this.appVersion,
      assessmentMode: this.assessmentMode(),
      bankType: this.simulatorBankType(),
      startedAt,
      completedAt,
      summary,
      answers: this.buildSimulatorExportRecords(),
    };
  }

  private saveSimulatorSessionHistory(summary: SimulatorSummary): void {
    const session = this.buildCurrentSimulatorSessionExport(summary);
    if (!session) {
      return;
    }

    this.simulatorHistory.update((current) => {
      const updated = [...current, session];
      localStorage.setItem(SIMULATOR_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    try {
      this.simulatorTrainingBridge.syncCompletedSimulatorSession(session);
    } catch {
      // Personalized Training sync is best-effort and must not block simulator results.
    }
  }

  private buildSimulatorExportRecords(): SimulatorAnswerExportRecord[] {
    const answers = this.simulatorAnswers();
    const confidence = this.simulatorConfidence();
    const notes = this.simulatorNotes();
    const timeSeconds = this.simulatorQuestionTimeSeconds();

    return this.simulatorQueue().map((question) => {
      const selected = [...(answers[question.id] ?? [])].sort();
      const expected = [...question.correctAnswers].sort();
      const isCorrect =
        selected.length === expected.length &&
        selected.every((value, index) => value === expected[index]);

      return {
        question: question.id,
        question_text: question.question,
        topic: question.topic,
        domain_name: question.domainName,
        question_type: question.questionType,
        selected_answers: selected,
        correct_answers: expected,
        answer: selected,
        correct_answer: expected,
        answered: selected.length > 0,
        is_correct: isCorrect,
        confidence: confidence[question.id] ?? null,
        time_seconds: timeSeconds[question.id] ?? 0,
        notes: notes[question.id]?.trim() ?? '',
      };
    });
  }

  private formatDateStamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private syncQuickQuizRevealState(): void {
    if (this.assessmentMode() !== 'quick-quiz') {
      this.quickQuizRevealed.set(false);
      this.quickQuizLastCorrect.set(null);
      return;
    }

    const question = this.currentSimulatorQuestion();
    if (!question) {
      this.quickQuizRevealed.set(false);
      this.quickQuizLastCorrect.set(null);
      return;
    }

    const selected = [...(this.simulatorAnswers()[question.id] ?? [])].sort();
    if (!selected.length) {
      this.quickQuizRevealed.set(false);
      this.quickQuizLastCorrect.set(null);
      return;
    }

    const expected = [...question.correctAnswers].sort();
    const isCorrect =
      selected.length === expected.length &&
      selected.every((value, index) => value === expected[index]);
    this.quickQuizRevealed.set(true);
    this.quickQuizLastCorrect.set(isCorrect);
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private prepareSimulatorOptionOrders(queue: SimulatorQuestion[]): void {
    this.simulatorOptionOrders.update((current) => {
      const next = { ...current };

      for (const question of queue) {
        const optionKeys = Object.keys(question.options);
        const currentOrder = next[question.id] ?? [];
        const validCurrentOrder = currentOrder.filter((key) => optionKeys.includes(key));
        const missingKeys = optionKeys.filter((key) => !validCurrentOrder.includes(key));

        next[question.id] =
          validCurrentOrder.length === optionKeys.length
            ? validCurrentOrder
            : this.shuffle([...validCurrentOrder, ...missingKeys]);
      }

      return next;
    });
  }

  private submitQuickQuizAnswer(question: SimulatorQuestion, selectedAnswers: string[]): void {
    const expected = [...question.correctAnswers].sort();
    const selected = [...selectedAnswers].sort();
    const isCorrect =
      selected.length === expected.length &&
      selected.every((value, index) => value === expected[index]);

    this.quickQuizRevealed.set(true);
    this.quickQuizLastCorrect.set(isCorrect);
    this.captureCurrentSimulatorQuestionTime();
    this.recordQuickQuizAttempt(question.id, isCorrect);
    this.playTone(isCorrect ? 'correct' : 'incorrect');
  }

  private getSimulatorBank(bankType: SimulatorBankType): SimulatorQuestion[] {
    if (bankType === 'verified') {
      return this.appLanguage() === 'en' ? this.simulatorBankEn() : this.simulatorBank();
    }

    if (bankType === 'updated') {
      return this.appLanguage() === 'en'
        ? this.updatedSimulatorBankEn()
        : this.updatedSimulatorBank();
    }

    return this.publicSimulatorBank();
  }

  private remapActiveSimulatorQueueForLanguage(): void {
    if (this.isQuickQuiz() || !this.simulatorQueue().length) {
      return;
    }

    const bank = this.getSimulatorBank(this.simulatorBankType());
    const byId = new Map(bank.map((question) => [question.id, question]));
    const remapped = this.simulatorQueue()
      .map((question) => byId.get(question.id))
      .filter((question): question is SimulatorQuestion => !!question);

    if (remapped.length === this.simulatorQueue().length) {
      this.simulatorQueue.set(remapped);
      this.prepareSimulatorOptionOrders(remapped);
    }
  }

  private simulatorQuestionResult(
    question: SimulatorQuestion,
  ): 'correct' | 'incorrect' | 'unanswered' {
    const selected = [...(this.simulatorAnswers()[question.id] ?? [])].sort();
    if (!selected.length) {
      return 'unanswered';
    }

    const expected = [...question.correctAnswers].sort();
    return selected.length === expected.length &&
      selected.every((value, index) => value === expected[index])
      ? 'correct'
      : 'incorrect';
  }

  private countQuestionsByModule(questions: SimulatorQuestion[]): Map<string, number> {
    const counts = new Map<string, number>();

    for (const question of questions) {
      const moduleName = this.normalizeSystemName(question.domainName);
      counts.set(moduleName, (counts.get(moduleName) ?? 0) + 1);
    }

    return counts;
  }

  private buildModuleQueue(
    moduleName: string,
    bankType: Extract<SimulatorBankType, 'verified' | 'updated'>,
  ): SimulatorQuestion[] {
    return this.shuffle(
      this.getSimulatorBank(bankType).filter(
        (question) => this.normalizeSystemName(question.domainName) === moduleName,
      ),
    );
  }

  private startSimulatorWithQueue(
    queue: SimulatorQuestion[],
    assessmentMode: AssessmentMode,
    bankType: SimulatorBankType,
    timed: boolean,
    scope: SimulatorScope,
  ): void {
    this.closeReportPanel();
    this.clearSimulatorTimer();
    this.assessmentMode.set(assessmentMode);
    this.simulatorScope.set(scope);
    this.simulatorBankType.set(bankType);
    this.simulatorQueue.set(queue);
    this.simulatorIndex.set(0);
    this.resetSimulatorAnswersForQueue(queue);
    this.prepareSimulatorOptionOrders(queue);
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    const durationSeconds = timed ? this.simulatorDurationSecondsForQueue(queue, scope) : 0;
    this.remainingSeconds.set(durationSeconds);
    const startedAt = timed ? Date.now() : null;
    this.simulatorStartedAt.set(startedAt);
    this.simulatorDeadlineAt.set(startedAt ? startedAt + durationSeconds * 1000 : null);
    this.resetSimulatorResponseTracking();
    this.phase.set('simulator');
    this.quickQuizRevealed.set(false);
    this.quickQuizLastCorrect.set(null);
    this.examChecked.set({});
    this.trainingChecked.set({});
    this.beginCurrentSimulatorQuestionTimer();
    if (timed) {
      this.startSimulatorTimer();
    }
    this.playTone('start');
  }

  private glossarySearchTerms(entry: GlossaryEntry): string[] {
    const variants = new Set<string>();
    const baseTerms = [entry.title, ...(entry.aliases ?? [])];

    for (const term of baseTerms) {
      const normalized = this.normalizeGlossaryText(term);
      if (normalized) {
        variants.add(normalized);
      }

      const strippedPrefix = this.normalizeGlossaryText(term.replace(/^(Amazon|AWS)\s+/i, ''));
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

  private currentSimulatorDurationSeconds(): number {
    return this.simulatorDurationSecondsForQueue(this.simulatorQueue(), this.simulatorScope());
  }

  private simulatorDurationSecondsForQueue(
    queue: SimulatorQuestion[],
    scope: SimulatorScope,
  ): number {
    if (scope !== 'module') {
      return SIMULATOR_DURATION_SECONDS;
    }

    return Math.ceil(
      (SIMULATOR_DURATION_SECONDS * queue.length) / SIMULATOR_FULL_EXAM_QUESTION_COUNT,
    );
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
    let index = 0;

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

    const isTableSeparator = (value: string): boolean =>
      /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(value);

    const parseTableCells = (value: string): string[] => {
      const normalized = value.trim().replace(/^\|/, '').replace(/\|$/, '');
      return normalized.split('|').map((cell) => cell.trim());
    };

    const renderTable = (startIndex: number): number | null => {
      const headerLine = lines[startIndex]?.trim();
      const separatorLine = lines[startIndex + 1]?.trim();

      if (!headerLine?.includes('|') || !separatorLine || !isTableSeparator(separatorLine)) {
        return null;
      }

      const headers = parseTableCells(headerLine);
      const rows: string[][] = [];
      let nextIndex = startIndex + 2;

      while (nextIndex < lines.length && lines[nextIndex].trim().includes('|')) {
        rows.push(parseTableCells(lines[nextIndex]));
        nextIndex += 1;
      }

      if (!headers.length || !rows.length) {
        return null;
      }

      html.push(
        '<div style="overflow-x:auto"><table style="width:100%;min-width:720px;border-collapse:collapse"><thead><tr>'
      );
      for (const header of headers) {
        html.push(
          `<th style="padding:8px;text-align:left;vertical-align:top;border-bottom:1px solid rgba(255,255,255,.12);color:#fff3da">${this.escapeHtml(header)}</th>`
        );
      }
      html.push('</tr></thead><tbody>');
      for (const row of rows) {
        html.push('<tr>');
        for (let cellIndex = 0; cellIndex < headers.length; cellIndex += 1) {
          html.push(
            `<td style="padding:8px;text-align:left;vertical-align:top;border-bottom:1px solid rgba(255,255,255,.12)">${this.escapeHtml(row[cellIndex] ?? '')}</td>`
          );
        }
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');

      return nextIndex;
    };

    while (index < lines.length) {
      const rawLine = lines[index];
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        closeList();
        index += 1;
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        flushParagraph();
        closeList();
        const level = headingMatch[1].length;
        html.push(`<h${level}>${this.escapeHtml(headingMatch[2])}</h${level}>`);
        index += 1;
        continue;
      }

      const tableEndIndex = renderTable(index);
      if (tableEndIndex !== null) {
        flushParagraph();
        closeList();
        index = tableEndIndex;
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
        index += 1;
        continue;
      }

      closeList();
      paragraphBuffer.push(trimmed);
      index += 1;
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
