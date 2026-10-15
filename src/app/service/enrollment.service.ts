import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { EnrollGQL, UnenrollGQL } from '../core/graphql/services.private';
import { Enrollment, GenericStatus } from '../core/graphql/types';
import { AuthService } from './auth.service';
import { USER_ROLES } from '../config/roles.config';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly enrollGQL = inject(EnrollGQL);
  private readonly unenrollGQL = inject(UnenrollGQL);
  private readonly authService = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storageKey = 'volunteerio_enrolled_events';

  readonly enrolledEventIds = signal<Set<string>>(this.loadInitial());
  readonly isEnrolling = signal<boolean>(false);
  readonly isUnenrolling = signal<boolean>(false);

  isVolunteer(): boolean {
    return this.authService.hasRole(USER_ROLES.VOLUNTEER);
  }

  isEnrolled(eventId: string): boolean {
    return this.enrolledEventIds().has(eventId);
  }

  async enrollToEvent(eventId: string): Promise<Enrollment> {
    await this.ensureVolunteer();
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

  async unenrollFromEvent(eventId: string): Promise<void> {
    await this.ensureVolunteer();
    if (!this.isEnrolled(eventId)) return;

    this.isUnenrolling.set(true);
    try {
      const res = await firstValueFrom(
        this.unenrollGQL.mutate({ variables: { input: { eventId } } }),
      );
      if (res.data?.unenroll?.status !== GenericStatus.Ok) {
        throw new Error('HOME_AUTH.MODAL.ERRORS.GENERIC');
      }
      this.unmarkEnrolled(eventId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('E404_005') || /not found/i.test(msg)) {
        this.unmarkEnrolled(eventId);
      }
      throw err;
    } finally {
      this.isUnenrolling.set(false);
    }
  }

  private async ensureVolunteer(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      await this.authService.login();
      throw new Error('HOME_AUTH.MODAL.ERRORS.AUTH_REQUIRED');
    }
    if (!this.isVolunteer()) throw new Error('HOME_AUTH.MODAL.ERRORS.VOLUNTEER_ONLY');
  }

  private updateStorage(updater: (set: Set<string>) => void): void {
    const next = new Set(this.enrolledEventIds());
    updater(next);
    this.enrolledEventIds.set(next);
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify([...next]));
    }
  }

  private markEnrolled(id: string): void {
    this.updateStorage((set) => set.add(id));
  }

  private unmarkEnrolled(id: string): void {
    this.updateStorage((set) => set.delete(id));
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
