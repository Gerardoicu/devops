import { Component, inject } from '@angular/core';
import { DrillAttemptDraft, DrillAnswerOption, MappingItem, WorkflowItem } from '../../models/personalized-training.models';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';

@Component({
  selector: 'app-training-session',
  templateUrl: './training-session.component.html',
  styleUrl: './training-session.component.scss'
})
export class TrainingSessionComponent {
  readonly facade = inject(PersonalizedTrainingFacadeService);
  readonly confidenceOptions = [1, 2, 3, 4, 5] as const;

  isSelected(optionId: string): boolean {
    return this.facade.uiState().currentDraft.selectedAnswers.includes(optionId);
  }

  toggleOption(option: DrillAnswerOption, multi: boolean): void {
    const draft = this.facade.uiState().currentDraft;
    const selected = draft.selectedAnswers.includes(option.id)
      ? draft.selectedAnswers.filter((id) => id !== option.id)
      : multi
        ? [...draft.selectedAnswers, option.id]
        : [option.id];
    this.facade.updateCurrentDraft({ selectedAnswers: selected });
  }

  setText(field: 'uncertaintyNotes' | 'reasoningSummary', value: string): void {
    this.facade.updateCurrentDraft({ [field]: value.trim() ? value : null });
  }

  setKeywords(value: string): void {
    this.facade.updateCurrentDraft({
      identifiedKeywords: value.split(',').map((item) => item.trim()).filter(Boolean)
    });
  }

  toggleEliminated(optionId: string): void {
    const draft = this.facade.uiState().currentDraft;
    const eliminatedOptions = draft.eliminatedOptions.includes(optionId)
      ? draft.eliminatedOptions.filter((id) => id !== optionId)
      : [...draft.eliminatedOptions, optionId];
    this.facade.updateCurrentDraft({ eliminatedOptions });
  }

  setEliminationReason(optionId: string, value: string): void {
    const draft = this.facade.uiState().currentDraft;
    this.facade.updateCurrentDraft({
      eliminationReasons: {
        ...draft.eliminationReasons,
        [optionId]: value
      }
    });
  }

  setConfidence(value: number | null): void {
    this.facade.updateCurrentDraft({ confidence: isConfidence(value) ? value : null });
  }

  moveWorkflow(item: WorkflowItem, delta: -1 | 1): void {
    const view = this.facade.uiState().currentActivityView;
    const draft = this.facade.uiState().currentDraft;
    const current = draft.orderedItems.length ? [...draft.orderedItems] : [...(view?.workflowItems.map((workflow) => workflow.id) ?? [])];
    const index = current.indexOf(item.id);
    const nextIndex = index + delta;
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
      return;
    }
    [current[index], current[nextIndex]] = [current[nextIndex], current[index]];
    this.facade.updateCurrentDraft({ orderedItems: current });
  }

  orderedWorkflowItems(): WorkflowItem[] {
    const view = this.facade.uiState().currentActivityView;
    if (!view) {
      return [];
    }
    const order = this.facade.uiState().currentDraft.orderedItems;
    if (!order.length) {
      return view.workflowItems;
    }
    const byId = new Map(view.workflowItems.map((item) => [item.id, item]));
    return order.map((id) => byId.get(id)).filter((item): item is WorkflowItem => item !== undefined);
  }

  setMapping(source: MappingItem, targetId: string): void {
    const draft = this.facade.uiState().currentDraft;
    this.facade.updateCurrentDraft({
      mappingSelections: {
        ...draft.mappingSelections,
        [source.id]: targetId
      }
    });
  }

  mappingValue(sourceId: string): string {
    return this.facade.uiState().currentDraft.mappingSelections[sourceId] || '';
  }

  eliminationReason(optionId: string): string {
    return this.facade.uiState().currentDraft.eliminationReasons[optionId] || '';
  }

  saveDraft(): void {
    this.facade.saveDraft(this.facade.uiState().currentDraft);
  }

  submit(): void {
    this.facade.submitCurrentActivity(this.facade.uiState().currentDraft);
  }

  stop(reason: 'fatigue' | 'time_expired' | 'interrupted' | 'learner_choice'): void {
    this.facade.stopSession(reason);
  }

  isMultiSelect(): boolean {
    const view = this.facade.uiState().currentActivityView;
    return !!view && view.answerOptions.length > 2 && view.activityType !== 'binary_comparison';
  }

  draft(): DrillAttemptDraft {
    return this.facade.uiState().currentDraft;
  }
}

function isConfidence(value: number | null): value is 1 | 2 | 3 | 4 | 5 {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}
