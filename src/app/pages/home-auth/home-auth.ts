import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { EnrollmentService } from '../../service/enrollment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetLastThreeActiveEventsGQL, GetLastThreeActiveEventsQuery } from '../../core/graphql/services.public';
import { EventFileType } from '../../core/graphql/types';
import { environment } from '../../../environments/environment';

export type CategoryFilter = 'all' | 'ecology' | 'education' | 'animals';
export type DbEvent = NonNullable<NonNullable<GetLastThreeActiveEventsQuery['getLastThreeActiveEvents']>[number]>;

export interface AuthProject {
  id: string;
  categoryTagKey: string;
  categoryFilter: CategoryFilter;
  organization: string;
  titleKey: string;
  fallbackTitle: string;
  descriptionKey: string;
  fallbackDescription: string;
  location: string;
  locationKey?: string;
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
    MatButtonModule,
    TranslatePipe,
    FooterComponent,
  ],
  templateUrl: './home-auth.html',
  styleUrl: './home-auth.scss',
})
export class HomeAuthComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getLastThreeActiveEventsGQL = inject(GetLastThreeActiveEventsGQL);

  private readonly rawEvents = signal<DbEvent[]>([]);

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
        titleKey: '',
        fallbackTitle: details?.title ?? '',
        descriptionKey: '',
        fallbackDescription: details?.description ?? '',
        categoryTagKey: `PROFILE.TAGLINE_CATEGORY.${e.category}`,
        categoryFilter:
          e.category === 'ENVIRONMENT'
            ? 'ecology'
            : e.category === 'EDUCATION'
              ? 'education'
              : e.category === 'ANIMAL_CARE'
                ? 'animals'
                : 'all',
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

  readonly selectedCategory = signal<CategoryFilter>('all');
  readonly searchQuery = signal<string>('');
  readonly bookmarkedIds = signal<Set<string>>(new Set());
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

  readonly filterCategories: { id: CategoryFilter; labelKey: string }[] = [
    { id: 'all', labelKey: 'HOME_AUTH.FILTERS.ALL' },
    { id: 'ecology', labelKey: 'HOME_AUTH.FILTERS.ECOLOGY' },
    { id: 'education', labelKey: 'HOME_AUTH.FILTERS.EDUCATION' },
    { id: 'animals', labelKey: 'HOME_AUTH.FILTERS.ANIMALS' },
  ];

  readonly filteredProjects = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();
    const projects = this.allProjects();

    return projects.filter((project) => {
      const matchesCategory = category === 'all' || project.categoryFilter === category;
      if (!matchesCategory) return false;

      if (!query) return true;

      const title = project.titleKey
        ? this.translationService.translate(project.titleKey)
        : project.fallbackTitle;
      const desc = project.descriptionKey
        ? this.translationService.translate(project.descriptionKey)
        : project.fallbackDescription;
      const loc = project.locationKey
        ? this.translationService.translate(project.locationKey)
        : project.location;

      const searchableText =
        `${title} ${desc} ${loc} ${project.fallbackTitle} ${project.organization} ${project.location}`.toLowerCase();
      return searchableText.includes(query);
    });
  });

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.login();
      return;
    }

    this.getLastThreeActiveEventsGQL
      .watch({ fetchPolicy: 'cache-first' })
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        const rawEvents = result.data?.getLastThreeActiveEvents ?? [];
        const validEvents = rawEvents.filter(
          (e): e is NonNullable<typeof e> => !!e && !!e.details
        );
        this.rawEvents.set(validEvents as unknown as DbEvent[]);
      });
  }

  setCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
  }

  toggleBookmark(projectId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const current = new Set(this.bookmarkedIds());
    if (current.has(projectId)) {
      current.delete(projectId);
    } else {
      current.add(projectId);
    }
    this.bookmarkedIds.set(current);
  }

  isBookmarked(projectId: string): boolean {
    return this.bookmarkedIds().has(projectId);
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

  editProject(projectId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/editeaza-eveniment', projectId]);
  }

  administerProject(projectId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/administrare-eveniment', projectId]);
  }
}
