import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EventService, EventItem } from '../../service/event.service';
import { EnrollmentService } from '../../service/enrollment.service';
import { TranslationService } from '../../service/translation.service';
import { TranslatePipe } from '../../common/pipes/translate-pipe';
import { FooterComponent } from '../../common/components/footer/footer';
import { GetLastThreeActiveEventsGQL } from '../../core/graphql/services.public';
import { EventFileType } from '../../core/graphql/types';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [RouterLink, DatePipe, MatIconModule, TranslatePipe, FooterComponent],
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.scss',
})
export class MyProjectsComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly translationService = inject(TranslationService);
  private readonly getLastThreeActiveEventsGQL = inject(GetLastThreeActiveEventsGQL);
  private readonly destroyRef = inject(DestroyRef);

  private readonly gqlEvents = signal<EventItem[]>([]);
  readonly selectedEvent = signal<EventItem | null>(null);

  readonly enrolledEvents = computed(() => {
    const enrolledIds = this.enrollmentService.enrolledEventIds();
    const all = [...this.eventService.events(), ...this.gqlEvents()];

    const seen = new Set<string>();
    return all.filter((event) => {
      if (!event.id || seen.has(event.id) || !enrolledIds.has(event.id)) {
        return false;
      }
      seen.add(event.id);
      return true;
    });
  });

  ngOnInit(): void {
    this.getLastThreeActiveEventsGQL
      .watch({ fetchPolicy: 'cache-first' })
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        const events = result.data?.getLastThreeActiveEvents ?? [];
        const spotsTemplate = this.translationService.translate('HOME_AUTH.SPOTS_AVAILABLE');

        const mapped: EventItem[] = events
          .filter((e): e is NonNullable<typeof e> & { details: NonNullable<NonNullable<typeof e>['details']> } => !!e?.details)
          .map((e) => {
            const details = e.details;
            const cover = e.files?.find((f) => f.type === EventFileType.Cover);
            const total = details.nrVolunteers ?? 0;
            const spotsOccupied = spotsTemplate.includes('{total}')
              ? spotsTemplate.replace('{total}', String(total))
              : `${total}`;

            return {
              id: e.id ?? '',
              title: details.title ?? '',
              description: details.description ?? '',
              startDateTime: details.startTime ?? '',
              endDateTime: details.endTime ?? undefined,
              location: details.location || '',
              volunteers: total,
              organization: '',
              email: details.contactEmail ?? undefined,
              phone: details.contactPhone ?? undefined,
              dressCode: details.dressCode ? `ADD_EVENT.DRESS_CODES.${details.dressCode.toUpperCase()}` : '',
              duration: '',
              contactMethod: 'email',
              eventTypes: [e.category ? e.category.toLowerCase() : 'all'],
              categoryTagKey: `PROFILE.TAGLINE_CATEGORY.${e.category}`,
              spotsOccupied,
              imageUrl: cover?.id
                ? `${environment.apiUrl}/v1/files/${cover.id}/content`
                : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
            };
          });
        this.gqlEvents.set(mapped);
      });
  }

  readonly isUnenrolling = this.enrollmentService.isUnenrolling;

  viewEvent(event: EventItem): void {
    this.selectedEvent.set(event);
  }

  closeModal(): void {
    this.selectedEvent.set(null);
  }

  async unenroll(eventId: string): Promise<void> {
    try {
      await this.enrollmentService.unenrollFromEvent(eventId);
      this.closeModal();
    } catch (err: unknown) {
      console.error('Failed to unenroll from event', err);
    }
  }
}
