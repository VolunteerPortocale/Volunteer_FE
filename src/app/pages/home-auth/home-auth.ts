import { Component, computed, inject, OnInit, signal, DestroyRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { EnrollmentService } from '../../service/enrollment.service';
import { InitialLoadingService } from '../../service/initial-loading.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  GetFilteredEventsGQL,
  GetFilteredEventsQuery,
  GetFilteredEventsQueryVariables,
} from '../../core/graphql/services.private';
import { EventCategory, EventFileType, EventFilterInput, EventStatus } from '../../core/graphql/types';
import { environment } from '../../../environments/environment';
import { QueryRef } from 'apollo-angular';

export const PAGE_SIZE = 6;
export type DbEvent = GetFilteredEventsQuery['getFilteredEvents']['events'][number];

export interface AuthProject {
  id: string;
  categoryTagKey: string;
  category: EventCategory;
  status: EventStatus;
  statusKey: string;
  organization: string;
  title: string;
  description: string;
  location: string;
  date: string;
  spotsOccupied: string;
  imageUrl: string;
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-home-auth',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    FooterComponent,
  ],
  templateUrl: './home-auth.html',
  styleUrl: './home-auth.scss',
})
export class HomeAuthComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly translationService = inject(TranslationService);
  private readonly initialLoadingService = inject(InitialLoadingService);
  private readonly router = inject(Router);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getFilteredEventsGQL = inject(GetFilteredEventsGQL);
  private queryRef?: QueryRef<GetFilteredEventsQuery, GetFilteredEventsQueryVariables>;
  readonly availableCategories = Object.values(EventCategory);
  readonly availableStatuses: EventStatus[] = [
    EventStatus.Published,
    EventStatus.Postponed,
    EventStatus.InProgress,
    EventStatus.Full,
    EventStatus.ApplicationsClosed,
    EventStatus.Completed,
  ];

  readonly selectedCategory = signal<EventCategory | 'ALL'>('ALL');
  readonly selectedStatus = signal<EventStatus | 'ALL'>('ALL');
  readonly isFilterOpen = signal<boolean>(false);

  readonly activeFilterCount = computed<number>(
    () => (this.selectedCategory() !== 'ALL' ? 1 : 0) + (this.selectedStatus() !== 'ALL' ? 1 : 0)
  );

  private readonly rawEvents = signal<DbEvent[]>([]);
  readonly currentPage = signal<number>(0);
  readonly totalEventsCount = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalEventsCount() / PAGE_SIZE))
  );

  readonly visiblePages = computed<number[]>(() => {
    const total = this.totalPages();
    const start = Math.max(1, Math.min(this.currentPage() - 1, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  readonly allProjects = computed<AuthProject[]>(() => {
    const locale = this.translationService.currentLocale();
    const soonText = this.translationService.translate('HOME_AUTH.SOON');
    const spotsTemplate = this.translationService.translate('HOME_AUTH.SPOTS_AVAILABLE');

    return this.rawEvents().map((e) => {
      const details = e.details;
      const cover = e.files?.find((f) => f.type === EventFileType.Cover);
      const imageUrl = cover?.id
        ? `${environment.apiUrl}/v1/files/${cover.id}/content`
        : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';

      const startTime = details?.startTime;
      let date: string;
      if (startTime) {
        try {
          date = new Date(startTime).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
        } catch {
          date = startTime;
        }
      } else {
        date = soonText;
      }

      const total = details?.nrVolunteers ?? 10;
      const spotsOccupied = spotsTemplate.includes('{total}')
        ? spotsTemplate.replace('{total}', total.toString())
        : `${total} locuri disponibile`;

      return {
        id: e.id ?? '',
        title: details?.title ?? '',
        description: details?.description ?? '',
        categoryTagKey: `PROFILE.TAGLINE_CATEGORY.${e.category}`,
        category: e.category,
        status: e.status,
        statusKey: `EVENT_STATUS.${e.status}`,
        organization: 'Organizație Comunitară',
        location: details?.location || 'Moldova',
        date,
        spotsOccupied,
        imageUrl,
        email: details?.contactEmail ?? undefined,
        phone: details?.contactPhone ?? undefined,
      };
    });
  });

  readonly searchQuery = signal<string>('');
  readonly selectedProjectModal = signal<AuthProject | null>(null);
  readonly enrollmentErrorKey = signal<string | null>(null);
  readonly isEnrolling = this.enrollmentService.isEnrolling;
  readonly isUnenrolling = this.enrollmentService.isUnenrolling;
  readonly isVolunteer = computed(() => this.enrollmentService.isVolunteer());

  readonly currentUser = this.authService.currentUser;
  readonly userNickname = computed(() => {
    const user = this.currentUser();
    if (!user) return '';

    let displayName = this.authService.getName();

    if (!displayName && user.email) {
      displayName = user.email.split('@')[0];
    }

    return displayName.trim();
  });

  readonly filteredProjects = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const projects = this.allProjects();
    if (!query) return projects;

    return projects.filter((p) =>
      `${p.title} ${p.description} ${p.location} ${p.organization}`.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.login();
      return;
    }

    this.initialLoadingService.registerTask('home-auth-events');
    this.initEventsQuery();
  }

  private handleEventsResponse(pagedData?: {
    total?: number | null;
    events?: unknown[] | null;
  } | null): void {
    if (pagedData) {
      this.totalEventsCount.set(pagedData.total ?? 0);
      const validEvents = (pagedData.events ?? []).filter(
        (e): e is NonNullable<typeof e> => !!e && !!(e as DbEvent).details
      );
      this.rawEvents.set(validEvents as unknown as DbEvent[]);
    }
  }

  private initEventsQuery(): void {
    this.isLoading.set(true);
    const ref = this.getFilteredEventsGQL.watch({
      variables: {
        input: this.buildFilterInput(),
      },
      fetchPolicy: 'network-only',
    });
    this.queryRef = ref;

    ref.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isLoading.set(result.loading);
          this.handleEventsResponse(result.data?.getFilteredEvents);
          this.initialLoadingService.markReady('home-auth-events');
        },
        error: (err) => {
          this.isLoading.set(false);
          console.warn('Could not load events from database:', err);
          this.initialLoadingService.markReady('home-auth-events');
        },
      });
  }

  private refetchEvents(): void {
    this.isLoading.set(true);
    if (!this.queryRef) {
      this.initEventsQuery();
      return;
    }

    this.queryRef.refetch({
      input: this.buildFilterInput(),
    }).then(
      (result) => {
        this.isLoading.set(false);
        this.handleEventsResponse(result.data?.getFilteredEvents);
      },
      (err) => {
        this.isLoading.set(false);
        console.warn('Could not refetch events:', err);
      }
    );
  }

  toggleFilterDropdown(): void {
    this.isFilterOpen.update((open) => !open);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown-container')) {
      this.isFilterOpen.set(false);
    }
  }

  private buildFilterInput(): EventFilterInput {
    const cat = this.selectedCategory();
    const st = this.selectedStatus();

    const categories: EventCategory[] | undefined =
      cat !== 'ALL' ? [cat] : undefined;

    const statuses: EventStatus[] | undefined =
      st !== 'ALL' ? [st] : this.availableStatuses;

    return {
      page: this.currentPage(),
      size: PAGE_SIZE,
      categories,
      statuses,
    };
  }

  setCategory(category: EventCategory | 'ALL'): void {
    if (this.selectedCategory() === category) return;
    this.selectedCategory.set(category);
    this.currentPage.set(0);
    this.refetchEvents();
  }

  setStatus(status: EventStatus | 'ALL'): void {
    if (this.selectedStatus() === status) return;
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.refetchEvents();
  }

  clearFilters(): void {
    if (this.selectedCategory() === 'ALL' && this.selectedStatus() === 'ALL') return;
    this.selectedCategory.set('ALL');
    this.selectedStatus.set('ALL');
    this.currentPage.set(0);
    this.refetchEvents();
  }

  clearAllSearchAndFilters(): void {
    this.searchQuery.set('');
    this.clearFilters();
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.refetchEvents();
    this.scrollToEvents();
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  private scrollToEvents(): void {
    const el = document.querySelector('.recommended-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  viewProject(project: AuthProject): void {
    this.selectedProjectModal.set(project);
  }

  closeModal(): void {
    this.enrollmentErrorKey.set(null);
    this.selectedProjectModal.set(null);
  }

  async applyToEvent(projectId: string): Promise<void> {
    await this.handleEnrollmentAction(() => this.enrollmentService.enrollToEvent(projectId));
  }

  isApplied(projectId: string): boolean {
    return this.enrollmentService.isEnrolled(projectId);
  }

  async unenrollFromEvent(projectId: string): Promise<void> {
    await this.handleEnrollmentAction(() => this.enrollmentService.unenrollFromEvent(projectId));
  }

  private async handleEnrollmentAction(action: () => Promise<unknown>): Promise<void> {
    this.enrollmentErrorKey.set(null);
    try {
      await action();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'HOME_AUTH.MODAL.ERRORS.GENERIC';
      this.enrollmentErrorKey.set(message);
    }
  }

  administerProject(projectId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/administrare-eveniment', projectId]);
  }
}
