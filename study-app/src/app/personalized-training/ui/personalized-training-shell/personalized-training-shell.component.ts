import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { TrainingImportComponent } from '../training-import/training-import.component';
import { TrainingPlanComponent } from '../training-plan/training-plan.component';
import { TrainingReviewComponent } from '../training-review/training-review.component';
import { TrainingSessionComponent } from '../training-session/training-session.component';
import { TrainingSessionSummaryComponent } from '../training-session-summary/training-session-summary.component';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';
import { ContentStatusComponent } from '../content-status/content-status.component';

@Component({
  selector: 'app-personalized-training-shell',
  imports: [
    TrainingImportComponent,
    TrainingPlanComponent,
    TrainingReviewComponent,
    TrainingSessionComponent,
    TrainingSessionSummaryComponent,
    ContentStatusComponent
  ],
  templateUrl: './personalized-training-shell.component.html',
  styleUrl: './personalized-training-shell.component.scss'
})
export class PersonalizedTrainingShellComponent implements OnInit {
  @Output() readonly exit = new EventEmitter<void>();
  readonly facade = inject(PersonalizedTrainingFacadeService);

  ngOnInit(): void {
    this.facade.initialize();
  }

  abandon(): void {
    this.facade.abandonActiveSessionWithConfirmation(window.confirm('Abandonar la sesion activa?'));
  }
}
