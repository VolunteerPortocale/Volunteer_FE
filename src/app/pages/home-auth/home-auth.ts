import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { AuthService } from '../../service/auth.service';
import { EventService } from '../../service/event.service';
import { TranslationService } from '../../service/translation.service';

export type CategoryFilter = 'all' | 'ecology' | 'education' | 'animals';

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
  private readonly eventService = inject(EventService);

  readonly allProjects = computed<AuthProject[]>(() => {
    const lang = this.translationService.currentLang();
    const locale = lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : 'ro-RO';

    return this.eventService.events().map((e) => {
      let titleKey = e.titleKey || '';
      let descriptionKey = e.descriptionKey || '';
      let locationKey = e.locationKey || '';
      let occupiedCount = e.occupiedSpots;

      if (e.id === 'eco-forest') {
        titleKey = titleKey || 'PROJECTS.CARD_1.TITLE';
        descriptionKey = descriptionKey || 'PROJECTS.CARD_1.DESCRIPTION';
        locationKey = locationKey || 'PROJECTS.CARD_1.LOCATION';
        occupiedCount = occupiedCount ?? 32;
      } else if (e.id === 'senior-digital') {
        titleKey = titleKey || 'PROJECTS.CARD_2.TITLE';
        descriptionKey = descriptionKey || 'PROJECTS.CARD_2.DESCRIPTION';
        locationKey = locationKey || 'PROJECTS.CARD_2.LOCATION';
        occupiedCount = occupiedCount ?? 14;
      } else if (e.id === 'shelter-animals') {
        titleKey = titleKey || 'PROJECTS.CARD_3.TITLE';
        descriptionKey = descriptionKey || 'PROJECTS.CARD_3.DESCRIPTION';
        locationKey = locationKey || 'PROJECTS.CARD_3.LOCATION';
        occupiedCount = occupiedCount ?? 18;
      }

      // Format date according to active language locale
      let formattedDate: string;
      if (e.startDateTime) {
        try {
          formattedDate = new Date(e.startDateTime).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
        } catch {
          formattedDate = e.startDateTime;
        }
      } else {
        formattedDate = this.translationService.translate('HOME_AUTH.SOON');
      }

      // Format spots occupied according to active language
      let spotsText: string;
      const total = e.volunteers;
      if (occupiedCount !== undefined && total) {
        if (lang === 'en') {
          spotsText = `${occupiedCount} of ${total} spots filled`;
        } else if (lang === 'ru') {
          spotsText = `${occupiedCount} из ${total} мест занято`;
        } else {
          spotsText = `${occupiedCount} din ${total} locuri ocupate`;
        }
      } else if (total) {
        if (lang === 'en') {
          spotsText = `${total} spots available`;
        } else if (lang === 'ru') {
          spotsText = `${total} мест доступно`;
        } else {
          spotsText = `${total} locuri disponibile`;
        }
      } else {
        spotsText = e.spotsOccupied || '';
      }

      return {
        id: e.id,
        categoryTagKey: e.categoryTagKey || 'HOME_AUTH.FILTERS.ECOLOGY',
        categoryFilter: (e.categoryFilter as CategoryFilter) || 'all',
        organization: e.organization,
        titleKey,
        fallbackTitle: e.title,
        descriptionKey,
        fallbackDescription: e.description,
        location: e.location,
        locationKey,
        date: formattedDate,
        spotsOccupied: spotsText,
        imageUrl:
          e.imageUrl ||
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        email: e.email,
        phone: e.phone,
      };
    });
  });

  readonly selectedCategory = signal<CategoryFilter>('all');
  readonly searchQuery = signal<string>('');
  readonly bookmarkedIds = signal<Set<string>>(new Set());
  readonly selectedProjectModal = signal<AuthProject | null>(null);
  readonly appliedProjectIds = signal<Set<string>>(new Set());

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
    }
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
    this.selectedProjectModal.set(null);
  }

  applyToEvent(projectId: string): void {
    const set = new Set(this.appliedProjectIds());
    set.add(projectId);
    this.appliedProjectIds.set(set);
  }

  isApplied(projectId: string): boolean {
    return this.appliedProjectIds().has(projectId);
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
