import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-project-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss'
})
export class ProjectCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly category = input<string>('Comunitate');
  readonly location = input<string>('Chișinău, Moldova');
  readonly imageUrl = input<string>('https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80');
}