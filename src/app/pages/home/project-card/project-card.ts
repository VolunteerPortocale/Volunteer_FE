import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../common/pipes/translate-pipe';

@Component({
  selector: 'app-project-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly category = input<string>('Comunitate');
  readonly location = input<string>('Chișinău, Moldova');
  readonly imageUrl = input<File | string>('https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80');

  readonly displayUrl = computed<string>(() => {
    const img = this.imageUrl();
    if (!img) {
      return '';
    }
    if (typeof img === 'string') {
      return img;
    }
    if (typeof window !== 'undefined' && typeof URL !== 'undefined' && URL.createObjectURL) {
      return URL.createObjectURL(img);
    }
    return '';
  });
}