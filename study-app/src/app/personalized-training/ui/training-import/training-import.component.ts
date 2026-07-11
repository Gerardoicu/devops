import { Component, inject, signal } from '@angular/core';
import { importQualityWarningLabels, PersonalizedTrainingFacadeService } from '../../services/personalized-training-facade.service';
import { ImportQualityFlag } from '../../models/personalized-training.models';

@Component({
  selector: 'app-training-import',
  templateUrl: './training-import.component.html',
  styleUrl: './training-import.component.scss'
})
export class TrainingImportComponent {
  readonly facade = inject(PersonalizedTrainingFacadeService);
  readonly jsonText = signal('');
  readonly fileName = signal<string | null>(null);

  previewText(): void {
    this.facade.previewImportText(this.jsonText());
  }

  previewFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.fileName.set(file?.name ?? null);
    if (file) {
      void this.facade.previewImportFile(file);
    }
  }

  warningLabels(flags: readonly ImportQualityFlag[]): string[] {
    return importQualityWarningLabels(flags);
  }
}
