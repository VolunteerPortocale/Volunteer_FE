import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe } from '../../../common/pipes/translate-pipe';
import { TranslationService } from '../../../service/translation.service';
import { switchMap, map } from 'rxjs';
import { CreateEventGQL } from '../../../core/graphql/services.private';
import { CreateEventInput, EventCategory, EventDressCode, EventStatus } from '../../../core/graphql/types';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  rawFile?: File;
}

@Component({
  selector: 'app-add-event',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslatePipe,
  ],
  templateUrl: './add-event.html',
  styleUrl: './add-event.scss',
})
export class AddEvent {
  
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly translationService = inject(TranslationService);
  private readonly createEventGQL = inject(CreateEventGQL);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly eventTypes = EventCategory;
  readonly eventTypesArray = Object.values(EventCategory);
  readonly dressCodes = EventDressCode;
  readonly dressCodesArray = Object.values(EventDressCode);

  // Edit Mode state
  readonly eventId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.eventId());

  // Reactive state using Signals
  readonly selectedDressCode = signal<EventDressCode>(EventDressCode.Casual);
  readonly attachedFiles = signal<AttachedFile[]>([]);
  readonly isDragging = signal<boolean>(false);

  // The Reactive Form
  readonly eventForm = this.fb.group({
    titleRo: ['', [Validators.required, Validators.minLength(5)]],
    titleEn: [''],
    titleRu: [''],
    descriptionRo: ['', [Validators.required, Validators.minLength(20)]],
    descriptionEn: [''],
    descriptionRu: [''],
    startDateTime: ['', Validators.required],
    endDateTime: [''],
    location: ['', Validators.required],
    volunteers: [10, [Validators.required, Validators.min(1)]],
    category: [EventCategory.Social, Validators.required],
    email: ['contact@ong.ro', [Validators.email]],
    phone: ['+373 69 000 000'],
  });

  goBack(): void {
    this.router.navigate(['/']);
  }

  // convert datetime to ISO for backend
  private toIsoString(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.errorMessage.set('Vă rugăm să completați toate câmpurile obligatorii corect.');
      return;
    }

    const titleStrEn = this.eventForm.value.titleEn?.trim() || '';
    const titleStrRo = this.eventForm.value.titleRo?.trim() || '';
    const titleStrRu = this.eventForm.value.titleRu?.trim() || '';
    const descStrEn = this.eventForm.value.descriptionEn?.trim() || '';
    const descStrRo = this.eventForm.value.descriptionRo?.trim() || '';
    const descStrRu = this.eventForm.value.descriptionRu?.trim() || '';
    const startTimeIso = this.toIsoString(this.eventForm.value.startDateTime);

    if (!startTimeIso) {
      this.errorMessage.set('Data de început este obligatorie.');
      return;
    }

    // payload matching CreateEventInput
    const input: CreateEventInput = {
      category: this.eventForm.value.category as EventCategory,
      status: EventStatus.Published,
      details: {
        title: { ro: titleStrRo, en: titleStrEn, ru: titleStrRu },
        description: { ro: descStrRo, en: descStrEn, ru: descStrRu },
        startTime: startTimeIso,
        endTime: this.toIsoString(this.eventForm.value.endDateTime),
        location: this.eventForm.value.location?.trim() || null,
        nrVolunteers: Number(this.eventForm.value.volunteers) || 1,
        contactPhone: this.eventForm.value.phone?.trim() || null,
        contactEmail: this.eventForm.value.email?.trim() || null,
        dressCode: this.selectedDressCode(),
      },
    };

    // send graphql mutation to backend
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.createEventGQL
      .mutate({ variables: { input } })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err.message || 'A apărut o eroare la salvarea evenimentului.'
          );
        },
      });
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
        rawFile: file,
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
    
    onFileSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files) {
        this.addFiles(Array.from(input.files));
      input.value = '';
      }
    }
}
