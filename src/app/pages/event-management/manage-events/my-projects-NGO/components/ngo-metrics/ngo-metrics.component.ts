import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../../../common/pipes/translate-pipe';

@Component({
  selector: 'app-ngo-metrics',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './ngo-metrics.component.html',
  styleUrl: './ngo-metrics.component.scss',
})
export class NgoMetricsComponent {
  readonly totalEvents = input<number>(0);
  readonly activeEvents = input<number>(0);
  readonly completedEvents = input<number>(0);
  readonly totalCapacity = input<number>(0);
}
