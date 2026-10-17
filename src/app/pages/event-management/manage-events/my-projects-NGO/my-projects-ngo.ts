import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { TranslatePipe } from '../../../../common/pipes/translate-pipe';
import { FooterComponent } from '../../../../common/components/footer/footer';
import { EventCategory, EventStatus } from '../../../../core/graphql/types';
import {
  GetEventsCreatedByCurrentUserGQL,
  GetEventsCreatedByCurrentUserQuery,
  GetEventByIdGQL,
} from '../../../../core/graphql/services.private';

import { NgoMetricsComponent } from './components/ngo-metrics/ngo-metrics.component';
import { NgoFilterToolbarComponent } from './components/ngo-filter-toolbar/ngo-filter-toolbar.component';
import { NgoEventCardComponent } from './components/ngo-event-card/ngo-event-card.component';
import { NgoEventPreviewModalComponent } from './components/ngo-event-preview-modal/ngo-event-preview-modal.component';

export const PAGE_SIZE = 6;

type NgoEvent = GetEventsCreatedByCurrentUserQuery['getEventsCreatedByCurrentUser'][number];

@Component({
  selector: 'app-my-projects-ngo',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    FooterComponent,
    NgoMetricsComponent,
    NgoFilterToolbarComponent,
    NgoEventCardComponent,
    NgoEventPreviewModalComponent,
  ],
  templateUrl: './my-projects-ngo.html',
  styleUrl: './my-projects-ngo.scss',
})
export class MyProjectsNgoComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly getEventsCreatedByCurrentUserGQL = inject(GetEventsCreatedByCurrentUserGQL);
  private readonly getEventByIdGQL = inject(GetEventByIdGQL);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly ngoEvents = signal<NgoEvent[]>([]);
  readonly searchQuery = signal('');
  readonly selectedStatus = signal<EventStatus | 'ALL'>('ALL');
  readonly selectedCategory = signal<EventCategory | 'ALL'>('ALL');
  readonly previewModalEvent = signal<NgoEvent | null>(null);

  readonly currentPage = signal<number>(0);

  // Filtered events based on search, category and status
  readonly filteredEvents = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();
    const status = this.selectedStatus();

    return this.ngoEvents().filter((event) => {
      if (category !== 'ALL' && event.category !== category) return false;
      if (status !== 'ALL' && event.status !== status) return false;
      if (query) {
        const d = event.details;
        const text = `${d.title || ''} ${d.description || ''} ${d.location || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredEvents().length / PAGE_SIZE))
  );

  readonly visiblePages = computed<number[]>(() => {
    const total = this.totalPages();
    const start = Math.max(1, Math.min(this.currentPage() - 1, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  readonly paginatedEvents = computed<NgoEvent[]>(() => {
    const list = this.filteredEvents();
    const page = Math.min(
      this.currentPage(),
      Math.max(0, Math.ceil(list.length / PAGE_SIZE) - 1)
    );
    const start = page * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(0);
  }

  onStatusChange(status: EventStatus | 'ALL'): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
  }

  onCategoryChange(category: EventCategory | 'ALL'): void {
    this.selectedCategory.set(category);
    this.currentPage.set(0);
  }

  clearFilters(): void {
    this.selectedCategory.set('ALL');
    this.selectedStatus.set('ALL');
    this.currentPage.set(0);
  }

  clearAllSearchAndFilters(): void {
    this.searchQuery.set('');
    this.clearFilters();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.scrollToEvents();
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  private scrollToEvents(): void {
    const el = document.querySelector('.ngo-projects-grid') || document.querySelector('.ngo-filter-toolbar-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Real backend metrics
  readonly totalProjectsCount = computed(() => this.ngoEvents().length);

  readonly activeProjectsCount = computed(() => {
    const now = new Date();
    return this.ngoEvents().filter((e) => !e.details.endTime || new Date(e.details.endTime) >= now).length;
  });

  readonly completedProjectsCount = computed(() => {
    const now = new Date();
    return this.ngoEvents().filter((e) => !!e.details.endTime && new Date(e.details.endTime) < now).length;
  });

  readonly totalCapacityNeeded = computed(() =>
    this.ngoEvents().reduce((acc, curr) => acc + (curr.details.nrVolunteers || 0), 0)
  );

  ngOnInit(): void {
    this.fetchBackendEvents();
  }

  fetchBackendEvents(): void {
    this.isLoading.set(true);
    this.getEventsCreatedByCurrentUserGQL
      .watch({ fetchPolicy: 'network-only' })
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);
          const rawEvents = (result.data?.getEventsCreatedByCurrentUser ?? []) as NgoEvent[];
          this.ngoEvents.set(rawEvents);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.warn('Could not load events created by current user for NGO page:', err);
        },
      });
  }

  // Navigation
  editEvent(id: string): void {
    this.router.navigate(['/editeaza-eveniment', id]);
  }

  // Event preview modal
  openPreview(item: NgoEvent): void {
    this.previewModalEvent.set(item);
    if (item.id) {
      firstValueFrom(
        this.getEventByIdGQL.fetch({
          variables: { id: item.id },
          fetchPolicy: 'network-only',
        })
      )
        .then((res) => {
          if (res.data?.getEventById) {
            this.previewModalEvent.set(res.data.getEventById);
          }
        })
        .catch((err: unknown) => {
          console.warn(`Could not refresh event ${item.id} via getEventById:`, err);
        });
    }
  }

  closePreview(): void {
    this.previewModalEvent.set(null);
  }
}
