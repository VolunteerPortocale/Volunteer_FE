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
  labelKey: string;
}

export const EVENT_TYPES: OptionItem[] = [
  { id: 'events', labelKey: 'ADD_EVENT.TYPES.EVENTS' },
  { id: 'fundraising', labelKey: 'ADD_EVENT.TYPES.FUNDRAISING' },
  { id: 'health', labelKey: 'ADD_EVENT.TYPES.HEALTH' },
  { id: 'ecology', labelKey: 'ADD_EVENT.TYPES.ECOLOGY' },
];

export const DRESS_CODES: OptionItem[] = [
  { id: 'casual', labelKey: 'ADD_EVENT.DRESS_CODES.CASUAL' },
  { id: 'formal', labelKey: 'ADD_EVENT.DRESS_CODES.FORMAL' },
];

export const DURATIONS: OptionItem[] = [
  { id: '1_day', labelKey: 'ADD_EVENT.DURATIONS.1_DAY' },
  { id: '2_days', labelKey: 'ADD_EVENT.DURATIONS.2_DAYS' },
  { id: '3_days', labelKey: 'ADD_EVENT.DURATIONS.3_DAYS' },
  { id: '4_days', labelKey: 'ADD_EVENT.DURATIONS.4_DAYS' },
  { id: '5_days', labelKey: 'ADD_EVENT.DURATIONS.5_DAYS' },
  { id: '6_days', labelKey: 'ADD_EVENT.DURATIONS.6_DAYS' },
  { id: '7_days', labelKey: 'ADD_EVENT.DURATIONS.7_DAYS' },
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
    this.isSubmitted.set(false);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}