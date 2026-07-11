import { Component, inject } from '@angular/core';
import { PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';

@Component({
  selector: 'app-content-status',
  templateUrl: './content-status.component.html',
  styleUrl: './content-status.component.scss'
})
export class ContentStatusComponent {
  readonly facade = inject(PersonalizedTrainingFacadeService);
}
