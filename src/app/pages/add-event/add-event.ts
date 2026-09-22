import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { TranslationService } from '../../service/translation.service';

export type ContactMethod = 'email' | 'phone' | 'both';

export interface OptionItem {
  id: string;
  name: string;
  labelKey: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
}

export const EVENT_TYPES: OptionItem[] = [
  { id: 'social', name: 'Social', labelKey: 'ADD_EVENT.TYPES.SOCIAL' },
  { id: 'animal_care', name: 'Animal Care', labelKey: 'ADD_EVENT.TYPES.ANIMAL_CARE' },
  { id: 'children_and_youth', name: 'Children & Youth', labelKey: 'ADD_EVENT.TYPES.CHILDREN_AND_YOUTH' },
  { id: 'education', name: 'Education', labelKey: 'ADD_EVENT.TYPES.EDUCATION' },
  { id: 'environment', name: 'Environment', labelKey: 'ADD_EVENT.TYPES.ENVIRONMENT' },
  { id: 'health', name: 'Health', labelKey: 'ADD_EVENT.TYPES.HEALTH' },
  { id: 'disability_support', name: 'Disability Support', labelKey: 'ADD_EVENT.TYPES.DISABILITY_SUPPORT' },
  { id: 'elderly_care', name: 'Elderly Care', labelKey: 'ADD_EVENT.TYPES.ELDERLY_CARE' },
  { id: 'disaster', name: 'Disaster Relief', labelKey: 'ADD_EVENT.TYPES.DISASTER' },
  { id: 'poverty', name: 'Poverty Alleviation', labelKey: 'ADD_EVENT.TYPES.POVERTY' },
  { id: 'culture', name: 'Culture & Arts', labelKey: 'ADD_EVENT.TYPES.CULTURE' },
  { id: 'sport', name: 'Sport', labelKey: 'ADD_EVENT.TYPES.SPORT' },
  { id: 'festivals', name: 'Festivals & Events', labelKey: 'ADD_EVENT.TYPES.FESTIVALS' },
  { id: 'technology', name: 'Technology', labelKey: 'ADD_EVENT.TYPES.TECHNOLOGY' },
  { id: 'business', name: 'Business', labelKey: 'ADD_EVENT.TYPES.BUSINESS' },
  { id: 'employment', name: 'Employment', labelKey: 'ADD_EVENT.TYPES.EMPLOYMENT' },
  { id: 'science', name: 'Science', labelKey: 'ADD_EVENT.TYPES.SCIENCE' },
  { id: 'agriculture', name: 'Agriculture', labelKey: 'ADD_EVENT.TYPES.AGRICULTURE' },
  { id: 'construction', name: 'Construction', labelKey: 'ADD_EVENT.TYPES.CONSTRUCTION' },
  { id: 'religion', name: 'Religion', labelKey: 'ADD_EVENT.TYPES.RELIGION' },
  { id: 'human_rights', name: 'Human Rights', labelKey: 'ADD_EVENT.TYPES.HUMAN_RIGHTS' },
  { id: 'legal', name: 'Legal Aid', labelKey: 'ADD_EVENT.TYPES.LEGAL' },
  { id: 'safety', name: 'Safety', labelKey: 'ADD_EVENT.TYPES.SAFETY' },
  { id: 'family', name: 'Family', labelKey: 'ADD_EVENT.TYPES.FAMILY' },
  { id: 'lgbtq_plus', name: 'LGBTQ+', labelKey: 'ADD_EVENT.TYPES.LGBTQ_PLUS' },
  { id: 'refugee_support', name: 'Refugee Support', labelKey: 'ADD_EVENT.TYPES.REFUGEE_SUPPORT' },
  { id: 'international_volunteering', name: 'International Volunteering', labelKey: 'ADD_EVENT.TYPES.INTERNATIONAL_VOLUNTEERING' },
  { id: 'tourism', name: 'Tourism', labelKey: 'ADD_EVENT.TYPES.TOURISM' },
  { id: 'heritage', name: 'Heritage', labelKey: 'ADD_EVENT.TYPES.HERITAGE' },
  { id: 'media', name: 'Media & Communication', labelKey: 'ADD_EVENT.TYPES.MEDIA' },
  { id: 'gardening', name: 'Gardening', labelKey: 'ADD_EVENT.TYPES.GARDENING' },
  { id: 'peace', name: 'Peace & Mediation', labelKey: 'ADD_EVENT.TYPES.PEACE' },
  { id: 'addiction_recovery', name: 'Addiction Recovery', labelKey: 'ADD_EVENT.TYPES.ADDICTION_RECOVERY' },
  { id: 'other', name: 'Other', labelKey: 'ADD_EVENT.TYPES.OTHER' },
];

export const DRESS_CODES: OptionItem[] = [
  { id: 'casual', name: 'Casual', labelKey: 'ADD_EVENT.DRESS_CODES.CASUAL' },
  { id: 'formal', name: 'Formal', labelKey: 'ADD_EVENT.DRESS_CODES.FORMAL' },
];

