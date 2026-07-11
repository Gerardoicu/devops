import { Component, computed, inject, signal } from '@angular/core';
import { TrainingEnergyLevel } from '../../models/personalized-training.models';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';

@Component({
  selector: 'app-training-plan',
  templateUrl: './training-plan.component.html',
  styleUrl: './training-plan.component.scss'
})
export class TrainingPlanComponent {
  readonly facade = inject(PersonalizedTrainingFacadeService);
  readonly availableMinutes = signal(15);
  readonly energyLevel = signal<TrainingEnergyLevel>('normal');
  readonly timeOptions = [5, 10, 15, 20, 30] as const;
  readonly energyOptions: Array<{ value: TrainingEnergyLevel; label: string; description: string }> = [
    { value: 'low', label: 'Energia baja', description: 'Repaso corto y una discriminacion simple' },
    { value: 'normal', label: 'Energia normal', description: 'Mecanismo, eliminacion y escenario' },
    { value: 'high', label: 'Energia alta', description: 'Escenarios complejos y retorno al banco' }
  ];
  readonly planWithinLimit = computed(() => {
    const plan = this.facade.uiState().plan;
    return !plan || plan.estimatedMinutes <= plan.availableMinutes;
  });

  generatePriorities(): void {
    this.facade.generatePriorities();
  }

  generatePlan(): void {
    this.facade.generatePlan(this.availableMinutes(), this.energyLevel());
  }

  startSession(): void {
    this.facade.startPlan();
  }
}
