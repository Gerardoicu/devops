import { Component, inject } from '@angular/core';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';

@Component({
  selector: 'app-training-review',
  templateUrl: './training-review.component.html',
  styleUrl: './training-review.component.scss'
})
export class TrainingReviewComponent {
  readonly facade = inject(PersonalizedTrainingFacadeService);

  mappingEntries(value: Record<string, string>): Array<{ key: string; value: string }> {
    return Object.entries(value).map(([key, item]) => ({ key, value: item }));
  }
}