export const DURATIONS: OptionItem[] = [
  { id: '1_day', name: '1 Day', labelKey: 'ADD_EVENT.DURATIONS.1_DAY' },
  { id: '2_days', name: '2 Days', labelKey: 'ADD_EVENT.DURATIONS.2_DAYS' },
  { id: '3_days', name: '3 Days', labelKey: 'ADD_EVENT.DURATIONS.3_DAYS' },
  { id: '4_days', name: '4 Days', labelKey: 'ADD_EVENT.DURATIONS.4_DAYS' },
  { id: '5_days', name: '5 Days', labelKey: 'ADD_EVENT.DURATIONS.5_DAYS' },
  { id: '6_days', name: '6 Days', labelKey: 'ADD_EVENT.DURATIONS.6_DAYS' },
  { id: '7_days', name: '7 Days', labelKey: 'ADD_EVENT.DURATIONS.7_DAYS' },
];

@Component({
  selector: 'app-add-event',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
  ],
  templateUrl: './add-event.html',
  styleUrl: './add-event.scss',
})
export class AddEventComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly translationService = inject(TranslationService);

  readonly eventTypesList = EVENT_TYPES;
  readonly dressCodesList = DRESS_CODES;
  readonly durationsList = DURATIONS;

  // Reactive state using Signals
  readonly isSubmitted = signal<boolean>(false);
  readonly selectedEventTypes = signal<string[]>([]);
  readonly selectedDressCode = signal<string>('casual');
  readonly selectedDuration = signal<string>('1_day');
  readonly selectedContactMethod = signal<ContactMethod>('email');
  readonly categoryDropdownOpen = signal<boolean>(false);
  readonly attachedFiles = signal<AttachedFile[]>([]);
  readonly isDragging = signal<boolean>(false);

  // The Reactive Form
  readonly eventForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    startDateTime: ['', Validators.required],
    endDateTime: [''],
    location: ['', Validators.required],
    volunteers: [10, [Validators.required, Validators.min(1)]],
    email: ['contact@ong.ro', [Validators.email]],
    phone: ['+373 69 000 000'],
  });

  toggleEventType(typeId: string): void {
    const current = this.selectedEventTypes();
    if (current.includes(typeId)) {
      this.selectedEventTypes.set(current.filter((t) => t !== typeId));
    } else {
      this.selectedEventTypes.set([...current, typeId]);
    }
  }

  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen.set(!this.categoryDropdownOpen());
  }

  getCategoryLabel(type: OptionItem): string {
    const translated = this.translationService.translate(type.labelKey);
    return translated && translated !== type.labelKey ? translated : type.name;
  }

  get dropdownTriggerLabel(): string {
    const count = this.selectedEventTypes().length;
    if (count === 0) {
      const trans = this.translationService.translate('ADD_EVENT.CATEGORIES_DROPDOWN');
      return trans && trans !== 'ADD_EVENT.CATEGORIES_DROPDOWN' ? trans : 'Categorii';
    }
    const suffix = this.translationService.translate('ADD_EVENT.CATEGORIES_COUNT');
    const validSuffix = suffix && suffix !== 'ADD_EVENT.CATEGORIES_COUNT' ? suffix : 'categorii selectate';
    return `${count} ${validSuffix}`;
  }

  setDressCode(codeId: string): void {
    this.selectedDressCode.set(codeId);
  }

  setDuration(durationId: string): void {
    this.selectedDuration.set(durationId);
  }

  setContactMethod(method: ContactMethod): void {
    this.selectedContactMethod.set(method);
  }

  get formattedDateSummary(): string {
    const start = this.eventForm.value.startDateTime;
    const end = this.eventForm.value.endDateTime;
    if (!start) return '';

    const lang = this.translationService.currentLang();
    const localeMap: Record<string, string> = {
      ro: 'ro-RO',
      en: 'en-US',
      ru: 'ru-RU',
    };
    const locale = localeMap[lang] || 'ro-RO';

    const startDate = new Date(start).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    if (!end) return startDate;
    const endDate = new Date(end).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return `${startDate} → ${endDate}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  private addFiles(files: File[]): void {
    const newFiles: AttachedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      formattedSize: this.formatFileSize(file.size),
      type: file.type || file.name.split('.').pop() || 'file',
    }));
    this.attachedFiles.set([...this.attachedFiles(), ...newFiles]);
  }

  removeFile(fileId: string): void {
    this.attachedFiles.set(this.attachedFiles().filter((f) => f.id !== fileId));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
      case 'webp':
      case 'gif':
        return 'image';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'table_chart';
      default:
        return 'insert_drive_file';
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.eventForm.value,
      eventTypes: this.selectedEventTypes(),
      dressCode: this.selectedDressCode(),
      duration: this.selectedDuration(),
      contactMethod: this.selectedContactMethod(),
      attachedFiles: this.attachedFiles(),
    };

    console.log('Event to publish:', payload);
    this.isSubmitted.set(true);
  }

  resetForm(): void {
    this.eventForm.reset({
      volunteers: 10,
      email: 'contact@ong.ro',
      phone: '+373 67 676 767',
    });
    this.selectedEventTypes.set([]);
    this.selectedDressCode.set('casual');
    this.selectedDuration.set('1_day');
    this.selectedContactMethod.set('email');
    this.attachedFiles.set([]);
    this.isDragging.set(false);
    this.isSubmitted.set(false);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}