import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';

type CardType = 'learn' | 'compare' | 'decision' | 'trap' | 'mini-quiz';
type SessionMode = 'learn' | 'mixed' | 'review' | 'quiz';
type AppPhase = 'home' | 'session' | 'complete' | 'simulator' | 'simulator-complete' | 'notes' | 'official-links';
type SimulatorBankType = 'verified' | 'public';

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

const STORAGE_KEY = 'dop-c02-study-state-v1';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly http = inject(HttpClient);
  private audioContext: AudioContext | null = null;

  readonly cards = signal<StudyCard[]>([]);
  readonly simulatorBank = signal<SimulatorQuestion[]>([]);
  readonly publicSimulatorBank = signal<SimulatorQuestion[]>([]);
  readonly notes = signal<StudyNote[]>([]);
  readonly officialLinks = signal<OfficialLink[]>([]);
  readonly activeNote = signal<StudyNote | null>(null);
  readonly activeNoteContent = signal('');
  readonly simulatorBankType = signal<SimulatorBankType>('verified');
  readonly phase = signal<AppPhase>('home');
  readonly sessionMode = signal<SessionMode>('mixed');
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
  readonly remainingSeconds = signal(180 * 60);
  readonly simulatorStartedAt = signal<number | null>(null);

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
  readonly totalCards = computed(() => this.cards().length);
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
  readonly reviewCount = computed(
    () => Object.values(this.progressByCard()).filter((entry) => entry.needsReview).length
  );
  readonly seenCount = computed(
    () => Object.values(this.progressByCard()).filter((entry) => entry.seen > 0).length
  );
  readonly quizCorrect = computed(() =>
    this.cards().reduce((sum, card) => {
      if (!card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.correct ?? 0);
    }, 0)
  );
  readonly quizIncorrect = computed(() =>
    this.cards().reduce((sum, card) => {
      if (!card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.incorrect ?? 0);
    }, 0)
  );
  readonly learnConfirmed = computed(() =>
    this.cards().reduce((sum, card) => {
      if (card.options?.length) {
        return sum;
      }
      return sum + (this.progressByCard()[card.id]?.correct ?? 0);
    }, 0)
  );
  readonly learnReviewMarked = computed(() =>
    this.cards().reduce((sum, card) => {
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
  readonly sessionModes: SessionMode[] = ['learn', 'mixed', 'quiz', 'review'];
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
      title: 'Solo aprender',
      subtitle: 'Feed de conceptos',
      cta: 'Empezar feed',
      description:
        'Muestra aprendizaje puro y comparaciones rapidas. Menos presion, mas asimilacion.'
    },
    mixed: {
      title: 'Sesion rapida',
      subtitle: 'Aprende + responde',
      cta: 'Empezar sesion',
      description:
        'Mezcla cards nuevas, cards falladas y repaso ligero para mantener ritmo y variedad.'
    },
    quiz: {
      title: 'Mini quiz',
      subtitle: 'Solo evaluacion',
      cta: 'Empezar quiz',
      description:
        'Te muestra solo cards con opciones para comprobar si de verdad discriminas bien.'
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

  constructor() {
    this.http.get<StudyCard[]>('assets/cards.json').subscribe((cards) => {
      this.cards.set(cards);
      this.phase.set('home');
    });
    this.http.get<SimulatorQuestion[]>('assets/simulator-bank.json').subscribe((questions) => {
      this.simulatorBank.set(questions);
    });
    this.http.get<SimulatorQuestion[]>('assets/simulator-bank-public.json').subscribe((questions) => {
      this.publicSimulatorBank.set(questions);
    });
    this.http.get<StudyNote[]>('assets/notes-index.json').subscribe((notes) => {
      this.notes.set(notes);
    });
    this.http.get<OfficialLink[]>('assets/official-links.json').subscribe((links) => {
      this.officialLinks.set(links);
    });

    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
    });
  }

  startSession(mode: SessionMode): void {
    this.sessionMode.set(mode);
    this.selectedAnswer.set(null);
    this.revealed.set(false);
    this.sessionSummary.set(null);

    const cards = this.cards();
    const progress = this.progressByCard();
    let nextQueue: StudyCard[] = [];

    if (mode === 'review') {
      nextQueue = cards.filter((card) => progress[card.id]?.needsReview);
    } else if (mode === 'learn') {
      nextQueue = cards.filter((card) => card.type !== 'mini-quiz' && card.type !== 'decision');
    } else if (mode === 'quiz') {
      nextQueue = cards.filter((card) => card.type === 'decision' || card.type === 'mini-quiz');
    } else {
      const reviewFirst = cards.filter((card) => progress[card.id]?.needsReview);
      const unseen = cards.filter((card) => !progress[card.id]);
      const seenStable = cards.filter(
        (card) => progress[card.id] && !progress[card.id].needsReview
      );
      nextQueue = [...this.shuffle(reviewFirst), ...this.shuffle(unseen), ...this.shuffle(seenStable)];
    }

    if (!nextQueue.length) {
      nextQueue = [...cards];
    }

    this.sessionQueue.set(nextQueue.slice(0, Math.min(12, nextQueue.length)));
    this.currentIndex.set(0);
    this.phase.set('session');
    this.playTone('start');
  }

  goHome(): void {
    this.clearSimulatorTimer();
    this.phase.set('home');
    this.selectedAnswer.set(null);
    this.revealed.set(false);
  }

  openNote(note: StudyNote): void {
    this.http
      .get(`assets/notes/${encodeURIComponent(note.fileName)}`, { responseType: 'text' })
      .subscribe((content) => {
        this.activeNote.set(note);
        this.activeNoteContent.set(content);
        this.phase.set('notes');
      });
  }

  openOfficialLinks(): void {
    this.phase.set('official-links');
  }

  startSimulator(bankType: SimulatorBankType = 'verified'): void {
    this.simulatorBankType.set(bankType);
    const sourceBank = bankType === 'verified' ? this.simulatorBank() : this.publicSimulatorBank();
    const queue = this.shuffle(sourceBank).slice(0, Math.min(75, sourceBank.length));
    this.simulatorQueue.set(queue);
    this.simulatorIndex.set(0);
    this.simulatorAnswers.set({});
    this.simulatorSummary.set(null);
    this.showSimulatorReview.set(false);
    this.remainingSeconds.set(180 * 60);
    this.simulatorStartedAt.set(Date.now());
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
    if (this.simulatorIndex() < this.simulatorQueue().length - 1) {
      this.simulatorIndex.update((value) => value + 1);
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

    for (const question of queue) {
      const selected = [...(answers[question.id] ?? [])].sort();
      const expected = [...question.correctAnswers].sort();

      if (selected.length) {
        answered += 1;
      }

      if (
        selected.length === expected.length &&
        selected.every((value, index) => value === expected[index])
      ) {
        correct += 1;
      }
    }

    const total = queue.length;
    const incorrect = answered - correct;
    const unanswered = total - answered;
    const elapsedSeconds = this.simulatorStartedAt()
      ? Math.max(0, 180 * 60 - this.remainingSeconds())
      : 0;

    this.simulatorSummary.set({
      bankType: this.simulatorBankType(),
      total,
      answered,
      unanswered,
      correct,
      incorrect,
      scorePercent: total ? Math.round((correct / total) * 100) : 0,
      elapsedSeconds
    });
    this.phase.set('simulator-complete');
    this.playTone('finish');
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
    this.simulatorTimerId = setInterval(() => {
      const next = this.remainingSeconds() - 1;
      if (next <= 0) {
        this.remainingSeconds.set(0);
        this.finishSimulator();
        return;
      }
      this.remainingSeconds.set(next);
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
      return { progress: {} };
    }

    try {
      return JSON.parse(raw) as DeckState;
    } catch {
      return { progress: {} };
    }
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
