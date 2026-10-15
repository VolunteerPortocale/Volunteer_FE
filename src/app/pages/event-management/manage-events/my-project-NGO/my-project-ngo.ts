import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { TranslatePipe } from '../../../../common/pipes/translate-pipe';
import { FooterComponent } from '../../../../common/components/footer/footer';
import {
  GetEventsCreatedByCurrentUserGQL,
  GetEventsCreatedByCurrentUserQuery,
  GetEventByIdGQL,
} from '../../../../core/graphql/services.private';

import { NgoMetricsComponent } from './components/ngo-metrics/ngo-metrics.component';
import { NgoFilterToolbarComponent } from './components/ngo-filter-toolbar/ngo-filter-toolbar.component';
import { NgoEventCardComponent } from './components/ngo-event-card/ngo-event-card.component';
import { NgoEventPreviewModalComponent } from './components/ngo-event-preview-modal/ngo-event-preview-modal.component';

type NgoEvent = GetEventsCreatedByCurrentUserQuery['getEventsCreatedByCurrentUser'][number];

@Component({
  selector: 'app-my-project-ngo',
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
  templateUrl: './my-project-ngo.html',
  styleUrl: './my-project-ngo.scss',
})
export class MyProjectNgoComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly getEventsCreatedByCurrentUserGQL = inject(GetEventsCreatedByCurrentUserGQL);
  private readonly getEventByIdGQL = inject(GetEventByIdGQL);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly ngoEvents = signal<NgoEvent[]>([]);
  readonly searchQuery = signal('');
  readonly selectedStatus = signal<'all' | 'active' | 'completed'>('all');
  readonly selectedCategory = signal('all');
  readonly previewModalEvent = signal<NgoEvent | null>(null);

  // Extract unique category names from backend events
  readonly categoriesList = computed(() => {
    const set = new Set<string>();
    for (const event of this.ngoEvents()) {
      if (event.category) {
        set.add(event.category);
      }
    }
    return Array.from(set);
  });

  // Filtered events based on search, category and status
  readonly filteredEvents = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();
    const status = this.selectedStatus();
    const now = new Date();

    return this.ngoEvents().filter((event) => {
      // Category match
      if (category !== 'all') {
        const cat = event.category ? event.category.toLowerCase() : '';
        if (cat !== category.toLowerCase()) return false;
      }

      // Status match
      if (status !== 'all') {
        const end = event.details.endTime ? new Date(event.details.endTime) : null;
        const isCompleted = end && end < now;
        if (status === 'completed' && !isCompleted) return false;
        if (status === 'active' && isCompleted) return false;
      }

      // Search query
      if (query) {
        const title = (event.details.title || '').toLowerCase();
        const desc = (event.details.description || '').toLowerCase();
        const loc = (event.details.location || '').toLowerCase();
        if (!title.includes(query) && !desc.includes(query) && !loc.includes(query)) {
          return false;
        }
      }

      return true;
    });
  });

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

  readonly totalCapacityNeeded = computed(() => {
    return this.ngoEvents().reduce((acc, curr) => acc + (curr.details.nrVolunteers || 0), 0);
  });

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
          const fresh = res.data?.getEventById;
          if (fresh) {
            this.previewModalEvent.set(fresh);
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
