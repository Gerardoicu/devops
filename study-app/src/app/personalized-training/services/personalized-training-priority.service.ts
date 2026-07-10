import { Injectable } from '@angular/core';
import {
  ManualCoachingEvidence,
  PersonalizedTrainingProfile,
  TrainingEnergyLevel,
  TrainingPrioritySnapshot,
  TrainingSessionPlan,
  TrainingTopicDescriptor
} from '../models/personalized-training.models';
import { DOP_C02_BLUEPRINT_VERSION } from '../config/dop-c02-blueprint';
import { PRIORITY_ENGINE_VERSION } from '../config/priority-engine.config';
import {
  extractTrainingEvidence,
  TrainingEvidenceExtractionInput
} from '../utils/training-evidence-extraction';
import {
  rankTrainingPriorities,
  TrainingPriorityRankingInput
} from '../utils/training-priority-ranking';
import { planTrainingSession } from '../utils/training-session-planning';
import { PersonalizedTrainingStateService } from './personalized-training-state.service';

export interface PriorityEngineInput extends TrainingEvidenceExtractionInput {
  topicDescriptors: readonly TrainingTopicDescriptor[];
  learnerProfile?: PersonalizedTrainingProfile | null;
  manualEvidence?: readonly ManualCoachingEvidence[];
  now: Date;
}

export interface TrainingPlanGenerationInput extends PriorityEngineInput {
  availableMinutes: number;
  energyLevel: TrainingEnergyLevel;
  maximumTopicCount?: number;
}

@Injectable({ providedIn: 'root' })
export class PersonalizedTrainingPriorityService {
  constructor(private readonly stateService: PersonalizedTrainingStateService) {}

  generatePrioritySnapshot(input: PriorityEngineInput): TrainingPrioritySnapshot {
    const extraction = extractTrainingEvidence(input);
    const rankingInput: TrainingPriorityRankingInput = {
      topicDescriptors: input.topicDescriptors,
      evidence: extraction.evidence,
      topicMastery: input.topicMastery,
      reviewSchedule: input.reviewSchedule,
      sessionHistory: input.sessionHistory,
      now: input.now
    };
    const ranking = rankTrainingPriorities(rankingInput);
    return {
      snapshotId: `priority:${input.now.toISOString()}:${ranking.priorities.map((priority) => priority.topicId).join('-')}`,
      generatedAt: input.now.toISOString(),
      priorityEngineVersion: PRIORITY_ENGINE_VERSION,
      blueprintVersion: DOP_C02_BLUEPRINT_VERSION,
      evidenceCount: extraction.evidence.length,
      priorities: ranking.priorities
    };
  }

  savePrioritySnapshot(snapshot: TrainingPrioritySnapshot): void {
    this.stateService.savePrioritySnapshot(snapshot);
  }

  generateTrainingSessionPlan(input: TrainingPlanGenerationInput): TrainingSessionPlan {
    const snapshot = this.generatePrioritySnapshot(input);
    return planTrainingSession({
      rankedPriorities: snapshot.priorities,
      availableMinutes: input.availableMinutes,
      energyLevel: input.energyLevel,
      generatedAt: input.now.toISOString(),
      maximumTopicCount: input.maximumTopicCount
    });
  }

  saveTrainingSessionPlan(plan: TrainingSessionPlan): void {
    this.stateService.saveTrainingSessionPlan(plan);
  }
}
