import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { AuthService } from '../../service/auth.service';

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
  date: string;
  spotsOccupied: string;
  imageUrl: string;
}

export const RECOMMENDED_PROJECTS: AuthProject[] = [
  {
    id: 'eco-forest',
    categoryTagKey: 'HOME_AUTH.FILTERS.ECOLOGY',
    categoryFilter: 'ecology',
    organization: 'Eco Moldova',
    titleKey: 'PROJECTS.CARD_1.TITLE',
    fallbackTitle: 'Plantăm păduri comunitare',
    descriptionKey: 'PROJECTS.CARD_1.DESCRIPTION',
    fallbackDescription: 'Alătură-te echipei pentru a planta peste 2.000 de puieți și a revitaliza spațiile verzi locale.',
    location: 'Strășeni, Moldova',
    date: '3 octombrie 2026',
    spotsOccupied: '32 din 40 locuri ocupate',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'senior-digital',
    categoryTagKey: 'HOME_AUTH.FILTERS.EDUCATION',
    categoryFilter: 'education',
    organization: 'Generații Împreună',
    titleKey: 'PROJECTS.CARD_2.TITLE',
    fallbackTitle: 'Competențe digitale pentru seniori',
    descriptionKey: 'PROJECTS.CARD_2.DESCRIPTION',
    fallbackDescription: 'Ajută persoanele în vârstă să folosească servicii digitale, smartphone-uri și internetul în siguranță.',
    location: 'Chișinău, Moldova',
    date: '10 octombrie 2026',
    spotsOccupied: '14 din 20 locuri ocupate',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'shelter-animals',
    categoryTagKey: 'HOME_AUTH.FILTERS.ANIMALS',
    categoryFilter: 'animals',
    organization: 'Casa Blănoșilor',
    titleKey: 'PROJECTS.CARD_3.TITLE',
    fallbackTitle: 'Sprijin pentru adăpostul de animale',
    descriptionKey: 'PROJECTS.CARD_3.DESCRIPTION',
    fallbackDescription: 'Oferă îngrijire, hrană și afecțiune animalelor abandonate care așteaptă o familie.',
    location: 'Bălți, Moldova',
    date: '17 octombrie 2026',
    spotsOccupied: '18 din 25 locuri ocupate',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'
  }
];

@Component({
  selector: 'app-home-auth',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './home-auth.html',
  styleUrl: './home-auth.scss'
})
export class HomeAuthComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly allProjects = signal<AuthProject[]>(RECOMMENDED_PROJECTS);
  readonly selectedCategory = signal<CategoryFilter>('all');
  readonly searchQuery = signal<string>('');
  readonly bookmarkedIds = signal<Set<string>>(new Set());

  readonly currentUser = this.authService.currentUser;

  readonly filterCategories: { id: CategoryFilter; labelKey: string }[] = [
    { id: 'all', labelKey: 'HOME_AUTH.FILTERS.ALL' },
    { id: 'ecology', labelKey: 'HOME_AUTH.FILTERS.ECOLOGY' },
    { id: 'education', labelKey: 'HOME_AUTH.FILTERS.EDUCATION' },
    { id: 'animals', labelKey: 'HOME_AUTH.FILTERS.ANIMALS' }
  ];

  readonly filteredProjects = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();
    const projects = this.allProjects();

    return projects.filter(project => {
      const matchesCategory = category === 'all' || project.categoryFilter === category;
      if (!matchesCategory) return false;

      if (!query) return true;

      const searchableText = `${project.fallbackTitle} ${project.organization} ${project.location} ${project.fallbackDescription}`.toLowerCase();
      return searchableText.includes(query);
    });
  });

  ngOnInit(): void {
    // Ensure authenticated session active on authorized home
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
    this.router.navigate(['/proiecte']);
  }
}
