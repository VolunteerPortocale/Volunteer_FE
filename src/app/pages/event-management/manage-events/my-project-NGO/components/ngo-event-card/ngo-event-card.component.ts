import { Component, computed, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../../../common/pipes/translate-pipe';
import { GetEventsCreatedByCurrentUserQuery } from '../../../../../../core/graphql/services.private';
import { EventFileType } from '../../../../../../core/graphql/types';
import { environment } from '../../../../../../../environments/environment';

type NgoEvent = GetEventsCreatedByCurrentUserQuery['getEventsCreatedByCurrentUser'][number];

@Component({
  selector: 'app-ngo-event-card',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, TranslatePipe],
  templateUrl: './ngo-event-card.component.html',
  styleUrl: './ngo-event-card.component.scss',
})
export class NgoEventCardComponent {
  readonly event = input.required<NgoEvent>();

  readonly edit = output<string>();
  readonly preview = output<NgoEvent>();

  readonly isCompleted = computed(() => {
    const end = this.event().details.endTime;
    if (!end) return false;
    return new Date(end) < new Date();
  });

  readonly imageUrl = computed(() => {
    const cover = this.event().files?.find((f) => f.type === EventFileType.Cover);
    return cover?.id
      ? `${environment.apiUrl}/v1/files/${cover.id}/content`
      : 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80';
  });

  onEdit(e: Event): void {
    e.stopPropagation();
    this.edit.emit(this.event().id);
  }

  onPreview(): void {
    this.preview.emit(this.event());
  }
}
