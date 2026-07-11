import { Component, inject } from '@angular/core';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';

@Component({
  selector: 'app-training-session-summary',
  templateUrl: './training-session-summary.component.html',
  styleUrl: './training-session-summary.component.scss'
})
export class TrainingSessionSummaryComponent {
  readonly facade = inject(PersonalizedTrainingFacadeService);
}
