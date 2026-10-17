import { Component, computed, inject, OnInit, signal, DestroyRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { EnrollmentService } from '../../../../service/enrollment.service';
import { TranslatePipe } from '../../../../common/pipes/translate-pipe';
import { FooterComponent } from '../../../../common/components/footer/footer';
import {
  GetAllEventsGQL,
  GetAllEventsQuery,
  GetEventByIdGQL,
} from '../../../../core/graphql/services.private';
import { EventFileType, EnrollmentStatus, EventCategory } from '../../../../core/graphql/types';
import { environment } from '../../../../../environments/environment';

export const PAGE_SIZE = 6;

type VolEvent = GetAllEventsQuery['getAllEvents'][number];

type EnrolledEventItem = {
  event: VolEvent;
  enrollmentStatus: EnrollmentStatus;
  enrollmentId?: string;
};

@Component({
  selector: 'app-my-projects-vol',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    FooterComponent,
  ],
  templateUrl: './my-projects-vol.html',
  styleUrl: './my-projects-vol.scss',
})
export class MyProjectsVolComponent implements OnInit {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly getAllEventsGQL = inject(GetAllEventsGQL);
  private readonly getEventByIdGQL = inject(GetEventByIdGQL);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  private readonly backendEvents = signal<VolEvent[]>([]);
  readonly selectedEvent = signal<EnrolledEventItem | null>(null);

  readonly searchQuery = signal('');
  readonly selectedCategory = signal<EventCategory | 'ALL'>('ALL');
  readonly selectedStatus = signal<EnrollmentStatus | 'ALL'>('ALL');
  readonly isFilterOpen = signal(false);

  readonly availableCategories = Object.values(EventCategory);
  readonly availableStatuses: EnrollmentStatus[] = [
    EnrollmentStatus.Completed,
    EnrollmentStatus.Confirmed,
    EnrollmentStatus.Enrolled,
  ];

  readonly activeFilterCount = computed<number>(
    () => (this.selectedCategory() !== 'ALL' ? 1 : 0) + (this.selectedStatus() !== 'ALL' ? 1 : 0)
  );

  readonly currentPage = signal<number>(0);

  readonly enrolledEvents = computed<EnrolledEventItem[]>(() => {
    const enrolledIds = this.enrollmentService.enrolledEventIds();
    const enrollmentMap = new Map(
      this.enrollmentService.userEnrollments().map((enr) => [enr.eventId, enr])
    );
    const seen = new Set<string>();
    const result: EnrolledEventItem[] = [];

    for (const event of this.backendEvents()) {
      if (!event.id || seen.has(event.id) || !enrolledIds.has(event.id)) continue;
      seen.add(event.id);

      const enr = enrollmentMap.get(event.id);
      result.push({
        event,
        enrollmentStatus: enr?.status ?? EnrollmentStatus.Enrolled,
        enrollmentId: enr?.id,
      });
    }

    return result;
  });

  readonly filteredEnrolledEvents = computed<EnrolledEventItem[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();
    const status = this.selectedStatus();

    return this.enrolledEvents().filter((item) => {
      if (category !== 'ALL' && item.event.category !== category) return false;
      if (status !== 'ALL' && item.enrollmentStatus !== status) return false;
      if (query) {
        const d = item.event.details;
        const text = `${d.title || ''} ${d.description || ''} ${d.location || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredEnrolledEvents().length / PAGE_SIZE))
  );

  readonly visiblePages = computed<number[]>(() => {
    const total = this.totalPages();
    const start = Math.max(1, Math.min(this.currentPage() - 1, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  readonly paginatedEnrolledEvents = computed<EnrolledEventItem[]>(() => {
    const list = this.filteredEnrolledEvents();
    const page = Math.min(
      this.currentPage(),
      Math.max(0, Math.ceil(list.length / PAGE_SIZE) - 1)
    );
    const start = page * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  });

  toggleFilterDropdown(): void {
    this.isFilterOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown-container')) {
      this.isFilterOpen.set(false);
    }
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.currentPage.set(0);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(0);
  }

  setCategory(category: EventCategory | 'ALL'): void {
    this.selectedCategory.set(category);
    this.currentPage.set(0);
  }

  setStatus(status: EnrollmentStatus | 'ALL'): void {
    this.selectedStatus.set(status);
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
    const el = document.querySelector('.vol-filter-toolbar-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  readonly isUnenrolling = this.enrollmentService.isUnenrolling;

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);

    try {
      // 1. Fetch current user's enrollments from backend
      await this.enrollmentService.fetchCurrentUserEnrollments();

      // 2. Fetch all published events from backend
      this.getAllEventsGQL
        .watch({ fetchPolicy: 'network-only' })
        .valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: async (res) => {
            const rawEvents = (res.data?.getAllEvents ?? []) as VolEvent[];
            this.backendEvents.set(rawEvents);

            // 3. For any enrolled eventId not present in getAllEvents, load via getEventById
            const enrolledIds = this.enrollmentService.enrolledEventIds();
            const existingIds = new Set(rawEvents.map((m) => m.id));

            for (const id of enrolledIds) {
              if (!existingIds.has(id)) {
                try {
                  const singleRes = await firstValueFrom(
                    this.getEventByIdGQL.fetch({
                      variables: { id },
                      fetchPolicy: 'cache-first',
                    })
                  );
                  const single = singleRes.data?.getEventById as VolEvent | undefined;
                  if (single) {
                    this.backendEvents.update((prev) => [single, ...prev]);
                  }
                } catch (singleErr) {
                  console.warn(`Could not fetch details for event ${id}:`, singleErr);
                }
              }
            }

            this.isLoading.set(false);
          },
          error: (err) => {
            console.warn('Could not load backend events:', err);
            this.isLoading.set(false);
          },
        });
    } catch (err) {
      console.warn('Failed to initialize volunteer projects from backend:', err);
      this.isLoading.set(false);
    }
  }

  getCoverImageUrl(event: VolEvent): string {
    const cover = event.files?.find((f) => f.type === EventFileType.Cover);
    return cover?.id
      ? `${environment.apiUrl}/v1/files/${cover.id}/content`
      : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
  }

  viewEvent(item: EnrolledEventItem): void {
    this.selectedEvent.set(item);
  }

  closeModal(): void {
    this.selectedEvent.set(null);
  }

  async unenroll(eventId: string): Promise<void> {
    try {
      await this.enrollmentService.unenrollFromEvent(eventId);
      this.closeModal();
    } catch (err: unknown) {
      console.error('Failed to unenroll from event', err);
    }
  }
}
