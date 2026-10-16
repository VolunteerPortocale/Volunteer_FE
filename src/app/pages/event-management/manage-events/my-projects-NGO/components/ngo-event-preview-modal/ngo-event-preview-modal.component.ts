import { Component, computed, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../../../common/pipes/translate-pipe';
import { GetEventsCreatedByCurrentUserQuery } from '../../../../../../core/graphql/services.private';
import { EventFileType } from '../../../../../../core/graphql/types';
import { environment } from '../../../../../../../environments/environment';

type NgoEvent = GetEventsCreatedByCurrentUserQuery['getEventsCreatedByCurrentUser'][number];

@Component({
  selector: 'app-ngo-event-preview-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, TranslatePipe],
  templateUrl: './ngo-event-preview-modal.component.html',
  styleUrl: './ngo-event-preview-modal.component.scss',
})
export class NgoEventPreviewModalComponent {
  readonly event = input<NgoEvent | null>(null);

  readonly close = output<void>();
  readonly edit = output<string>();

  readonly imageUrl = computed(() => {
    const ev = this.event();
    const cover = ev?.files?.find((f) => f.type === EventFileType.Cover);
    return cover?.id
      ? `${environment.apiUrl}/v1/files/${cover.id}/content`
      : 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80';
  });

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    const ev = this.event();
    if (ev?.id) {
      this.edit.emit(ev.id);
    }
  }
}
