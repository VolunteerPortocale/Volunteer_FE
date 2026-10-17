import { Component, computed, HostListener, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../../../common/pipes/translate-pipe';
import { EventCategory, EventStatus } from '../../../../../../core/graphql/types';

@Component({
  selector: 'app-ngo-filter-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './ngo-filter-toolbar.component.html',
  styleUrl: './ngo-filter-toolbar.component.scss',
})
export class NgoFilterToolbarComponent {
  readonly searchQuery = input<string>('');
  readonly selectedStatus = input<EventStatus | 'ALL'>('ALL');
  readonly selectedCategory = input<EventCategory | 'ALL'>('ALL');

  readonly searchChange = output<string>();
  readonly statusChange = output<EventStatus | 'ALL'>();
  readonly categoryChange = output<EventCategory | 'ALL'>();
  readonly clearFilters = output<void>();

  readonly availableCategories = Object.values(EventCategory);
  readonly availableStatuses = Object.values(EventStatus);
  readonly isFilterOpen = signal<boolean>(false);

  readonly activeFilterCount = computed<number>(
    () => (this.selectedCategory() !== 'ALL' ? 1 : 0) + (this.selectedStatus() !== 'ALL' ? 1 : 0)
  );

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

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  clearSearch(): void {
    this.searchChange.emit('');
  }

  onCategorySelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as EventCategory | 'ALL';
    this.categoryChange.emit(value);
  }

  onStatusSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as EventStatus | 'ALL';
    this.statusChange.emit(value);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }
}
