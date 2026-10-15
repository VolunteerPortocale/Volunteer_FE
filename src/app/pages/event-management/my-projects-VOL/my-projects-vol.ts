import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { EnrollmentService } from '../../../service/enrollment.service';
import { TranslatePipe } from '../../../common/pipes/translate-pipe';
import { FooterComponent } from '../../../common/components/footer/footer';
import {
  GetAllEventsGQL,
  GetAllEventsQuery,
  GetEventByIdGQL,
} from '../../../core/graphql/services.private';
import { EventFileType, EnrollmentStatus, Enrollment } from '../../../core/graphql/types';
import { environment } from '../../../../environments/environment';

type VolEvent = GetAllEventsQuery['getAllEvents'][number];

type EnrolledEventItem = {
  event: VolEvent;
  enrollmentStatus: EnrollmentStatus;
  enrollmentId?: string;
};

@Component({
  selector: 'app-my-projects-vol',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    FooterComponent,
  ],
  templateUrl: './my-projects-vol.html',
  styleUrl: './my-projects-vol.scss',
})
export class MyProjectsVolComponent implements OnInit {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly getAllEventsGQL = inject(GetAllEventsGQL);
  private readonly getEventByIdGQL = inject(GetEventByIdGQL);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  private readonly backendEvents = signal<VolEvent[]>([]);
  readonly selectedEvent = signal<EnrolledEventItem | null>(null);

  readonly enrolledEvents = computed<EnrolledEventItem[]>(() => {
    const enrolledIds = this.enrollmentService.enrolledEventIds();
    const userEnrollments = this.enrollmentService.userEnrollments();
    const enrollmentMap = new Map<string, Enrollment>();
    for (const enr of userEnrollments) {
      enrollmentMap.set(enr.eventId, enr);
    }

    const all = this.backendEvents();
    const seen = new Set<string>();
    const result: EnrolledEventItem[] = [];

    for (const event of all) {
      if (!event.id || seen.has(event.id) || !enrolledIds.has(event.id)) {
        continue;
      }
      seen.add(event.id);

      const enr = enrollmentMap.get(event.id);
      result.push({
        event,
        enrollmentStatus: enr?.status ?? EnrollmentStatus.Enrolled,
        enrollmentId: enr?.id,
      });
    }

    return result;
  });

  readonly isUnenrolling = this.enrollmentService.isUnenrolling;

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);

    try {
      // 1. Fetch current user's enrollments from backend
      await this.enrollmentService.fetchCurrentUserEnrollments();

      // 2. Fetch all published events from backend
      this.getAllEventsGQL
        .watch({ fetchPolicy: 'network-only' })
        .valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: async (res) => {
            const rawEvents = (res.data?.getAllEvents ?? []) as VolEvent[];
            this.backendEvents.set(rawEvents);

            // 3. For any enrolled eventId not present in getAllEvents, load via getEventById
            const enrolledIds = this.enrollmentService.enrolledEventIds();
            const existingIds = new Set(rawEvents.map((m) => m.id));

            for (const id of enrolledIds) {
              if (!existingIds.has(id)) {
                try {
                  const singleRes = await firstValueFrom(
                    this.getEventByIdGQL.fetch({
                      variables: { id },
                      fetchPolicy: 'cache-first',
                    })
                  );
                  const single = singleRes.data?.getEventById as VolEvent | undefined;
                  if (single) {
                    this.backendEvents.update((prev) => [single, ...prev]);
                  }
                } catch (singleErr) {
                  console.warn(`Could not fetch details for event ${id}:`, singleErr);
                }
              }
            }

            this.isLoading.set(false);
          },
          error: (err) => {
            console.warn('Could not load backend events:', err);
            this.isLoading.set(false);
          },
        });
    } catch (err) {
      console.warn('Failed to initialize volunteer projects from backend:', err);
      this.isLoading.set(false);
    }
  }

  getCoverImageUrl(event: VolEvent): string {
    const cover = event.files?.find((f) => f.type === EventFileType.Cover);
    return cover?.id
      ? `${environment.apiUrl}/v1/files/${cover.id}/content`
      : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
  }

  viewEvent(item: EnrolledEventItem): void {
    this.selectedEvent.set(item);
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

export { MyProjectsVolComponent as MyProjectsComponent };
export { MyProjectsVolComponent as MyProjectsVOLComponent };
