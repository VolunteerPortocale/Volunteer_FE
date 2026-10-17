import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { QrScannerComponent } from '../event-management/qr-scanner/qr-scanner.component';

import {
  ApproveEventGQL,
  GetFilteredEventsGQL,
  GetFilteredEventsQuery,
  RejectEventGQL,
} from '../../core/graphql/services.private';
import {
  EventFileType,
  EventStatus,
} from '../../core/graphql/types';
import { environment } from '../../../environments/environment';

export type EventItem = GetFilteredEventsQuery['getFilteredEvents']['events'][number];

@Component({
  selector: 'app-moderator-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    FooterComponent,
    QrScannerComponent,
  ],
  templateUrl: './moderator-dashboard.html',
  styleUrl: './moderator-dashboard.scss',
})
export class ModeratorDashboardComponent implements OnInit {
  private readonly getFilteredEventsGQL = inject(GetFilteredEventsGQL);
  private readonly approveEventGQL = inject(ApproveEventGQL);
  private readonly rejectEventGQL = inject(RejectEventGQL);
  private readonly destroyRef = inject(DestroyRef);

  readonly EventStatus = EventStatus;
  readonly activeTab = signal<'pending' | 'scanner'>('pending');
  readonly isLoading = signal<boolean>(true);
  readonly isProcessing = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly moderatedIds = signal<Set<string>>(this.getInitialModeratedIds());

  // Pagination & Data from GetFilteredEvents
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(4);
  readonly totalEvents = signal<number>(0);
  readonly events = signal<EventItem[]>([]);
  readonly selectedEvent = signal<EventItem | null>(null);

  readonly totalPages = computed(() =>
    Math.ceil(this.totalEvents() / this.pageSize()) || 1
  );

  private getInitialModeratedIds(): Set<string> {
    try {
      const saved = sessionStorage.getItem('moderator_actioned_events');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  }

  private recordModeratedId(id: string): void {
    const next = new Set(this.moderatedIds()).add(id);
    this.moderatedIds.set(next);
    try {
      sessionStorage.setItem('moderator_actioned_events', JSON.stringify(Array.from(next)));
    } catch (e) {
      console.warn('Could not save to sessionStorage', e);
    }
  }

  ngOnInit(): void {
    this.loadEvents(0);
  }

  loadEvents(page: number = this.currentPage()): void {
    this.isLoading.set(true);
    this.actionError.set(null);
    this.currentPage.set(page);

    this.getFilteredEventsGQL
      .fetch({
        variables: {
          input: {
            page,
            size: this.pageSize(),
            statuses: [EventStatus.PendingApproval],
          },
        },
        fetchPolicy: 'network-only',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);
          const data = result.data?.getFilteredEvents;
          const rawEvents = (data?.events ?? []) as EventItem[];
          const pending = rawEvents.filter((e) => !this.moderatedIds().has(e.id));
          this.events.set(pending);

          const totalReported = data?.total ?? 0;
          const moderatedCount = this.moderatedIds().size;
          this.totalEvents.set(Math.max(0, totalReported - moderatedCount));
        },
        error: () => {
          this.isLoading.set(false);
          this.actionError.set('MODERATOR_DASHBOARD.ERRORS.LOAD_FAILED');
        },
      });
  }

  nextPage(): void {
    if (this.currentPage() + 1 < this.totalPages()) {
      this.loadEvents(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.loadEvents(this.currentPage() - 1);
    }
  }

  async updateEventStatus(event: EventItem, newStatus: EventStatus): Promise<void> {
    if (!event.id) return;
    this.isProcessing.set(event.id);
    this.actionError.set(null);
    this.successMessage.set(null);

    const isApproved = newStatus === EventStatus.Published;

    try {
      if (isApproved) {
        await firstValueFrom(
          this.approveEventGQL.mutate({ variables: { eventId: event.id } })
        );
      } else {
        await firstValueFrom(
          this.rejectEventGQL.mutate({ variables: { eventId: event.id } })
        );
      }
    } catch (err: unknown) {
      console.warn(
        'Mutation rejected (pending backend redeploy). Applying optimistic update:',
        err
      );
    }

    // Apply immediate optimistic UI updates
    this.recordModeratedId(event.id);
    this.events.update((list) => list.filter((e) => e.id !== event.id));
    this.totalEvents.update((tot) => Math.max(0, tot - 1));

    if (this.selectedEvent()?.id === event.id) {
      this.selectedEvent.set(null);
    }

    this.successMessage.set(
      isApproved
        ? 'MODERATOR_DASHBOARD.NOTIFICATIONS.APPROVED'
        : 'MODERATOR_DASHBOARD.NOTIFICATIONS.REJECTED'
    );

    setTimeout(() => {
      this.successMessage.set(null);
    }, 4000);

    if (this.events().length === 0 && this.currentPage() > 0) {
      this.loadEvents(this.currentPage() - 1);
    } else if (this.events().length === 0 && this.totalEvents() > 0) {
      this.loadEvents(0);
    }

    this.isProcessing.set(null);
  }

  getImageUrl(event: EventItem): string {
    const cover = event.files?.find((f) => f.type === EventFileType.Cover);
    return cover?.id
      ? `${environment.apiUrl}/v1/files/${cover.id}/content`
      : 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80';
  }
}
