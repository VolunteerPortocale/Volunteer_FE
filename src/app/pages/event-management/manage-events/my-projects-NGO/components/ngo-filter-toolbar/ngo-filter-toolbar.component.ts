import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../../../common/pipes/translate-pipe';

@Component({
  selector: 'app-ngo-filter-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslatePipe],
  templateUrl: './ngo-filter-toolbar.component.html',
  styleUrl: './ngo-filter-toolbar.component.scss',
})
export class NgoFilterToolbarComponent {
  readonly searchQuery = input<string>('');
  readonly selectedStatus = input<'all' | 'active' | 'completed'>('all');
  readonly selectedCategory = input<string>('all');
  readonly categories = input<string[]>([]);

  readonly searchChange = output<string>();
  readonly statusChange = output<'all' | 'active' | 'completed'>();
  readonly categoryChange = output<string>();

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  clearSearch(): void {
    this.searchChange.emit('');
  }

  setStatus(status: 'all' | 'active' | 'completed'): void {
    this.statusChange.emit(status);
  }

  onCategorySelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.categoryChange.emit(value);
  }
}
