import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { TranslationService } from '../../service/translation.service';
import { EventService } from '../../service/event.service';

import { OptionItem, EVENT_TYPES } from '../../config/event-categories.config';
export type { OptionItem };
export { EVENT_TYPES };

export type ContactMethod = 'email' | 'phone' | 'both';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
}


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
export class AddEventComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  readonly translationService = inject(TranslationService);

  readonly eventTypesList = EVENT_TYPES;
  readonly dressCodesList = DRESS_CODES;
  readonly durationsList = DURATIONS;

  // Edit Mode state
  readonly eventId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.eventId());

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId.set(id);
      this.loadEventData(id);
    }
  }

  private loadEventData(id: string): void {
    const event = this.eventService.getEventById(id);
    if (event) {
      this.eventForm.patchValue({
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime || '',
        location: event.location,
        volunteers: event.volunteers,
        email: event.email || 'contact@ong.ro',
        phone: event.phone || '+373 69 000 000',
      });
      this.selectedEventTypes.set(event.eventTypes || []);
      this.selectedDressCode.set(event.dressCode || 'casual');
      this.selectedDuration.set(event.duration || '1_day');
      this.selectedContactMethod.set(event.contactMethod || 'email');
      this.attachedFiles.set(event.attachedFiles || []);
    }
  }

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
      title: this.eventForm.value.title?.trim(),
      description: this.eventForm.value.description?.trim(),
      startDateTime: this.eventForm.value.startDateTime || '',
      endDateTime: this.eventForm.value.endDateTime || '',
      location: this.eventForm.value.location?.trim(),
      volunteers: Number(this.eventForm.value.volunteers) || 10,
      email: this.eventForm.value.email?.trim(),
      phone: this.eventForm.value.phone?.trim(),
      eventTypes: this.selectedEventTypes(),
      dressCode: this.selectedDressCode(),
      duration: this.selectedDuration(),
      contactMethod: this.selectedContactMethod(),
      attachedFiles: this.attachedFiles(),
    };

    if (this.isEditMode()) {
      this.eventService.updateEvent(this.eventId()!, payload);
    } else {
      this.eventService.addEvent(payload);
    }

    this.isSubmitted.set(true);
  }

  resetForm(): void {
    if (this.isEditMode() && this.eventId()) {
      this.loadEventData(this.eventId()!);
      this.isSubmitted.set(false);
      return;
    }

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
    this.router.navigate(['/home-auth']);
  }
}