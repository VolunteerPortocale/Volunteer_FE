import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../../common/pipes/translate-pipe';
import { TranslationService } from '../../../service/translation.service';
import { GetEventByIdGQL, UpdateEventGQL } from '../../../core/graphql/services.private';
import { EventCategory, EventDressCode, EventStatus, UpdateEventInput, UpdateEventStatus } from '../../../core/graphql/types';
import { environment } from '../../../../environments/environment';
import { of, switchMap, Observable, forkJoin } from 'rxjs';

export enum EventFileType {
  ATTACHMENT = 'ATTACHMENT',
  COVER = 'COVER',
  GALLERY = 'GALLERY'
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  rawFile?: File;
  type: EventFileType;
  isExisting?: boolean; // Distinguishes between backend files and newly uploaded ones
}
@Component({
  selector: 'app-edit-event',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslatePipe,
  ],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.scss',
})
export class EditEvent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  readonly translationService = inject(TranslationService);
  private readonly getEventByIdGQL = inject(GetEventByIdGQL);
  private readonly updateEventGQL = inject(UpdateEventGQL);
  readonly UpdateEventStatus = UpdateEventStatus;

  // State Signals
  readonly eventId = signal<string | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly EventStatus = EventStatus;
  readonly currentStatus = signal<EventStatus | UpdateEventStatus>(EventStatus.Draft);
  readonly filesToDelete = signal<string[]>([]);

  // Form selections and language
  readonly activeLang = signal<'ro' | 'en' | 'ru'>('ro');
  readonly selectedDressCode = signal<EventDressCode>(EventDressCode.Casual);
  readonly eventTypesArray = Object.values(EventCategory);
  readonly dressCodes = EventDressCode;

  // File management
  readonly activeFileType = signal<EventFileType>(EventFileType.COVER);
  readonly attachedFiles = signal<AttachedFile[]>([]);
  readonly isDragging = signal<boolean>(false);
  readonly EventFileType = EventFileType;
  readonly fileLimits: Record<EventFileType, number> = {
    [EventFileType.COVER]: 1,
    [EventFileType.GALLERY]: 3,
    [EventFileType.ATTACHMENT]: 2,
  };
  readonly currentTabFiles = computed(() =>
    this.attachedFiles().filter((f) => f.type === this.activeFileType())
  );

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
    email: ['', [Validators.email]],
    phone: [''],
  });

  private toInputDateTime(isoStr: string | null | undefined): string {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toIsoString(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

    ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Identificatorul evenimentului lipsește.');
      this.isLoading.set(false);
      return;
    }
    this.eventId.set(id);
    this.loadEventData(id);
  }

  private loadEventData(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
       ro: this.getEventByIdGQL.fetch({
        variables: { id },
        fetchPolicy: 'no-cache',
        context: {
          queryDeduplication: false,
          headers: { 'Accept-Language': 'ro' },
        },
      }),
      en: this.getEventByIdGQL.fetch({
        variables: { id },
        fetchPolicy: 'no-cache',
        context: {
          queryDeduplication: false,
          headers: { 'Accept-Language': 'en' },
        },
      }),
      ru: this.getEventByIdGQL.fetch({
        variables: { id },
        fetchPolicy: 'no-cache',
        context: {
          queryDeduplication: false,
          headers: { 'Accept-Language': 'ru' },
        },
      }),
    })
        .subscribe({
      next: ({ ro, en, ru }) => {
        this.isLoading.set(false);

        const event = ro.data?.getEventById;
        if (!event) {
          this.errorMessage.set('Evenimentul nu a fost găsit.');
          return;
        }

        if (event.status) {
          this.currentStatus.set(event.status);
        }

        // grab the details from each language response
        const roDetails = event.details;
        const enDetails = en.data?.getEventById?.details;
        const ruDetails = ru.data?.getEventById?.details;

        if (roDetails.dressCode) {
          this.selectedDressCode.set(roDetails.dressCode);
        }

        // patch all 6 translation fields andthe shared event fields
        this.eventForm.patchValue({
          titleRo: roDetails.title ?? '',
          titleEn: enDetails?.title ?? '',
          titleRu: ruDetails?.title ?? '',
          descriptionRo: roDetails.description ?? '',
          descriptionEn: enDetails?.description ?? '',
          descriptionRu: ruDetails?.description ?? '',
          startDateTime: this.toInputDateTime(roDetails.startTime),
          endDateTime: this.toInputDateTime(roDetails.endTime),
          location: roDetails.location ?? '',
          volunteers: roDetails.nrVolunteers ?? 1,
          category: event.category,
          email: roDetails.contactEmail ?? '',
          phone: roDetails.contactPhone ?? '',
        });

        // populate existing backend files
        if (event.files && event.files.length > 0) {
          const existingFiles: AttachedFile[] = event.files.map((file) => ({
            id: file.id,
            name: file.type === 'COVER' ? 'Copertă actuală' : `Fișier ${file.type.toLowerCase()}`,
            size: 0,
            formattedSize: 'Salvat',
            type: file.type as unknown as EventFileType,
            isExisting: true,
          }));
          this.attachedFiles.set(existingFiles);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.message || 'A apărut o eroare la încărcarea datelor evenimentului.'
        );
      },
    });
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
    const activeType = this.activeFileType();
    const limit = this.fileLimits[activeType];
    const existingCount = this.currentTabFiles().length;
    const availableSlots = limit - existingCount;
    if (availableSlots <= 0) {
      this.errorMessage.set(`Ați atins limita maximă de ${limit} fișier(e) pentru această categorie.`);
      return;
    }
    const filesToAdd = files.slice(0, availableSlots);
    const newFiles: AttachedFile[] = filesToAdd.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      formattedSize: this.formatFileSize(file.size),
      type: activeType,
      rawFile: file,
    }));
    this.attachedFiles.set([...this.attachedFiles(), ...newFiles]);
  }

  removeFile(fileId: string): void {
    const fileToRemove = this.attachedFiles().find((f) => f.id === fileId);
    if (fileToRemove?.isExisting) {
      this.filesToDelete.set([...this.filesToDelete(), fileToRemove.id]);
    }
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

  private uploadEventFiles(eventId: string, files: File[], type: EventFileType) {
    if (!files || files.length === 0) {
      return of(null);
    }
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post(
      `${environment.apiUrl}/v1/events/${eventId}/files/batch?type=${type}`,
      formData
    );
  }


  onSubmit(targetStatus: UpdateEventStatus = UpdateEventStatus.PendingApproval): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.errorMessage.set('Vă rugăm să completați toate câmpurile obligatorii corect.');
      return;
    }

    const eventId = this.eventId();
    if (!eventId) {
      this.errorMessage.set('Lipsește identificatorul evenimentului.');
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

    const input: UpdateEventInput = {
      category: this.eventForm.value.category as EventCategory,
      status: targetStatus,
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

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

        this.updateEventGQL
      .mutate({ variables: { id: eventId, input } })
      .pipe(
        // 1. Delete removed files from backend first to free up slots
        switchMap(() => {
          const toDelete = this.filesToDelete();
          if (toDelete.length > 0) {
            const deleteRequests = toDelete.map((fileId) =>
              this.http.delete(`${environment.apiUrl}/v1/events/${eventId}/files/${fileId}`)
            );
            return forkJoin(deleteRequests);
          }
          return of(null);
        }),
        // 2. Now upload any new files safely
        switchMap(() => {
          const coverFiles = this.attachedFiles()
            .filter((f) => f.type === EventFileType.COVER && f.rawFile)
            .map((f) => f.rawFile as File);

          const galleryFiles = this.attachedFiles()
            .filter((f) => f.type === EventFileType.GALLERY && f.rawFile)
            .map((f) => f.rawFile as File);

          const attachmentFiles = this.attachedFiles()
            .filter((f) => f.type === EventFileType.ATTACHMENT && f.rawFile)
            .map((f) => f.rawFile as File);

          const uploads: Observable<unknown>[] = [];

          if (coverFiles.length > 0) {
            uploads.push(this.uploadEventFiles(eventId, coverFiles, EventFileType.COVER));
          }
          if (galleryFiles.length > 0) {
            uploads.push(this.uploadEventFiles(eventId, galleryFiles, EventFileType.GALLERY));
          }
          if (attachmentFiles.length > 0) {
            uploads.push(this.uploadEventFiles(eventId, attachmentFiles, EventFileType.ATTACHMENT));
          }

          return uploads.length > 0 ? forkJoin(uploads) : of(null);
        })
      )
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.currentStatus.set(targetStatus);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err.message || 'A apărut o eroare la actualizarea evenimentului sau fișierelor.'
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

  goBack(): void {
    this.router.navigate(['/']);
  }

}