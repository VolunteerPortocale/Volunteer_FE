import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { EnrollGQL } from '../core/graphql/services.private';
import { Enrollment } from '../core/graphql/types';
import { AuthService } from './auth.service';
import { USER_ROLES } from '../config/roles.config';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly enrollGQL = inject(EnrollGQL);
  private readonly authService = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storageKey = 'volunteerio_enrolled_events';

  readonly enrolledEventIds = signal<Set<string>>(this.loadInitial());
  readonly isEnrolling = signal<boolean>(false);

  isVolunteer(): boolean {
    return this.authService.hasRole(USER_ROLES.VOLUNTEER);
  }

  isEnrolled(eventId: string): boolean {
    return this.enrolledEventIds().has(eventId);
  }

  async enrollToEvent(eventId: string): Promise<Enrollment> {
    if (!this.authService.isAuthenticated()) {
      await this.authService.login();
      throw new Error('HOME_AUTH.MODAL.ERRORS.AUTH_REQUIRED');
    }
    if (!this.isVolunteer()) throw new Error('HOME_AUTH.MODAL.ERRORS.VOLUNTEER_ONLY');
    if (this.isEnrolled(eventId)) throw new Error('HOME_AUTH.MODAL.ERRORS.ALREADY_ENROLLED');

    this.isEnrolling.set(true);
    try {
      const res = await firstValueFrom(
        this.enrollGQL.mutate({ variables: { input: { eventId } } }),
      );
      const enrollment = res.data?.enroll as Enrollment | undefined;
      if (!enrollment) throw new Error('HOME_AUTH.MODAL.ERRORS.GENERIC');

      this.markEnrolled(eventId);
      return enrollment;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('E409_004') || /conflict/i.test(msg)) {
        this.markEnrolled(eventId);
        throw new Error('HOME_AUTH.MODAL.ERRORS.ALREADY_ENROLLED', { cause: err });
      }
      throw err;
    } finally {
      this.isEnrolling.set(false);
    }
  }

  private markEnrolled(id: string): void {
    const next = new Set(this.enrolledEventIds()).add(id);
    this.enrolledEventIds.set(next);
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify([...next]));
    }
  }

  private loadInitial(): Set<string> {
    if (!this.isBrowser) return new Set();
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }
}
