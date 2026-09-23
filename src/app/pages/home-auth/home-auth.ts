import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { AuthService } from '../../service/auth.service';
import { EventService } from '../../service/event.service';

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
  private readonly eventService = inject(EventService);

  readonly allProjects = computed<AuthProject[]>(() => {
    return this.eventService.events().map((e) => ({
      id: e.id,
      categoryTagKey: e.categoryTagKey || 'HOME_AUTH.FILTERS.ECOLOGY',
      categoryFilter: (e.categoryFilter as CategoryFilter) || 'all',
      organization: e.organization,
      titleKey: '',
      fallbackTitle: e.title,
      descriptionKey: '',
      fallbackDescription: e.description,
      location: e.location,
      date: e.startDateTime ? new Date(e.startDateTime).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Curând',
      spotsOccupied: e.spotsOccupied || `${e.volunteers} locuri`,
      imageUrl: e.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    }));
  });

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

  editProject(projectId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/editeaza-eveniment', projectId]);
  }
}
