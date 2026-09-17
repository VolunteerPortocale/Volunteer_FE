import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type ContactMethod = 'email' | 'phone' | 'both';

export const EVENT_TYPES = [
  'Evenimente și Festivaluri',
  'Strângeri de Fonduri și Sport',
  'Sănătate și Ajutor Umanitar',
  'Muncă Ecologică',
];

export const DRESS_CODES = ['Casual', 'Formal'];

export const DURATIONS = [
  'O zi',
  'Două zile',
  'Trei zile',
  'Patru zile',
  'Cinci zile',
  'Șase zile',
  'Șapte zile',
];

@Component({
  selector: 'app-add-event',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './add-event.html',
  styleUrl: './add-event.scss'
})
export class AddEventComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly eventTypesList = EVENT_TYPES;
  readonly dressCodesList = DRESS_CODES;
  readonly durationsList = DURATIONS;

  // Reactive state using Signals
  readonly isSubmitted = signal<boolean>(false);
  readonly selectedEventTypes = signal<string[]>([]);
  readonly selectedDressCode = signal<string>('Casual');
  readonly selectedDuration = signal<string>('O zi');
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
    phone: ['+373 69 000 000']
  });

  toggleEventType(type: string): void {
    const current = this.selectedEventTypes();
    if (current.includes(type)) {
      this.selectedEventTypes.set(current.filter((t) => t !== type));
    } else {
      this.selectedEventTypes.set([...current, type]);
    }
  }

  setDressCode(code: string): void {
    this.selectedDressCode.set(code);
  }

  setDuration(duration: string): void {
    this.selectedDuration.set(duration);
  }

  setContactMethod(method: ContactMethod): void {
    this.selectedContactMethod.set(method);
  }

  get formattedDateSummary(): string {
    const start = this.eventForm.value.startDateTime;
    const end = this.eventForm.value.endDateTime;
    if (!start) return '';
    const startDate = new Date(start).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' });
    if (!end) return startDate;
    const endDate = new Date(end).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' });
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
      contactMethod: this.selectedContactMethod()
    };

    console.log('Event to publish:', payload);
    this.isSubmitted.set(true);
  }

  resetForm(): void {
    this.eventForm.reset({
      volunteers: 10,
      email: 'contact@ong.ro',
      phone: '+373 67 676 767'
    });
    this.selectedEventTypes.set([]);
    this.selectedDressCode.set('Casual');
    this.selectedDuration.set('O zi');
    this.selectedContactMethod.set('email');
    this.isSubmitted.set(false);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}